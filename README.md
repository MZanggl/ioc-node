> Zero dependency IOC container for Node

# Installation

> `npm install ioc-node`

# Instantiate

```javascript
// index.js

global.ioc = require('ioc-node')(__dirname)
```

## Usage

Imagine the following class

```javascript
class UserService {
    constructor(database) {
        this.database = database
    }
}
```

You can inject dependencies using

```javascript
ioc.bind('userService', () => new UserService(new Database))
```

and later make use of the binding with

```javascript
ioc.use('userService').create({ id: 1})
```

If you don't want to create a new instance every time you use `ioc.use`, create the binding with `ioc.singleton` instead of `ioc.bind`.

```javascript
ioc.singleton('userService', () => new UserService(new Database))

ioc.use('userService').create({ id: 1})
ioc.use('userService').create({ id: 2}) // uses same instance
```

## Faking
You can easily fake bindings in your tests!

```javascript
class TestableDatabase {
    insert() { return true }
}

ioc.fake('userService', () => new UserService(new TestableDatabase))

const userService = ioc.use('userService')
// assert...

ioc.restore('userService') // remove the fake again
```

## Global Require
The `use` method can also require files globally from any point in the app.

```javascript
const User = ioc.use('app/models/User')
```

## Automatic Injection
It might be cumbersome to always add bindings, that's why ioc-node also supports automatic injection. Since there are no static types we have to workaround a little to get this working.

Instead of registering bindings in the service provider using `ioc.bind('userService', () => new UserService(new Database))`, you can link to the dependency directly in the class

```javascript
// App/Services/UserService
class UserService {
    static get inject() {
        return ['path/to/Database']
    }

    constructor(database) {
        this.database = database
    }
}
```

And instead of newing up the class manually, we do

```javascript
const userService = ioc.make('App/Services/UserService') // will use ioc.use to resolve dependency
```

or 

```javascript
const UserService = ioc.use('App/Services/UserService')
const userService = ioc.make(UserService)
```

You can also pass additional arguments to the constructor

```javascript
const userService = ioc.make('App/Services/UserService', 1, 2, 3, 4)
```

## Faking Automatic Injection

In the above case, you can still use `ioc.fake` to provide a fake database or a fake userService since `ioc.make('App/Services/UserService')` uses `ioc.use` under the hood. In addition, every auto injected dependencies (e.g. "path/to/Database") also gets resolved using `ioc.use`.

Alternatively you can just new up an instance of the class manually.

```javascript
const UserService = ioc.use('App/Services/UserService')
class TestableDatabase {
    insert() { return true }
}

const userService = new UserService(new TestableDatabase))
```

## Aliases

When using `ioc.bind` or `ioc.singleton` we can access the bindings using the key we provide. Global requires and automatic injections don't provide that flexibility out of the box. 
Say the file `Cache.js` is inside `App/Utils/`. You have to require it using `ioc.use('App/Utils/Cache')`, while you might actually want to do `ioc.use('Cache')`.

For this you can use aliases.

```javascript
// in service provider
ioc.alias('Cache', 'App/Utils/Cache')

// anywhere
const cache = ioc.make('Cache')
//or
const Cache = ioc.use('Cache')
```

We can also use the alias for automatic injections.

```javascript
class UserService {
    static get inject() {
        return ['Cache']
    }

    // ...
}
```

## How ioc.use resolves dependencies
1. Look in fakes (`ioc.fake`)
2. Look in container (`ioc.bind` / `ioc.singleton`)
3. Look in aliases (`ioc.alias`)
    1. Repeat process with resolved name
4. Native require from root of the project

## Creating Providers
If you extract code into separate npm modules, you can create a provider that can be easily consumed by the ioc container.

Say you have the following module

```javascript
class StringTransformer {
    toUpperCase(value) {
        return value.toUpperCase()
    }
}

module.exports = StringTransformer
```

In the same module, you can create a provider like this

```javascript
class StringTransformerProvider {
    register(ioc, namespace) {
        ioc.singleton(namespace, () => new StringTransformer)
    }
}

module.exports = StringTransformerProvider
```

and inside the service provider of your app, you can consume this provider

```javascript
ioc.consume('App/StringTransformer', StringTransformerProvider)
```
> Zero dependency IOC container for Node

# Installation

> `npm install ioc-node`

# Instantiate

```javascript
// index.js

global.ioc = require('ioc-node')(__dirname)
```

## Usage

```javascript
ioc.bind('userService', () => new UserService(new Database))
```

and make use of the binding with

```javascript
ioc.use('userService').create({ id: 1})
```

If you don't want to create a new instance every time you use `ioc.use`, use `ioc.singleton` instead of `ioc.bind`.

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
```

After running your tests, use `ioc.restore('userService')` to remove the fake.

## Global Require
The `use` method can also require files globally from any point in the app.

```javascript
const User = ioc.use('app/models/User')
```

## Automatic Injection

It might be cumbersome to always add bindings, that's why node-ioc also supports automatic injection. Since there are no static types we have to workaround a little to get this working.

Instead of registering bindings in the  service provider using `ioc.bind('userService', () => new UserService(new Database))`, you can link to the dependency directly in the class

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
const userService = ioc.make('App/Services/UserService')
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

In the above case, you can still use `ioc.fake` to provide a fake database.

Alternatively you can just new up an instance of the class manually.

```javascript
const UserService = ioc.use('App/Services/UserService')
class TestableDatabase {
    insert() { return true }
}

const userService = new UserService(new TestableDatabase))
```
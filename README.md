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
You can require files globally from any point in the app with `ioc.require`.

```javascript
const User = ioc.require('app/models/User')
```
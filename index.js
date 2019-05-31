const path = require('path')

module.exports = function createIoC(rootPath) {
    return {
        _container: new Map,
        _fakes: new Map,
        _aliases: new Map,
        consume(namespace, Provider) {
            if (!namespace) {
                throw new Error('namespace not provided')
            }

            const provider = new Provider
            if (!provider.register) {
                throw new Error('register method not found on provider')
            }

            provider.register(this, namespace)
        },
        bind(key, callback) {
            this._container.set(key, {callback, singleton: false})
        },
        singleton(key, callback) {
            this._container.set(key, {callback, singleton: true})
        },
        fake(key, callback) {
            const item = this._container.get(key)
            this._fakes.set(key, {callback, singleton: item ? item.singleton : false})
        },
        alias(key, pathToResolve) {
            this._aliases.set(key, pathToResolve)
        },
        restore(key) {
            this._fakes.delete(key)
        },
        _findInContainer(namespace) {
            if (this._fakes.has(namespace)) {
                return this._fakes.get(namespace)
            }

            return this._container.get(namespace)
        },
        use(namespace) {
            const item = this._findInContainer(namespace)

            if (!item && this._aliases.has(namespace)) {
                return this.use(this._aliases.get(namespace))
            }

            if (item) {
                if (item.singleton && !item.instance) {
                    item.instance = item.callback()
                }
                return item.singleton ? item.instance : item.callback()
            }

            return require(path.join(rootPath, namespace))
        },
        make(object, ...argsAfterInjections) {
            if (typeof object === 'string') {
                object = this.use(object)
            }

            if (typeof object !== 'function') {
                return object
            }

            if (!Array.isArray(object.inject)) {
                return new object
            }

            const dependencies = object.inject.map(path => this.make(this.use(path)) )

            return new object(
                ...dependencies,
                ...argsAfterInjections
            )
        }
    }
}
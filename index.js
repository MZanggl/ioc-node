const path = require('path')

module.exports = function createIoC(rootPath) {
    return {
        _container: new Map,
        _fakes: new Map,
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

            if (!Array.isArray(object.inject)) {
                return new object
            }

            const args = object.inject.map(path => {
                const requiredFile = this.use(path)
                if (typeof requiredFile !== 'function') {
                    return requiredFile
                }

                return this.make(requiredFile)
            })

            return new object(
                ...args,
                ...argsAfterInjections
            )
        }
    }
}
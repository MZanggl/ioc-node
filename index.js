const path = require('path')

module.exports = function createIoC(rootPath) {
    return {
        container: new Map,
        fakes: new Map,
        bind(key, callback) {
            this.container.set(key, {callback, singleton: false})
        },
        singleton(key, callback) {
            this.container.set(key, {callback, singleton: true})
        },
        fake(key, callback) {
            const item = this.container.get(key)
            
            if (!item) {
                throw new Error('item not in ioc container')
            }
    
            this.fakes.set(key, {callback, singleton: item.singleton})
        },
        restore(key) {
            this.fakes.delete(key)
        },
        use(namespace) {
            let item = this.container.get(namespace)
            
            if (item) {
                if (this.fakes.has(namespace)) {
                    item = this.fakes.get(namespace)
                }
        
                if (item.singleton && !item.instance) {
                    item.instance = item.callback()
                }
        
                return item.singleton ? item.instance : item.callback()
            }

            return require(path.join(rootPath, namespace))
        }
    }
}
class InjectsSimpleClass {

    static get inject() {
        return ['test/modules/SimpleClass']
    }

    constructor(simpleClass, ...restOfArgs) {
        this.simpleClass = simpleClass
        this.restOfArgs = restOfArgs
    }

    get() {
        return this.simpleClass.get()
    }
}

module.exports = InjectsSimpleClass
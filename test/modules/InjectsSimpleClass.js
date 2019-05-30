class InjectsSimpleClass {

    static get inject() {
        return ['test/modules/SimpleClass']
    }

    constructor(simpleClass, ...restOfArgs) {
        this.simpleClass = simpleClass
        this.restOfArgs = restOfArgs
    }
}

module.exports = InjectsSimpleClass
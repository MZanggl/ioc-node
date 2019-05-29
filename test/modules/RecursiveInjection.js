class RecursiveInjection {

    static get inject() {
        return ['test/modules/InjectsSimpleClass']
    }

    constructor(injectsSimpleClass) {
        this.injectsSimpleClass = injectsSimpleClass
    }

    get() {
        return this.injectsSimpleClass.get()
    }
}

module.exports = RecursiveInjection
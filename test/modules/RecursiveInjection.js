class RecursiveInjection {

    static get inject() {
        return ['test/modules/InjectsSimpleClass']
    }

    constructor(injectsSimpleClass) {
        this.injectsSimpleClass = injectsSimpleClass
    }
}

module.exports = RecursiveInjection
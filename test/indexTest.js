const chai = require('chai')
const expect = chai.expect

let ioc
beforeEach(function() {
    ioc = require('../index')(__dirname + '/..')
})

describe('bind, singleton and use', function () {
    it('should be able to use bound keys', function () {
        class TestClass {}
        ioc.bind('Test', () => new TestClass)

        expect(ioc.use('Test')).to.be.instanceOf(TestClass)
    })

    it('should create new instance every time you use bound class', function () {
        class TestClass {}
        ioc.bind('Test', () => new TestClass)

        ioc.use('Test').count = 1
        expect(ioc.use('Test').count).to.equal(undefined)
    })

    it('should use same instance every time you use singleton', function () {
        class TestClass {}
        ioc.singleton('Test', () => new TestClass)

        ioc.use('Test').count = 1
        expect(ioc.use('Test').count).to.equal(1)
    })
})

describe('faking', function () {
    it('should use fake instead of actual binding', function () {
        class TestClass {}
        class FakeTestClass {}

        ioc.bind('Test', () => new TestClass)
        ioc.fake('Test', () => new FakeTestClass)

        expect(ioc.use('Test')).to.be.instanceOf(FakeTestClass)
    })

    it('should use real binding after restoring', function () {
        class TestClass {}
        class FakeTestClass {}

        ioc.bind('Test', () => new TestClass)
        ioc.fake('Test', () => new FakeTestClass)
        ioc.restore('Test')

        expect(ioc.use('Test')).to.be.instanceOf(TestClass)
    })
})

describe('root require', function () {
    it('should require file from root', function () {
       const result = ioc.use('test/modules/file')
       expect(result).to.equal(1)
    })

    it('should be able to fake require file from root', function () {
        ioc.fake('test/modules/file', () => 'fake')

       const result = ioc.use('test/modules/file')
       ioc.restore('test/modules/file')
       expect(result).to.equal('fake')
    })
})

describe('auto injection', function() {
    
    it('can use classes that dont come with auto injections', function() {
        const SimpleClass = ioc.use('test/modules/SimpleClass')
        const test = ioc.make(SimpleClass)
        expect(test).to.be.instanceOf(SimpleClass)
    })

    it('can make classes using the filepath instead of the class declaration', function() {
        const test = ioc.make('test/modules/SimpleClass')
        expect(test).to.be.instanceOf(ioc.use('test/modules/SimpleClass'))
    })

    it('should auto inject classes found in static inject', function() {
        const injectsSimpleClass = ioc.make('test/modules/InjectsSimpleClass')
        expect(injectsSimpleClass.simpleClass).to.be.instanceOf(ioc.use('test/modules/SimpleClass'))
    })

    it('should auto inject recursively', function() {
        const recursiveInjection = ioc.make('test/modules/RecursiveInjection')
        expect(recursiveInjection.injectsSimpleClass.simpleClass).to.be.instanceOf(
            ioc.use('test/modules/SimpleClass')
        )
    })

    it('should be possible to pass additional arguments', function() {
        const test = ioc.make('test/modules/InjectsSimpleClass', 1, 2, 3)
        expect(test.restOfArgs).to.deep.equal([1,2,3])
    })

    it('should be able to fake injected dependency', function() {
        class TestableSimpleClass {}

        ioc.fake('test/modules/SimpleClass', () => new TestableSimpleClass)
        const injectsSimpleClass = ioc.make('test/modules/InjectsSimpleClass')
        ioc.restore('test/modules/SimpleClass')

        expect(injectsSimpleClass.simpleClass).to.be.instanceOf(TestableSimpleClass)
    })
})

describe('alias', function() {
    it('can use alias to make class', function() {
        ioc.alias('SimpleClass', 'test/modules/SimpleClass')
        const simpleClass = ioc.make('SimpleClass')
        expect(simpleClass).to.be.instanceOf(ioc.use('SimpleClass'))
    })

    it('can alias global requires', function() {
        ioc.alias('SimpleClass', 'test/modules/SimpleClass')
        const SimpleClass = ioc.use('SimpleClass')
        const test = new SimpleClass
        expect(test).to.be.instanceOf(SimpleClass)
    })

    it('favors fakes over aliases', function() {
        class TestableSimpleClass {}

        ioc.alias('SimpleClass', 'test/modules/SimpleClass')
        ioc.fake('SimpleClass', () => new TestableSimpleClass)

        const test = ioc.make('SimpleClass')
        expect(test).to.be.instanceOf(TestableSimpleClass)
    })
})

describe('consume', function() {
    it('should be able to consume providers', function() {
        class TestClass {}
        class TestProvider {
            register(ioc, namespace) {
                ioc.bind(namespace, () => new TestClass)
            }
        }

        ioc.consume('Test', TestProvider)

        expect(ioc.use('Test')).to.be.instanceOf(TestClass)
    })

    it('should crash when provider does not have register method', function() {
        class TestProvider {}

        expect(() => ioc.consume('Test', TestProvider)).to.throw('register method not found on provider')
    })

    it('should crash when namespace not provided', function() {
        class TestProvider {}

        expect(() => ioc.consume(null, TestProvider)).to.throw('namespace not provided')
    })
})
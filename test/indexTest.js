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
       const result = ioc.use('test/deeply/nested/file')
       expect(result).to.equal(1)
    })
})
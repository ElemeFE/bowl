import * as utils from '../../../src/utils'

describe('utils', () => {
  it('can tell if a variable is instance of `Object` properly', () => {
    const obj = { foo: 'bar' }
    const arr = [ 1, 2, 3 ]
    const primary = 123

    expect(utils.isObject(obj)).toBe(true)
    expect(utils.isObject(arr)).toBe(false)
    expect(utils.isObject(primary)).toBe(false)
  })

  it('can tell if a variable is instanceof `String` properly', () => {
    const arr = [ 1, 2, 3 ]
    const obj = { foo: 'bar' }
    const primary = 123
    const str = 'string'

    expect(utils.isString(arr)).toBe(false)
    expect(utils.isString(obj)).toBe(false)
    expect(utils.isString(primary)).toBe(false)
    expect(utils.isString(str)).toBe(true)
  })

  it('can tell if a variable is instance of `Array` properly', () => {
    const arr = [ 1, 2, 3 ]
    const obj = { foo: 'bar' }
    const primary = 123

    expect(utils.isArray(arr)).toBe(true)
    expect(utils.isArray(obj)).toBe(false)
    expect(utils.isArray(primary)).toBe(false)
  })

  it('can tell if a path is an complete url', () => {
    const absolute1 = 'http://foo.com/bar'
    const absolute2 = 'https://foo.com/bar'
    const absolute3 = '//foo.com/bar'
    const relative1 = 'foo/bar'
    const relative2 = '/foo/bar/'

    expect(utils.isUrl(absolute1)).toBe(true)
    expect(utils.isUrl(absolute2)).toBe(true)
    expect(utils.isUrl(absolute3)).toBe(true)
    expect(utils.isUrl(relative1)).toBe(false)
    expect(utils.isUrl(relative2)).toBe(false)
  })

  it('can clone and return an object', () => {
    const obj = {
      foo: 'bar',
      baz: {
        a: 1,
        b: {
          c: [1, 2]
        }
      }
    }
    const result = utils.clone(obj)

    expect(result === obj).toBe(false)
    expect(result.foo === obj.foo).toBe(true)
    expect(result.baz === obj.baz).toBe(false)
    expect(result.baz.a === obj.baz.a).toBe(true)
    expect(result.baz.b === obj.baz.b).toBe(false)
    expect(result.baz.b.c === obj.baz.b.c).toBe(false)
    expect(result.baz.b.c[0] === obj.baz.b.c[0]).toBe(true)
    expect(result.baz.b.c[1] === obj.baz.b.c[1]).toBe(true)
  })

  it('can merge `target` with `source` and return a new object', () => {
    const target = {
      foo: 'bar'
    }
    const source = {
      baz: {
        a: 1,
        b: 2
      }
    }
    const result = utils.merge(target, source)

    expect(result.foo).toBe('bar')
    expect(result.baz.a).toBe(1)
    expect(result.baz.b).toBe(2)
  })

  it('can tell if two urls are cross-origin', () => {
    // TODO: make test urls host-depend free
    const a = 'http://127.0.0.1:8080/assets/app.js'
    const b = 'https://127.0.0.1:8080/assets/app.js'
    const c = 'http://localhost:8080/assets/app.js'
    const d = 'http://127.0.0.1/assets/app.js'
    const e = 'http://127.0.0.1:8080/foo/app.js'
    const f = '/assets/app.js'
    const g = 'bowl.js.com/assets/app.js'
    const h = 'http://bowl.js.com/assets/app.js'
    const i = 'https://bowl.js.com/assets/app.js'

    expect(utils.isCrossOrigin(a, b)).toBe(true)
    expect(utils.isCrossOrigin(a, c)).toBe(true)
    expect(utils.isCrossOrigin(a, d)).toBe(true)
    expect(utils.isCrossOrigin(a, e)).toBe(false)
    expect(utils.isCrossOrigin(a, f)).toBe(false)
    expect(utils.isCrossOrigin(h, g)).toBe(false)
    expect(utils.isCrossOrigin(i, g)).toBe(false)
  })

  it('can set data object to localStorage and get it and remove it by key', () => {
    const o = {
      key: 'test',
      content: 'test content'
    }
    utils.set('test', o)
    const local = utils.get('test')
    expect(local.key).toBe('test')
    expect(local.content).toBe('test content')
    utils.remove('test')
    expect(utils.get('test')).toBe(null)
  })

  it('can get an array of data object from localStorage', () => {
    const arr = [{
      key: 'foo',
      content: 'foo content'
    }, {
      key: 'bar',
      content: 'bar content'
    }]
    utils.set(arr[0].key, arr[0])
    utils.set(arr[1].key, arr[1])
    const local = utils.get(['foo', 'bar'])
    expect(local[0].key).toBe('foo')
    expect(local[0].content).toBe('foo content')
    expect(local[1].key).toBe('bar')
    expect(local[1].content).toBe('bar content')
    utils.remove('foo')
    utils.remove('bar')
  })
})

window.aFlag = 0
window.bFlag = 0
window.cFlag = 0

describe('bowl instance', () => {
  let bowl = new Bowl()

  beforeEach(() => {
    bowl = new Bowl()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('config method', () => {
    it('merge custom configure with the default configure by `config` method', () => {
      bowl.configure({
        timeout: 10000
      })
      expect(bowl.config.timeout).to.be(10000)
    })
  })

  describe('add method', () => {
    it('adds `scripts` to bowl.ingredient', () => {
      bowl.add({
        key: 'a',
        url: 'assets/a.js'
      })
      expect(bowl.ingredients.length).to.be(1)
    })

    it('jumps out of `bowl.add` if the param is neither array nor object', () => {
      bowl.add('assets/a.js')
      expect(bowl.ingredients.length).to.be(0)
    })

    it('uses `key` if provided', () => {
      bowl.add({ url: 'assets/a.js', key: 'a' })
      expect(bowl.ingredients[0].key).to.be('bowl-a')
    })

    it('overwrites the older ingredient if two ingredients have a same key', () => {
      bowl.add({ url: 'assets/a.js', key: 'test' })
      bowl.add({ url: 'assets/b.js', key: 'test' })
      expect(bowl.ingredients.length).to.be(1)
      expect(/b\.js$/.test(bowl.ingredients[0].url)).to.be(true)
    })
  })

  describe('remove method', () => {
    beforeEach(() => {
      bowl.remove()
    })

    it('remove all ingredients if no params are provided', () => {
      bowl.add([
        { key: 'foo', url: 'foo' },
        { key: 'bar', url: 'bar' }
      ])
      bowl.remove()
      expect(bowl.ingredients.length).to.be(0)
      expect(localStorage.getItem('bowl-foo')).to.be(null)
      expect(localStorage.getItem('bowl-bar')).to.be(null)
    })

    it('remove the correct item(key is provided when added) out of ingredients', () => {
      bowl.add([
        { url: 'assets/app.js', key: 'app' },
        { url: 'assets/foo.js', key: 'foo' },
        { url: 'assets/bar.js', key: 'bar' }
      ])
      bowl.remove('app')
      expect(bowl.ingredients.length).to.be(2)
      expect(bowl.ingredients[0].key).to.be('bowl-foo')
      expect(bowl.ingredients[1].key).to.be('bowl-bar')
      bowl.remove(['foo'])
      expect(bowl.ingredients.length).to.be(1)
      expect(bowl.ingredients[0].key).to.be('bowl-bar')
    })
  })

  describe('inject method', () => {
    beforeEach(() => {
      window.aFlag = 0
      window.bFlag = 0
      const scripts = document.querySelectorAll('head script[defer]')
      scripts.forEach(script => {
        script.remove()
      })
    })

    it('returns false if there is no ingredients', (done) => {
      try {
        bowl.inject().then(() => {
          done()
        })
      } catch (err) {
        done(err)
      }
    })

    it('returns a promise if there is any ingredient', (done) => {
      bowl.add({ key: 'a', url: 'assets/a.js' })
      const returnValue = bowl.inject()
      expect(returnValue instanceof Promise).to.be(true)
      returnValue.then(() => done())
    })

    it('fetches the script added to bowl and save it to localStorage', (done) => {
      bowl.add({ key: 'a', url: 'assets/a.js' })
      bowl.inject().then(() => {
        if (window.aFlag === 1) {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('fetches mutiple scripts added to bowl and save them to localStorage', (done) => {
      bowl.add([
        { key: 'a', url: 'assets/a.js' },
        { key: 'b', url: 'assets/b.js' }
      ])
      bowl.inject().then(() => {
        const a = JSON.parse(localStorage.getItem('bowl-a'))
        const b = JSON.parse(localStorage.getItem('bowl-b'))
        if (a.content.trim() === 'window.aFlag++' &&
            b.content.trim() === 'window.bFlag++') {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('insert all ingredients to the page', (done) => {
      bowl.add([
        { key: 'a', url: 'assets/a.js' }
      ])
      bowl.inject().then(() => {
        if (window.aFlag === 1) {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('won\'t cache ingredient if it has `noCache` flag', (done) => {
      bowl.add({ url: 'assets/a.js', key: 'a', noCache: true })
      bowl.inject().then(() => {
        if (localStorage.getItem('bowl-a') === null && window.aFlag === 1) {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('can fetch and save cross-origin ingredient to cache', (done) => {
      const hostname = location.hostname
      const targetHostName = hostname === '127.0.0.1' ? 'localhost' : '127.0.0.1'
      bowl.add({ url: `http://${targetHostName}:8080/assets/a.js`, key: 'a' })
      bowl.inject().then(() => {
        if (window.aFlag === 1) {
          window.aFlag = 0
          done()
        } else {
          done(new Error())
        }
      })
    });

    it('can fetch and inject CSS', (done) => {
      bowl.add({ url: 'assets/style.css', key: 'style' })
      bowl.inject().then(() => {
        const container = document.getElementById('mocha')
        const fontSize = window.getComputedStyle(container).fontSize
        document.querySelector('head style').remove()
        if (fontSize === '10px') {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('injects ingredient\'s dependencies', (done) => {
      bowl.add([{
        key: 'a',
        url: 'assets/a.js',
        dependencies: ['c']
      }, {
        key: 'b',
        url: 'assets/b.js'
      }, {
        key: 'c',
        url: 'assets/c.js',
        dependencies: ['b']
      }])
      bowl.inject().then(() => {
        if (window.aFlag === 1 && window.bFlag === 1 && window.cFlag === 1) {
          done()
        } else {
          done(new Error())
        }
      })
    })
  })

  describe('expire related properties', () => {
    beforeEach(() => {
      const scripts = document.querySelectorAll('head script[defer]')
      scripts.forEach(script => {
        script.remove()
      })
    })
    afterEach(() => {
      window.aFlag = 0
      window.bFlag = 0
    })

    it('ingredients expires after `expireAfter` time passed', done => {
      bowl.add({
        url: 'assets/a.js',
        expireAfter: 500,
        key: 'test'
      })
      bowl.inject().then(() => {
        const scripts = document.querySelectorAll('head script[defer]')
        if (scripts.length !== 1) {
          done(new Error('wrong injected scripts number'))
          return
        }
        const originIngredient = JSON.parse(localStorage.getItem('bowl-test'))
        const originExpire = originIngredient.expire
        bowl.add({
          url: 'assets/a.js',
          expireAfter: 600,
          key: 'test'
        })
        bowl.inject().then(() => {
          const test = JSON.parse(localStorage.getItem('bowl-test'))
          if (test.expire !== originExpire) {
            done(new Error('ingredient shouldn\'t be replaced before `expireAfter` time'))
          }
        })
        setTimeout(() => {
          bowl.inject().then(() => {
            const test = JSON.parse(localStorage.getItem('bowl-test'))
            if (test.expire !== originExpire) {
              done()
            } else {
              done(new Error('ingredient should be replaced after `expireAfter` time'))
            }
          })
        }, 600)
      })
    })

    it('ingredients expires after `expireWhen`', done => {
      bowl.add({
        url: 'assets/a.js',
        expireWhen: (new Date()).getTime() + 500,
        key: 'test'
      })
      bowl.inject().then(() => {
        const scripts = document.querySelectorAll('head script[defer]')
        if (scripts.length !== 1) {
          done(new Error('wrong injected scripts number'))
          return
        }
        const originIngredient = JSON.parse(localStorage.getItem('bowl-test'))
        const originExpire = originIngredient.expire
        bowl.add({
          url: 'assets/a.js',
          expireWhen: (new Date()).getTime() + 600,
          key: 'test'
        })
        bowl.inject().then(() => {
          const test = JSON.parse(localStorage.getItem('bowl-test'))
          if (test.expire !== originExpire) {
            done(new Error('ingredient shouldn\'t be replaced before `expireWhen`'))
          }
        })
        setTimeout(() => {
          bowl.inject().then(() => {
            const test = JSON.parse(localStorage.getItem('bowl-test'))
            if (test.expire !== originExpire) {
              done()
            } else {
              done(new Error('ingredient should be replaced after `expireWhen`'))
            }
          })
        }, 600)
      })
    })
  })

  // describe('html tags support', (done) => {
  //   it('supports `link` tags that inject stylesheet', () => {
  //     const head = document.getElementsByTagName('head')[0]
  //     const link = document.createElement('link')
  //     link.setAttribute('bowl-url', 'assets/style.css')
  //     link.setAttribute('bowl-key', 'style')
  //     head.appendChild(link)
  //     bowl.inject().then(() => {
  //       const container = document.getElementById('mocha')
  //       const fontSize = window.getComputedStyle(container).fontSize
  //       document.querySelector('head style').remove()
  //       if (fontSize === '10px') {
  //         done()
  //       } else {
  //         done(new Error())
  //       }
  //     })
  //   })
  // })
})

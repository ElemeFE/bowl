describe('bowl instance', () => {
  let bowl = new Bowl()

  beforeEach(() => {
    bowl = new Bowl()
  })

  describe('config method', () => {
    it('merge custom configure with the default configure by `config` method', () => {
      bowl.configure({
        timeout: 10000
      });
      expect(bowl.config.timeout).to.be(10000);
    })
  })

  describe('add method', () => {
    it('adds `scripts` to bowl.ingredient', () => {
      bowl.add({ url: 'assets/app.js' })
      expect(bowl.ingredients.length).to.be(1)
    })

    it('converts url to key of the ingredient if not provided', () => {
      bowl.add({ url: 'assets/app.js' })
      expect(bowl.ingredients[0].key).to.be('bowl-assets/app.js')
    })

    it('jumps out of `bowl.add` if the param is neither array nor object', () => {
      bowl.add('assets/app.js')
      expect(bowl.ingredients.length).to.be(0)
    })

    it('uses `key` if provided', () => {
      bowl.add({ url: 'assets/app.js', key: 'app' })
      expect(bowl.ingredients[0].key).to.be('bowl-app')
    })

    it('overwrites the older ingredient if two ingredients have a same key', () => {
      bowl.add({ url: 'assets/app.js', key: 'test' })
      bowl.add({ url: 'assets/foo.js', key: 'test' })
      expect(bowl.ingredients.length).to.be(1)
      expect(/foo\.js$/.test(bowl.ingredients[0].url)).to.be(true)
    })
  })

  describe('remove method', () => {
    beforeEach(() => {
      bowl.remove()
    })

    it('remove all ingredients if no params are provided', () => {
      bowl.add([
        { url: 'foo' },
        { url: 'bar' }
      ])
      bowl.remove()
      expect(bowl.ingredients.length).to.be(0)
    })

    it('remove the correct item(key is not provided when added) out of ingredients', () => {
      bowl.add([
        { url: 'assets/app.js' },
        { url: 'assets/foo.js' },
        { url: 'assets/bar.js' }
      ])
      bowl.remove('assets/bar.js')
      expect(bowl.ingredients.length).to.be(2)
      expect(bowl.ingredients[0].key).to.be('bowl-assets/app.js')
      expect(bowl.ingredients[1].key).to.be('bowl-assets/foo.js')
      bowl.remove({ url: 'assets/app.js' })
      expect(bowl.ingredients.length).to.be(1)
      expect(bowl.ingredients[0].key).to.be('bowl-assets/foo.js')
      bowl.remove({ key: 'assets/foo.js' })
      expect(bowl.ingredients.length).to.be(0)
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
      bowl.remove({ key: 'foo' })
      expect(bowl.ingredients.length).to.be(1)
      expect(bowl.ingredients[0].key).to.be('bowl-bar')
    })

    it('`key`\'s priority is higher than `url`', () => {
      bowl.add([
        { url: 'assets/app.js' },
        { url: 'assets/foo.js' }
      ])
      bowl.remove({ url: 'assets/app.js', key: 'foo' })
      expect(bowl.ingredients.length).to.be(1)
      expect(bowl.ingredients[0].key).to.be('bowl-assets/app.js')
    })
  })

  describe('inject method', () => {
    beforeEach(() => {
      localStorage.clear()
      const scripts = document.querySelectorAll('head script[defer]')
      scripts.forEach(script => {
        script.remove()
      })
    })

    it('returns false if there is no ingredients', () => {
      expect(bowl.inject()).to.be(false)
    })

    it('returns a promise if there is any ingredient', () => {
      bowl.add({ url: 'assets/app.js' })
      expect(bowl.inject() instanceof Promise).to.be(true)
    })

    it('fetches the script added to bowl and save it to localStorage', done => {
      bowl.add({ url: 'assets/app.js' })
      bowl.inject().then(() => {
        const item = JSON.parse(localStorage.getItem('bowl-assets/app.js'))
        if (item.content.trim() === 'console.log(\'app.js\')') {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('fetches mutiple scripts added to bowl and save them to localStorage', done => {
      bowl.add([
        { url: 'assets/app.js' },
        { url: 'assets/foo.js' }
      ])
      bowl.inject().then(() => {
        const app = JSON.parse(localStorage.getItem('bowl-assets/app.js'))
        const foo = JSON.parse(localStorage.getItem('bowl-assets/foo.js'))
        if (app.content.trim() === 'console.log(\'app.js\')' &&
            foo.content.trim() === 'console.log(\'foo.js\')') {
          done()
        } else {
          done(new Error())
        }
      })
    })

    it('insert all ingredients to the page', done => {
      bowl.add([
        { url: 'assets/app.js' }
      ])
      bowl.inject().then(() => {
        const script = document.querySelector('head script[defer]')
        const text = script.innerText

        if (text.trim() === 'console.log(\'app.js\')') {
          done()
        } else {
          done(new Error())
        }
      })
    });
  })

  // describe('expire related properties', () => {
  //   beforeEach(() => {
  //     localStorage.clear()
  //     const scripts = document.querySelectorAll('head script[defer]')
  //     scripts.forEach(script => {
  //       script.remove()
  //     })
  //   })
  //
  //   it('ingredients expires after `expireAfter` time passed', done => {
  //     bowl.add({
  //       url: 'assets/app.js',
  //       expireAfter: 5 / 3600,
  //       key: 'test'
  //     })
  //     bowl.inject().then(() => {
  //       const scripts = document.querySelectorAll('head script[defer]')
  //       if (scripts.length !== 1) {
  //         done(new Error('wrong injected scripts number'))
  //         return
  //       }
  //     })
  //   })
  // });

})

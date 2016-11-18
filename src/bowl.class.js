import * as utils from './utils'

let global = window
let prefix = 'bowl-'

export default class Bowl {
  constructor() {
    this.config = {
      timeout: 60000,
      expireAfter: null,
      expireWhen: null
    }
    this.ingredients = []
  }

  /**
   * @param {Object} custom config object to be merged with the default config
   */
  configure(opts) {
    this.config = utils.merge(this.config, opts, true)
  }

  /**
   * @param {Object, Array} items to be cached, wrapped in supported object structure
   */
  add(opts) {
    if (!utils.isArray(opts)) {
      if (utils.isObject(opts)) {
        opts = [opts]
      } else {
        return
      }
    }

    /**
     * take options and return corresponding ingredient
     */
    let makeIngredient = obj => {
      obj = utils.merge(this.config, obj, true)
      const ingredient = {}
      const now = new Date().getTime()
      const isUrl = utils.isUrl(obj.url)
      ingredient.key = `${prefix}${obj.key || obj.url}`
      ingredient.expire = obj.expireAfter ? (new Date()).getTime() + obj.expireAfter : null
      // overwrites `expireAfter` if `expireWhen` is provided
      ingredient.expire = obj.expireWhen ? obj.expireWhen : ingredient.expire
      ingredient.noCache = !!obj.noCache
      ingredient.ext = obj.url.match(/.(\w+)$/)[1].trim()
      ingredient.url = isUrl ?
        obj.url :
        `${global.location.origin}/${obj.url.replace(new RegExp('^\/*'), '')}`
      return ingredient
    }

    const self = this

    let handle = obj => {
      if (!obj.url) return
      const ingredient = makeIngredient(obj)
      const existingIndexFound = this.ingredients.findIndex(item => {
        return item.key === ingredient.key
      })
      if (existingIndexFound > -1) {
        this.ingredients.splice(existingIndexFound, 1, ingredient)
        return
      }
      self.ingredients.push(ingredient)
    }

    opts.forEach(opt => handle(opt))
  }

  injectCss(path) {
    let link = null;
    if (utils.isUrl(path)) {
      link = document.createElement('link');
      link.rel = 'stylesheet'
      link.herf = path
    } else {
      link = document.createElement('style');
      link.appendChild(document.createTextNode(path));
    }
    document.getElementsByTagName('head')[0].appendChild(link)
  }

  injectJs(path) {
    let script = document.createElement('script')
    if (utils.isUrl(path)) {
      script.src = path
      document.body.appendChild(script)
    } else {
      script.defer = true
      script.text = path
      document.getElementsByTagName('head')[0].appendChild(script)
    }
  }

  itemInject(ext, path) {
    switch (ext) {
      case 'css':
        this.injectCss(path);
        break;
      case 'js':
      default:
        this.injectJs(path);
    }
  }

  inject() {
    if (!this.ingredients.length) return false
    const self = this
    const current = new Date().getTime()
    let ingredientsPromises = []
    if (!global.localStorage || !global.Promise) {
      this.ingredients.forEach(item => {
        this.itemInject(item.ext, item.url)
      })
      return
    }

    let fetch = url => {
      let xhr = new XMLHttpRequest()
      let promise = new Promise((resolve, reject) => {
        xhr.open('GET', url)
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if ((xhr.status === 200) || ((xhr.status === 0) && xhr.responseText)) {
              resolve({
                content: xhr.responseText
              })
            } else {
              reject(new Error(xhr.statusText))
            }
          }
        }
      })
      setTimeout(function () {
        if (xhr.readyState < 4) {
          xhr.abort()
        }
      }, self.config.timeout)
      xhr.send()
      return promise
    }

    let _inject = (item, resolve, reject) => {
      fetch(item.url).then(data => {
        item.content = data.content
        this.itemInject(item.ext, data.content)
        localStorage.setItem(item.key, JSON.stringify(item))
        resolve()
      }).catch(err => {
        reject()
      })
    }

    this.ingredients.forEach(item => {
      ingredientsPromises.push(new Promise((resolve, reject) => {
        if (item.noCache) {
          this.itemInject(item.ext, item.url)
          resolve()
          return
        }

        let local = JSON.parse(localStorage.getItem(item.key))

        // check local ingredient's expire property
        if (local && local.expire) {
          if (current < local.expire) {
            resolve()
            return
          } else {
            _inject(item, resolve, reject)
            return
          }
        }

        if (local && (local.url === item.url)) { // cache hit!
          this.itemInject(local.ext, local.content)
          resolve()
        } else { // fetch resource and cache ingredient
          _inject(item, resolve, reject)
        }
      }))
    })
    return Promise.all(ingredientsPromises)
  }

  remove(rule) {
    if (!rule) {
      let keys = this.ingredients.map(item => item.key)
      keys.forEach(key => this._removeStorage(key))
      this.ingredients = []
      return
    }
    let key = null
    if (utils.isString(rule)) {
      key = `${prefix}${rule}`
    } else if (utils.isObject(rule)) {
      key = `${prefix}${rule.key ? rule.key : rule.url ? rule.url : ''}`
    }
    const index = this.ingredients.findIndex(item => item.key === key)
    this.ingredients.splice(index, 1)
    localStorage.removeItem(key)
  }

  _removeStorage(key) {
    localStorage.removeItem(key)
  }

}

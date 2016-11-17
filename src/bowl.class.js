import * as utils from './utils'

let global = window
let prefix = 'bowl-'

export default class Bowl {
  constructor() {
    this.config = {
      timeout: 60000
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
        opts = [ opts ]
      } else {
        return
      }
    }
    let self = this

    let handle = obj => {
      if (!obj.url) return
      const ingredient = {}
      const now = new Date().getTime()
      const isUrl = utils.isUrl(obj.url)
      ingredient.key = `${prefix}${obj.key || obj.url}`
      ingredient.expireAfter = now + (obj.expireAfter ? obj.expireAfter : 100) * 3600 * 1000
      ingredient.expireWhen = obj.expireWhen ? obj.expireWhen : null
      ingredient.url = isUrl ?
        obj.url :
        `${global.location.origin}/${obj.url.replace(new RegExp('^\/*'), '')}`
      self.ingredients.push(ingredient)
    }

    opts.forEach(opt => handle(opt))
  }

  normalInject(url) {
    let script = document.createElement('script')
    script.src = url
    document.body.appendChild(script)
  }

  appendScript(content) {
    const script = document.createElement('script')
    script.defer = true
    script.text = content
    document.getElementsByTagName('head')[0].appendChild(script)
  }

  inject() {
    if (!this.ingredients.length) return false
    const self = this
    let ingredientsPromises = []
    if (!global.localStorage || !global.Promise) {
      this.ingredients.forEach(item => {
        this.normalInject(item.url)
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
      setTimeout(function() {
        if (xhr.readyState < 4) {
          xhr.abort()
        }
      }, self.config.timeout)
      xhr.send()
      return promise
    }
    this.ingredients.forEach(item => {
      ingredientsPromises.push(new Promise((resolve, reject) => {
        if (item.noCache) {
          this.normalInject(item.url)
          resolve()
          return
        }
        let local = localStorage.getItem(item.key)
        if (local) {
          local = JSON.parse(local)
          this.appendScript(local.content)
          resolve()
        } else {
          fetch(item.url).then(data => {
            item.content = data.content
            this.appendScript(data.content)
            localStorage.setItem(item.key, JSON.stringify(item))
            resolve()
          })
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

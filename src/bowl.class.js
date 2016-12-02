import * as utils from './utils'
import Injector from './injector/injector.class'

const global = window
const prefix = 'bowl-'
const isSystemDependencyAvailable = global.localStorage && global.Promise

export default class Bowl {
  constructor() {
    this.config = {
      timeout: 60000,
      expireAfter: null,
      expireWhen: null
    }
    this.ingredients = []
    this.injector = new Injector(this.config)
  }

  /**
   * @param {Object} custom config object to be merged with the default config
   */
  configure(opts) {
    this.config = utils.merge(this.config, opts, true)
  }

  /**
   * @param {Object, Array} items to be cached, wrapped in supported structure
   */
  add(opts) {
    if (!utils.isArray(opts)) {
      if (utils.isObject(opts)) {
        opts = [ opts ]
      } else {
        return
      }
    }

    /**
     * take options and return corresponding ingredient
     */
    const makeIngredient = (opt) => {
      const option = utils.merge(this.config, opt, true)
      const ingredient = {}
      const now = new Date().getTime()
      const isUrl = utils.isUrl(option.url)
      const extRE = /\.(\w+)(\?.+)?$/i;

      ingredient.key = `${prefix}${option.key || option.url}`

      ingredient.expireAfter = option.expireAfter
      ingredient.expireWhen = option.expireWhen

      ingredient.url = isUrl ?
        option.url :
        `${global.location.origin}/${option.url.replace(new RegExp('^\/*'), '')}`

      if (!isSystemDependencyAvailable) {
        ingredient.noCache = true
      } else {
        ingredient.noCache = !!option.noCache
        if (utils.isCrossOrigin(global.location.origin, ingredient.url)) {
          ingredient.noCache = true
        }
      }

      const match = ingredient.url.match(extRE)
      ingredient.ext = match ? match[1] : match

      return ingredient
    }

    const handle = (obj) => {
      if (!obj.url) return
      const ingredient = makeIngredient(obj)
      const existingIndexFound = this.ingredients.findIndex(item => {
        return item.key === ingredient.key
      })
      if (existingIndexFound > -1) {
        this.ingredients.splice(existingIndexFound, 1, ingredient)
        return
      }
      this.ingredients.push(ingredient)
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
    const ingredientsPromises = []

    this.ingredients.forEach(item => {
      ingredientsPromises.push(this.injector.inject(item))
    })
    return Promise.all(ingredientsPromises)
  }

  remove(rule) {
    if (!rule) {
      let keys = this.ingredients.map(item => item.key)
      keys.forEach(key => utils.remove(key))
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
    utils.remove(key)
  }

}

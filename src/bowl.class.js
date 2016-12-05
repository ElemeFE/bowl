import * as utils from './utils'
import Injector from './injector/injector.class'
import Graph from './graph.class'

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
    const ingredients = []
    Object.defineProperty(this, 'ingredients', {
      __proto__: null,
      configurable: true,
      get() {
        return ingredients
      }
    })
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
        opts = [opts]
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
      const extRE = /\.(\w+)(\?.+)?$/i

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

      ingredient.dependencies = option.dependencies

      return ingredient
    }

    const handle = (obj) => {
      if (!obj.key || !/^[a-zA-z0-9_]+$/.test(obj.key)) {
        throw new Error('invalid key of bowl ingredient')
        return
      }
      if (!obj.url) {
        throw new Error('no valid url of bowl ingredient')
        return
      }
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

  inject() {
    if (!this.ingredients.length) return false

    const ingredientsGraph = new Graph()
    this.ingredients.forEach(item => ingredientsGraph.addVertex(item.key))
    this.ingredients.forEach(item => {
      if (item.dependencies && item.dependencies.length) {
        item.dependencies.forEach(dep => {
          ingredientsGraph.addEdge(`${prefix}${dep}`, item.key)
        })
      }
    })
    const resolvedIngredients = ingredientsGraph.getBFS()

    const batchFetch = (group) => {
      const fetches = []
      group.forEach(item => {
        fetches.push(this.injector.inject(this.ingredients.find(ingredient => ingredient.key === item)))
      })
      return Promise.all(fetches)
    }

    let ret = Promise.resolve()
    resolvedIngredients.forEach(group => {
      ret = ret.then(function() {
        return batchFetch(group)
      })
    })
    return ret
  }

  remove(rule) {
    if (!rule) {
      let keys = this.ingredients.map(item => item.key)
      keys.forEach(key => this.remove(key))
      return
    }
    if (utils.isString(rule)) {
      const key = `${prefix}${rule}`
      const index = this.ingredients.findIndex(item => item.key === key)
      this.ingredients.splice(index, 1)
      utils.remove(key)
    } else if (utils.isArray(rule)) {
      const key = `${prefix}${rule.key ? rule.key : rule.url ? rule.url : ''}`
      rule.forEach(key => this.remove(key))
      return
    }
  }

}

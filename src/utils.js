const global = window

/**
 * check if the argument is an instance of Object
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * check if the argument is an instance of String
 */
export function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]'
}

/**
 * check if the argument is an instance of Array
 */
export function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

/**
 * check if a given path is a valid url
 */
export function isUrl(path) {
  return /^(https?|\/\/)/.test(path)
}

/**
 * make and return a copy of `obj`
 */
export function clone(obj) {
  let result = null
  if (isObject(obj)) {
    result = {}
    for (let key in obj) {
      if (isObject(obj[key]) || isArray(obj[key])) {
        result[key] = clone(obj[key])
        continue
      }
      result[key] = obj[key]
    }
  } else if (isArray(obj)) {
    result = []
    obj.forEach((item, index) => {
      if (isObject(item) || isArray(item)) {
        result[index] = clone(item)
        return
      }
      result[index] = item
    })
  } else {
    result = obj
  }
  return result
}

/**
 * merge `target` with `source` and return a new object
 * param force {Boolean} whether to overwrite property in `target` whice has a same name in `source`
 */
export function merge(target, source, force = false) {
  if (!isObject(target) || !isObject(source)) return
  let result = clone(target)
  for (let key in source) {
    if (!result.hasOwnProperty(key)) {
      result[key] = clone(source[key])
    } else {
      result[key] = force ?
          clone(source[key]) :
          result[key]
    }
  }
  return result
}

/**
 * test if two urls are cross-origin
 */
export function isCrossOrigin(hostUrl, targetUrl) {
  const originRegExp = /^(https?:\/\/)?([^\/:]+)?:?(\d+)?/
  const defaultProtocol = 'http://'
  const defaultPort = '80'
  const hostOrigin = hostUrl.match(originRegExp)
  const targetOrigin = targetUrl.match(originRegExp)

  // if urls don't have protocols, add default protocols to them
  ;[hostOrigin[1], hostOrigin[2], hostOrigin[3]] = [
    hostOrigin[1] ? hostOrigin[1] : defaultProtocol,
    hostOrigin[2] ? hostOrigin[2] : location.hostname,
    hostOrigin[3] ? hostOrigin[3] : defaultPort
  ]
  if (!targetOrigin[3]) {
    if (targetOrigin[2]) {
      targetOrigin[3] = defaultPort
    } else {
      targetOrigin[3] = hostOrigin[3]
    }
  }
  ;[targetOrigin[1], targetOrigin[2]] = [
    targetOrigin[1] ? targetOrigin[1] : hostOrigin[1],
    targetOrigin[2] ? targetOrigin[2] : hostOrigin[2]
  ]
  hostOrigin[0] = `${hostOrigin[1]}${hostOrigin[2]}:${hostOrigin[3]}`
  targetOrigin[0] = `${targetOrigin[1]}${targetOrigin[2]}:${targetOrigin[3]}`
  return hostOrigin[0] !== targetOrigin[0]
}

const storage = global.localStorage
/**
 * get item from local storage
 */
export function get(key) {
  if (isString(key)) {
    return JSON.parse(storage.getItem(key))
  }
  if (isArray(key)) {
    return key.map(k => JSON.parse(storage.getItem(k)))
  }
}

/**
 * [set description]
 * @param {String} key key of the object to be cached
 * @param {Object} o   object to be cached
 */
export function set(key, o) {
  if (!isObject(o)) {
    return
  }
  storage.setItem(key, JSON.stringify(o))
}

/**
 * remove data object from cache
 */
export function remove(key) {
  if (isString(key)) {
    return storage.removeItem(key)
  }
  if (isArray(key)) {
    return key.forEach(k => storage.removeItem(k))
  }
}

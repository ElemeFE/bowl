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

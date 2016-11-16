/**
 * check if the argument is an instance of Object
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * check if the argument is an instance of String
 */
export function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
}

/**
 * check if the argument is an instance of Array
 */
export function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
 * check if a given path is a valid url
 */
export function isUrl(path) {
  return /^(https?|\/\/)/.test(path);
};

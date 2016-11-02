/**
 * check if the argument is an instance of Object
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};


/**
 * check if a given path is a valid url
 */
export function isUrl(path) {
  return /^(https?|\/\/)/.test(path);
};

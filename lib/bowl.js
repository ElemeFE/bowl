/*
 * bowl.js v0.0.8
 * (c) 2016-2016 classicemi
 * Released under the MIT license.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Bowl = factory());
}(this, (function () { 'use strict';

/**
 * check if the argument is an instance of Object
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * check if the argument is an instance of String
 */
function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]'
}

/**
 * check if the argument is an instance of Array
 */
function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

/**
 * check if a given path is a valid url
 */
function isUrl(path) {
  return /^(https?|\/\/)/.test(path)
}

/**
 * make and return a copy of `obj`
 */
function clone(obj) {
  var result = null;
  if (isObject(obj)) {
    result = {};
    for (var key in obj) {
      if (isObject(obj[key]) || isArray(obj[key])) {
        result[key] = clone(obj[key]);
        continue
      }
      result[key] = obj[key];
    }
  } else if (isArray(obj)) {
    result = [];
    obj.forEach(function (item, index) {
      if (isObject(item) || isArray(item)) {
        result[index] = clone(item);
        return
      }
      result[index] = item;
    });
  } else {
    result = obj;
  }
  return result
}

/**
 * merge `target` with `source` and return a new object
 * param force {Boolean} whether to overwrite property in `target` whice has a same name in `source`
 */
function merge(target, source, force) {
  if ( force === void 0 ) force = false;

  if (!isObject(target) || !isObject(source)) { return }
  var result = clone(target);
  for (var key in source) {
    if (!result.hasOwnProperty(key)) {
      result[key] = clone(source[key]);
    } else {
      result[key] = force ?
          clone(source[key]) :
          result[key];
    }
  }
  return result
}

var global = window;
var prefix = 'bowl-';

var Bowl$1 = function Bowl$1() {
  this.config = {
    timeout: 60000,
    expireAfter: 100,
    expireWhen: null
  };
  this.ingredients = [];
};

/**
 * @param {Object} custom config object to be merged with the default config
 */
Bowl$1.prototype.configure = function configure (opts) {
  this.config = merge(this.config, opts, true);
};

/**
 * @param {Object, Array} items to be cached, wrapped in supported object structure
 */
Bowl$1.prototype.add = function add (opts) {
    var this$1 = this;

  if (!isArray(opts)) {
    if (isObject(opts)) {
      opts = [ opts ];
    } else {
      return
    }
  }

  function makeIngredient(obj) {
    var ingredient = {};
    var now = new Date().getTime();
    var isUrl$$1 = isUrl(obj.url);
    ingredient.key = "" + prefix + (obj.key || obj.url);
    ingredient.expireAfter = now + (obj.expireAfter ? obj.expireAfter : 100) * 3600 * 1000;
    ingredient.expireWhen = obj.expireWhen ? obj.expireWhen : null;
    ingredient.url = isUrl$$1 ?
      obj.url :
      ((global.location.origin) + "/" + (obj.url.replace(new RegExp('^\/*'), '')));
    return ingredient
  }

  var self = this;

  var handle = function (obj) {
    if (!obj.url) { return }
    var ingredient = makeIngredient(obj);
    var existingIndexFound = this$1.ingredients.findIndex(function (item) {
      return item.key === ingredient.key
    });
    if (existingIndexFound > -1) {
      this$1.ingredients.splice(existingIndexFound, 1, ingredient);
      return
    }
    self.ingredients.push(ingredient);
  };

  opts.forEach(function (opt) { return handle(opt); });
};

Bowl$1.prototype.normalInject = function normalInject (url) {
  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
};

Bowl$1.prototype.appendScript = function appendScript (content) {
  var script = document.createElement('script');
  script.defer = true;
  script.text = content;
  document.getElementsByTagName('head')[0].appendChild(script);
};

Bowl$1.prototype.inject = function inject () {
    var this$1 = this;

  if (!this.ingredients.length) { return false }
  var self = this;
  var ingredientsPromises = [];
  if (!global.localStorage || !global.Promise) {
    this.ingredients.forEach(function (item) {
      this$1.normalInject(item.url);
    });
    return
  }
  var fetch = function (url) {
    var xhr = new XMLHttpRequest();
    var promise = new Promise(function (resolve, reject) {
      xhr.open('GET', url);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if ((xhr.status === 200) || ((xhr.status === 0) && xhr.responseText)) {
            resolve({
              content: xhr.responseText
            });
          } else {
            reject(new Error(xhr.statusText));
          }
        }
      };
    });
    setTimeout(function() {
      if (xhr.readyState < 4) {
        xhr.abort();
      }
    }, self.config.timeout);
    xhr.send();
    return promise
  };
  this.ingredients.forEach(function (item) {
    ingredientsPromises.push(new Promise(function (resolve, reject) {
      if (item.noCache) {
        this$1.normalInject(item.url);
        resolve();
        return
      }
      var local = JSON.parse(localStorage.getItem(item.key));
      if (local.url === item.url) {
        this$1.appendScript(local.content);
        resolve();
      } else {
        fetch(item.url).then(function (data) {
          item.content = data.content;
          this$1.appendScript(data.content);
          localStorage.setItem(item.key, JSON.stringify(item));
          resolve();
        });
      }
    }));
  });
  return Promise.all(ingredientsPromises)
};

Bowl$1.prototype.remove = function remove (rule) {
    var this$1 = this;

  if (!rule) {
    var keys = this.ingredients.map(function (item) { return item.key; });
    keys.forEach(function (key) { return this$1._removeStorage(key); });
    this.ingredients = [];
    return
  }
  var key = null;
  if (isString(rule)) {
    key = "" + prefix + rule;
  } else if (isObject(rule)) {
    key = "" + prefix + (rule.key ? rule.key : rule.url ? rule.url : '');
  }
  var index = this.ingredients.findIndex(function (item) { return item.key === key; });
  this.ingredients.splice(index, 1);
  localStorage.removeItem(key);
};

Bowl$1.prototype._removeStorage = function _removeStorage (key) {
  localStorage.removeItem(key);
};

return Bowl$1;

})));

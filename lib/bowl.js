/*
 * bowl.js v0.0.3
 * (c) 2016-2016 classicemi
 * Released under the MIT license.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.bowl = factory());
}(this, (function () { 'use strict';

/**
 * check if the argument is an instance of Object
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * check if the argument is an instance of Array
 */
function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
 * check if a given path is a valid url
 */
function isUrl(path) {
  return /^(https?|\/\/)/.test(path);
}

var global = window;
var prefix = 'bowl-';

var Bowl = function Bowl() {
  this.timeout = 60000;
  this.ingredients = [];
};

Bowl.prototype.add = function add (opts) {
  if (!isArray(opts)) {
    if (isObject(opts)) {
      opts = [ opts ];
    } else {
      return;
    }
  }
  var self = this;

  var handle = function (obj) {
    if (!obj.url) { return; }
    var now = new Date().getTime();
    var isUrl$$1 = isUrl(obj.url);
    obj.key = "" + prefix + (obj.key || obj.url);
    obj.expire = now + (obj.expire ? obj.expire : 100) * 3600 * 1000;
    obj.url = isUrl$$1 ?
      obj.url :
      ("" + (global.location.href) + (obj.url.replace(new RegExp('^\/*'), '')));
    self.ingredients.push(obj);
  };

  opts.forEach(function (opt) { return handle(opt); });
};

Bowl.prototype.normalInject = function normalInject (url) {
  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
};

Bowl.prototype.appendScript = function appendScript (content) {
  var script = document.createElement('script');
  script.defer = true;
  script.text = content;
  document.getElementsByTagName('head')[0].appendChild(script);
};

Bowl.prototype.inject = function inject () {
    var this$1 = this;

  if (!this.ingredients.length) { return false; }
  var self = this;
  var ingredientsPromises = [];
  if (!global.localStorage || !global.Promise) {
    this.ingredients.forEach(function (item) {
      this$1.normalInject(item.url);
    });
    return;
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
    }, self.timeout);
    xhr.send();
    return promise;
  };
  this.ingredients.forEach(function (item) {
    ingredientsPromises.push(function(resolve, reject) {
        var this$1 = this;

      if (item.noCache) {
        this.normalInject(item.url);
        resolve();
        return;
      }
      var local = localStorage.getItem(item.key);
      if (local) {
        local = JSON.parse(local);
        this.appendScript(local.content);
        resolve();
      } else {
        fetch(item.url).then(function (data) {
          item.content = data.content;
          this$1.appendScript(data.content);
          localStorage.setItem(item.key, JSON.stringify(item));
          resolve();
        });
      }
    });
  });
  return Promise.all(ingredientsPromises);
};

Bowl.prototype.remove = function remove (key) {
    var this$1 = this;

  if (!key) {
    var keys = this.ingredients.map(function (item) { return item.key; });
    keys.forEach(function (key) { return this$1._removeStorage(key); });
    this.ingredients = [];
  }
  key = "" + prefix + (isObject(key) ? key.key : key);
  var index = this.ingredients.findIndex(function (item) { return item.key === key; });
  this.ingredients.splice(index, 1);
  localStorage.removeItem(key);
};

Bowl.prototype._removeStorage = function _removeStorage (key) {
  localStorage.removeItem(key);
};

var bowl = new Bowl();

return bowl;

})));

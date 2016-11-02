/*
 * bowl.js v0.0.2
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
 * check if a given path is a valid url
 */
function isUrl(path) {
  return /^(https?|\/\/)/.test(path);
}

var global = window;

var Bowl = function Bowl() {
  this.timeout = 60000;
  this.ingredients = [];
};

Bowl.prototype.add = function add (opts) {
  var self = this;

  var handle = function (obj) {
    if (!obj.url) { return; }
    var now = new Date().getTime();
    var isUrl$$1 = isUrl(obj.url);
    obj.key = obj.key || obj.url;
    obj.expire = now + (obj.expire ? obj.expire : 100) * 3600 * 1000;
    obj.url = isUrl$$1 ?
      obj.url :
      ("" + (global.location.href) + (obj.url.replace(new RegExp('^\/*'), '')));
    self.ingredients.push(obj);
  };

  opts.forEach(function (opt) { return handle(opt); });
};

Bowl.prototype.normalInject = function normalInject () {
  this.ingredients.forEach(function (item) {
    var script = document.createElement('script');
    script.src = item.url;
    document.getElementsByTagName('body')[0].appendChild(script);
  });
};

Bowl.prototype.appendScript = function appendScript (content) {
  var script = document.createElement('script');
  script.defer = true;
  script.text = content;
  document.getElementsByTagName('head')[0].appendChild(script);
};

Bowl.prototype.inject = function inject () {
    var this$1 = this;

  var self = this;
  if (!global.localStorage || !global.Promise) {
    this.normalInject();
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
    var local = localStorage.getItem(item.key);
    if (local) {
      local = JSON.parse(local);
      this$1.appendScript(local.content);
    } else {
      fetch(item.url).then(function (data) {
        item.content = data.content;
        this$1.appendScript(data.content);
        localStorage.setItem(item.key, JSON.stringify(item));
      });
    }
  });
};

Bowl.prototype.remove = function remove (key) {
  key = isObject(key) ? key.key : key;
  var index = this.ingredients.findIndex(function (item) { return item.key === key; });
  this.ingredients.splice(index, 1);
  localStorage.removeItem(key);
};

var bowl = new Bowl();

return bowl;

})));

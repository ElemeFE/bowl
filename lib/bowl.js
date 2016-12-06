/*
 * bowl.js v0.1.2
 * (c) 2016-2016 classicemi
 * Released under the MIT license.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Bowl = factory());
}(this, (function () { 'use strict';

var global$1 = window;

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

/**
 * test if two urls are cross-origin
 */
function isCrossOrigin(hostUrl, targetUrl) {
  var originRegExp = /^(https?:\/\/)?([^\/:]+)?:?(\d+)?/;
  var defaultProtocol = 'http://';
  var defaultPort = '80';
  var hostOrigin = hostUrl.match(originRegExp);
  var targetOrigin = targetUrl.match(originRegExp);var assign;
  (assign = [
    hostOrigin[1] ? hostOrigin[1] : defaultProtocol,
    hostOrigin[2] ? hostOrigin[2] : location.hostname,
    hostOrigin[3] ? hostOrigin[3] : defaultPort
  ], hostOrigin[1] = assign[0], hostOrigin[2] = assign[1], hostOrigin[3] = assign[2]);
  if (!targetOrigin[3]) {
    if (targetOrigin[2]) {
      targetOrigin[3] = defaultPort;
    } else {
      targetOrigin[3] = hostOrigin[3];
    }
  }
  var assign$1;
  (assign$1 = [
    targetOrigin[1] ? targetOrigin[1] : hostOrigin[1],
    targetOrigin[2] ? targetOrigin[2] : hostOrigin[2]
  ], targetOrigin[1] = assign$1[0], targetOrigin[2] = assign$1[1]);
  hostOrigin[0] = "" + (hostOrigin[1]) + (hostOrigin[2]) + ":" + (hostOrigin[3]);
  targetOrigin[0] = "" + (targetOrigin[1]) + (targetOrigin[2]) + ":" + (targetOrigin[3]);
  return hostOrigin[0] !== targetOrigin[0]
}

var storage = global$1.localStorage;
/**
 * get item from local storage
 */
function get$1(key) {
  if (isString(key)) {
    return JSON.parse(storage.getItem(key))
  }
  if (isArray(key)) {
    return key.map(function (k) { return JSON.parse(storage.getItem(k)); })
  }
}

/**
 * [set description]
 * @param {String} key key of the object to be cached
 * @param {Object} o   object to be cached
 */
function set(key, o) {
  if (!isObject(o)) {
    return
  }
  storage.setItem(key, JSON.stringify(o));
}

/**
 * remove data object from cache
 */
function remove$1(key) {
  if (isString(key)) {
    return storage.removeItem(key)
  }
  if (isArray(key)) {
    return key.forEach(function (k) { return storage.removeItem(k); })
  }
}

var Injector = function Injector(config) {
  this.config = config;
};

Injector.prototype.inject = function inject (o) {
    var this$1 = this;

  if (o.noCache) {
    return this.normalInject(o)
  }

  var local = get$1(o.key);
  var ext = o.ext;

  var current = new Date().getTime();
  var expire = o.expireAfter ? (new Date()).getTime() + o.expireAfter : null;
  expire = o.expireWhen ? o.expireWhen : expire;
  o.expire = expire;

  if (local && o.url === local.url && (!local.expire || current < local.expire)) { // hit
    return new Promise(function (resolve, reject) {
      try {
        this$1.appendToPage(ext, local.content);
        resolve();
      } catch (err) {
        reject(err);
      }
    })
  } else {
    return new Promise(function (resolve, reject) {
      this$1.fetchByXHR(o.url).then(function (data) {
        o.content = data.content;
        set(o.key, o);
        this$1.appendToPage(ext, o.content);
        resolve();
      }).catch(function (err) { return reject(err); });
    })
  }
};

Injector.prototype.appendToPage = function appendToPage (ext, content) {
  switch (ext) {
    case 'css':
      var style = document.createElement('style');
      style.innerText = content;
      document.getElementsByTagName('head')[0].appendChild(style);
      break
    case 'js':
      var script = document.createElement('script');
      script.text = content;
      script.defer = true;
      document.getElementsByTagName('head')[0].appendChild(script);
      break
  }
};

Injector.prototype.normalInject = function normalInject (o) {
  var promise;
  switch (o.ext) {
    case 'js':
      promise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = o.url;
        script.defer = true;
        document.getElementsByTagName('body')[0].appendChild(script);
        script.onload = function () {
          resolve();
        };
        script.onerror = function () {
          reject();
        };
      });
      break
    case 'css':
      promise = new Promise(function (resolve, reject) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = o.url;
        document.getElementsByTagName('head')[0].appendChild(link);
        link.onload = function () {
          resolve();
        };
        link.onerror = function () {
          reject();
        };
      });
      break
    default:
      break
  }
  return promise
};

Injector.prototype.fetchByXHR = function fetchByXHR (url) {
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
  setTimeout(function () {
    if (xhr.readyState < 4) {
      xhr.abort();
    }
  }, this.config.timeout);
  xhr.send();
  return promise
};

var Graph = function Graph(vertices) {
  this.vertices = isObject(vertices) ? merge({}, vertices) : {};
};

Graph.prototype.addVertex = function addVertex (v) {
  if (isObject(this.vertices[v])) {
    return
  }
  var newVertex = {
    name: v,
    prev: 0,
    next: 0,
    adjList: []
  };
  this.vertices[v] = newVertex;
};

Graph.prototype.addEdge = function addEdge (begin, end) {
  // check if two vertices exist
  if (!this.vertices[begin] ||
      !this.vertices[end] ||
      this.vertices[begin].adjList.indexOf(end) > -1) {
    return
  }
  ++this.vertices[begin].next;
  this.vertices[begin].adjList.push(end);
  ++this.vertices[end].prev;
};

Graph.prototype.hasCycle = function hasCycle () {
  var cycleTestStack = [];
  var vertices = merge({}, this.vertices);
  var popVertex = null;

  for (var k in vertices) {
    if (vertices[k].prev === 0) {
      cycleTestStack.push(vertices[k]);
    }
  }
  while (cycleTestStack.length > 0) {
    popVertex = cycleTestStack.pop();
    delete vertices[popVertex.name];
    popVertex.adjList.forEach(function (nextVertex) {
      --vertices[nextVertex].prev;
      if (vertices[nextVertex].prev === 0) {
        cycleTestStack.push(vertices[nextVertex]);
      }
    });
  }
  return Object.keys(vertices).length > 0
};

Graph.prototype.getBFS = function getBFS () {
  if (this.hasCycle()) {
    throw new Error('There are cycles in resource\'s dependency relations')
    return
  }
  var result = [];
  var graphCopy = new Graph(this.vertices);
  while (Object.keys(graphCopy.vertices).length) {
    var noPrevVertices = [];
    for (var k in graphCopy.vertices) {
      if (graphCopy.vertices[k].prev === 0) {
        noPrevVertices.push(k);
      }
    }
    if (noPrevVertices.length) {
      result.push(noPrevVertices);
      noPrevVertices.forEach(function (vertex) {
        graphCopy.vertices[vertex].adjList.forEach(function (next) {
          --graphCopy.vertices[next].prev;
        });
        delete graphCopy.vertices[vertex];
      });
    }
  }
  return result
};

var global = window;
var prefix = 'bowl-';
var isSystemDependencyAvailable = global.localStorage && global.Promise;

var Bowl$1 = function Bowl$1() {
  this.config = {
    timeout: 60000,
    expireAfter: null,
    expireWhen: null
  };
  var ingredients = [];
  Object.defineProperty(this, 'ingredients', {
    __proto__: null,
    configurable: true,
    get: function get() {
      return ingredients
    }
  });
  this.injector = new Injector(this.config);
};

/**
 * @param {Object} custom config object to be merged with the default config
 */
Bowl$1.prototype.configure = function configure (opts) {
  this.config = merge(this.config, opts, true);
};

/**
 * @param {Object, Array} items to be cached, wrapped in supported structure
 */
Bowl$1.prototype.add = function add (opts) {
    var this$1 = this;

  if (!isArray(opts)) {
    if (isObject(opts)) {
      opts = [opts];
    } else {
      return
    }
  }

  /**
   * take options and return corresponding ingredient
   */
  var makeIngredient = function (opt) {
    var option = merge(this$1.config, opt, true);
    var ingredient = {};
    var now = new Date().getTime();
    var isUrl$$1 = isUrl(option.url);
    var extRE = /\.(\w+)(\?.+)?$/i;

    ingredient.key = "" + prefix + (option.key || option.url);

    ingredient.expireAfter = option.expireAfter;
    ingredient.expireWhen = option.expireWhen;

    ingredient.url = isUrl$$1 ?
      option.url :
      ((global.location.origin) + "/" + (option.url.replace(new RegExp('^\/*'), '')));

    if (!isSystemDependencyAvailable) {
      ingredient.noCache = true;
    } else {
      ingredient.noCache = !!option.noCache;
      if (isCrossOrigin(global.location.origin, ingredient.url)) {
        ingredient.noCache = true;
      }
    }

    var match = ingredient.url.match(extRE);
    ingredient.ext = match ? match[1] : match;

    ingredient.dependencies = option.dependencies;

    return ingredient
  };

  var handle = function (obj) {
    if (!obj.key || !/^[a-zA-z0-9_]+$/.test(obj.key)) {
      throw new Error('invalid key of bowl ingredient')
      return
    }
    if (!obj.url) {
      throw new Error('no valid url of bowl ingredient')
      return
    }
    var ingredient = makeIngredient(obj);
    var existingIndexFound = this$1.ingredients.findIndex(function (item) {
      return item.key === ingredient.key
    });
    if (existingIndexFound > -1) {
      this$1.ingredients.splice(existingIndexFound, 1, ingredient);
      return
    }
    this$1.ingredients.push(ingredient);
  };

  opts.forEach(function (opt) { return handle(opt); });
};

Bowl$1.prototype.inject = function inject () {
    var this$1 = this;

  if (!this.ingredients.length) { return false }

  var ingredientsGraph = new Graph();
  this.ingredients.forEach(function (item) { return ingredientsGraph.addVertex(item.key); });
  this.ingredients.forEach(function (item) {
    if (item.dependencies && item.dependencies.length) {
      item.dependencies.forEach(function (dep) {
        ingredientsGraph.addEdge(("" + prefix + dep), item.key);
      });
    }
  });
  var resolvedIngredients = ingredientsGraph.getBFS();

  var batchFetch = function (group) {
    var fetches = [];
    group.forEach(function (item) {
      fetches.push(this$1.injector.inject(this$1.ingredients.find(function (ingredient) { return ingredient.key === item; })));
    });
    return Promise.all(fetches)
  };

  var ret = Promise.resolve();
  resolvedIngredients.forEach(function (group) {
    ret = ret.then(function() {
      return batchFetch(group)
    });
  });
  return ret
};

Bowl$1.prototype.remove = function remove (rule) {
    var this$1 = this;

  if (!rule) {
    var keys = this.ingredients.map(function (item) { return item.key; });
    keys.forEach(function (key) { return this$1.remove(key); });
    return
  }
  if (isString(rule)) {
    var key = "" + prefix + rule;
    var index = this.ingredients.findIndex(function (item) { return item.key === key; });
    this.ingredients.splice(index, 1);
    remove$1(key);
  } else if (isArray(rule)) {
    var key$1 = "" + prefix + (rule.key ? rule.key : rule.url ? rule.url : '');
    rule.forEach(function (key) { return this$1.remove(key); });
    return
  }
};

return Bowl$1;

})));

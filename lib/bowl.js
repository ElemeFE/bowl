'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (win, doc) {
  var isObject = function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  var Bowl = function () {
    function Bowl() {
      _classCallCheck(this, Bowl);

      this.timeout = 60000;
      this.ingredients = [];
    }

    _createClass(Bowl, [{
      key: 'add',
      value: function add(opts) {
        var self = this;

        var handle = function handle(obj) {
          if (!obj.url) return;
          var now = new Date().getTime();
          var isAbsolute = /^(https?|\/\/)/.test(obj.url);
          obj.key = obj.key || obj.url;
          obj.expire = now + (obj.expire ? obj.expire : 100) * 3600 * 1000;
          obj.url = isAbsolute ? obj.url : '' + win.location.href + obj.url.replace(new RegExp('^\/*'), '');
          self.ingredients.push(obj);
        };

        opts.forEach(function (opt) {
          return handle(opt);
        });
      }
    }, {
      key: 'normalInject',
      value: function normalInject() {
        this.ingredients.forEach(function (item) {
          var script = doc.createElement('script');
          script.src = item.url;
          doc.getElementsByTagName('body')[0].appendChild(script);
        });
      }
    }, {
      key: 'appendScript',
      value: function appendScript(content) {
        var script = doc.createElement('script');
        script.defer = true;
        script.text = content;
        doc.getElementsByTagName('head')[0].appendChild(script);
      }
    }, {
      key: 'inject',
      value: function inject() {
        var _this = this;

        var self = this;
        if (!win.localStorage || !win.Promise) {
          this.normalInject();
          return;
        }
        var fetch = function fetch(url) {
          var xhr = new XMLHttpRequest();
          var promise = new Promise(function (resolve, reject) {
            xhr.open('GET', url);
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0 && xhr.responseText) {
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
          }, self.timeout);
          xhr.send();
          return promise;
        };
        this.ingredients.forEach(function (item) {
          var local = localStorage.getItem(item.key);
          if (local) {
            local = JSON.parse(local);
            _this.appendScript(local.content);
          } else {
            fetch(item.url).then(function (data) {
              item.content = data.content;
              _this.appendScript(data.content);
              localStorage.setItem(item.key, JSON.stringify(item));
            });
          }
        });
      }
    }, {
      key: 'remove',
      value: function remove(key) {
        key = isObject(key) ? key.key : key;
        var index = this.ingredients.findIndex(function (item) {
          return item.key === key;
        });
        this.ingredients.splice(index, 1);
        localStorage.removeItem(key);
      }
    }]);

    return Bowl;
  }();

  win.bowl = new Bowl();
})(window, document);
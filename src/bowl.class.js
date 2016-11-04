import * as utils from './utils';

let global = window;
let prefix = 'bowl-';

export default class Bowl {
  constructor() {
    this.timeout = 60000;
    this.ingredients = [];
  }

  add(opts) {
    if (!utils.isArray(opts)) {
      if (utils.isObject(opts)) {
        opts = [ opts ];
      } else {
        return;
      }
    }
    let self = this;

    let handle = obj => {
      if (!obj.url) return;
      const now = new Date().getTime();
      const isUrl = utils.isUrl(obj.url);
      obj.key = `${prefix}${obj.key || obj.url}`;
      obj.expire = now + (obj.expire ? obj.expire : 100) * 3600 * 1000;
      obj.url = isUrl ?
        obj.url :
        `${global.location.href}${obj.url.replace(new RegExp('^\/*'), '')}`;
      self.ingredients.push(obj);
    };

    opts.forEach(opt => handle(opt));
  }

  normalInject(url) {
    let script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }

  appendScript(content) {
    const script = document.createElement('script');
    script.defer = true;
    script.text = content;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  inject() {
    if (!this.ingredients.length) return false;
    const self = this;
    let ingredientsPromises = [];
    if (!global.localStorage || !global.Promise) {
      this.ingredients.forEach(item => {
        this.normalInject(item.url);
      });
      return;
    }
    let fetch = url => {
      let xhr = new XMLHttpRequest();
      let promise = new Promise((resolve, reject) => {
        xhr.open('GET', url);
        xhr.onreadystatechange = () => {
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
      }, self.timeout)
      xhr.send();
      return promise;
    };
    this.ingredients.forEach(item => {
      ingredientsPromises.push(function(resolve, reject) {
        if (item.noCache) {
          this.normalInject(item.url);
          resolve();
          return;
        }
        let local = localStorage.getItem(item.key);
        if (local) {
          local = JSON.parse(local);
          this.appendScript(local.content);
          resolve();
        } else {
          fetch(item.url).then(data => {
            item.content = data.content;
            this.appendScript(data.content);
            localStorage.setItem(item.key, JSON.stringify(item));
            resolve();
          });
        }
      });
    });
    return Promise.all(ingredientsPromises);
  }

  remove(key) {
    if (!key) {
      let keys = this.ingredients.map(item => item.key);
      keys.forEach(key => this._removeStorage(key));
      this.ingredients = [];
    }
    key = `${prefix}${utils.isObject(key) ? key.key : key}`;
    const index = this.ingredients.findIndex(item => item.key === key);
    this.ingredients.splice(index, 1);
    localStorage.removeItem(key);
  }

  _removeStorage(key) {
    localStorage.removeItem(key);
  }

};

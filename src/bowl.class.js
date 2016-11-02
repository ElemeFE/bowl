import * as utils from './utils';

let global = window;

export default class Bowl {
  constructor() {
    this.timeout = 60000;
    this.ingredients = [];
  }

  add(opts) {
    let self = this;

    let handle = obj => {
      if (!obj.url) return;
      const now = new Date().getTime();
      const isAbsolute = /^(https?|\/\/)/.test(obj.url);
      obj.key = obj.key || obj.url;
      obj.expire = now + (obj.expire ? obj.expire : 100) * 3600 * 1000;
      obj.url = isAbsolute ?
        obj.url :
        `${global.location.href}${obj.url.replace(new RegExp('^\/*'), '')}`;
      self.ingredients.push(obj);
    };

    opts.forEach(opt => handle(opt));
  }

  normalInject() {
    this.ingredients.forEach(item => {
      let script = document.createElement('script');
      script.src = item.url;
      document.getElementsByTagName('body')[0].appendChild(script);
    });
  }

  appendScript(content) {
    const script = document.createElement('script');
    script.defer = true;
    script.text = content;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  inject() {
    const self = this;
    if (!global.localStorage || !global.Promise) {
      this.normalInject();
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
      let local = localStorage.getItem(item.key);
      if (local) {
        local = JSON.parse(local);
        this.appendScript(local.content);
      } else {
        fetch(item.url).then(data => {
          item.content = data.content;
          this.appendScript(data.content);
          localStorage.setItem(item.key, JSON.stringify(item));
        });
      }
    });
  }

  remove(key) {
    key = utils.isObject(key) ? key.key : key;
    const index = this.ingredients.findIndex(item => item.key === key);
    this.ingredients.splice(index, 1);
    localStorage.removeItem(key);
  }
};

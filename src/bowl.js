(function(win, doc) {
  class Bowl {
    constructor() {
      this.timeout = 60000;
      this.ingredients = [];
    }

    add(opts) {
      let self = this;

      let handle = obj => {
        if (!obj.url) return;
        const now = new Date();
        obj.key = obj.key ? obj.key : obj.url;
        obj.expire = obj.expire ?
          obj.expire :
          (now + 50 * 24 * 3600 * 1000);
        obj.path = location.href + obj.url.replace(/^\/+/, '');

        self.ingredients.push(obj);
      };

      opts.forEach(opt => handle(opt));
    }

    normalInject() {
      this.ingredients.forEach(item => {
        let script = doc.createElement('script');
        script.src = item.path;
        doc.getElementsByTagName('body')[0].appendChild(script);
      });
    }

    appendScript(content) {
      let script = doc.createElement('script');
      script.defer = true;
      script.text = content;
      doc.getElementsByTagName('head')[0].appendChild(script);
    }

    inject() {
      let self = this;
      if (!win.localStorage || !win.Promise) {
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
          fetch(item.path).then(data => {
            item.content = data.content;
            this.appendScript(data.content);
            localStorage.setItem(item.key, JSON.stringify(item));
          });
        }
      });
    }
  }

  win.bowl = new Bowl();
})(window, document);

import * as utils from '../utils'
import Unit from './cacheUnit.class'

export default class Injector {
  constructor(config) {
    this.config = config
  }

  inject(o) {
    if (o.noCache) {
      return this.normalInject(o)
    }

    const local = utils.get(o.key)
    const ext = o.ext

    const current = new Date().getTime()
    let expire = o.expireAfter ? (new Date()).getTime() + o.expireAfter : null
    expire = o.expireWhen ? o.expireWhen : expire
    o.expire = expire

    if (local && o.url === local.url && (!local.expire || current < local.expire)) { // hit
      return new Promise((resolve, reject) => {
        try {
          this.appendToPage(ext, local.content)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    } else {
      return new Promise((resolve, reject) => {
        this.fetchByXHR(o.url).then((data) => {
          o.content = data.content
          const unit = new Unit(o)
          utils.set(unit.key, unit)
          this.appendToPage(ext, o.content)
          resolve()
        }).catch(err => reject(err))
      })
    }
  }

  appendToPage(ext, content) {
    switch (ext) {
      case 'css':
        const style = document.createElement('style')
        style.innerText = content
        document.getElementsByTagName('head')[0].appendChild(style)
        break
      case 'js':
        const script = document.createElement('script')
        script.text = content
        script.defer = true
        document.getElementsByTagName('head')[0].appendChild(script)
        break
    }
  }

  normalInject(o) {
    let promise
    switch (o.ext) {
      case 'js':
        promise = new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = o.url
          script.defer = true
          document.getElementsByTagName('body')[0].appendChild(script)
          script.onload = () => {
            resolve()
          }
          script.onerror = () => {
            reject()
          }
        })
        break
      case 'css':
        promise = new Promise((resolve, reject) => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = o.url
          document.getElementsByTagName('head')[0].appendChild(link)
          link.onload = () => {
            resolve()
          }
          link.onerror = () => {
            reject()
          }
        })
        break
      default:
        break
    }
    return promise
  }

  fetchByXHR(url) {
    const xhr = new XMLHttpRequest()
    const promise = new Promise((resolve, reject) => {
      xhr.open('GET', url)
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if ((xhr.status === 200) || ((xhr.status === 0) && xhr.responseText)) {
            resolve({
              content: xhr.responseText
            })
          } else {
            reject(new Error(xhr.statusText))
          }
        }
      }
    })
    setTimeout(() => {
      if (xhr.readyState < 4) {
        xhr.abort()
      }
    }, this.config.timeout)
    xhr.send()
    return promise
  }
}

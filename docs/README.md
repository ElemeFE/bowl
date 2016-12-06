<p align="center"><image src="https://github.com/classicemi/bowl.js/blob/develop/assets/logo.png?raw=true" width="128"></p>

# bowl.js
[![npm](https://img.shields.io/npm/v/bowl.js.svg?style=flat-square)](https://www.npmjs.com/package/bowl.js)
[![npm](https://img.shields.io/npm/dt/bowl.js.svg?style=flat-square)](https://www.npmjs.com/package/bowl.js)
[![license](https://img.shields.io/github/license/elemefe/bowl.svg?style=flat-square)](https://github.com/ElemeFE/bowl)
[![GitHub stars](https://img.shields.io/github/stars/elemefe/bowl.svg?style=social&label=Star)](https://github.com/ElemeFE/bowl)

**bowl** is a loader that caches scripts and stylesheets with localStorage. After receiving any scripts or stylesheets, this tiny JavaScript library will save them to the browser's localStorage. When the file is requested next time, bowl will read it from localStorage and inject it to the webpage.

## Installation
``` shell
$ npm install bowl.js
```
then insert an `script` tag to your page(`head` tag is recommended):
``` html
<script src="https://unpkg.com/bowl.js/lib/bowl.min.js"></script>
```
or
``` html
<script src="node_modules/bowl.js/lib/bowl.min.js"></script>
```

## Demo
For those resources that need to be cached, you do not have to insert `script` tags to the pages. Just write a little piece of JavaScript and **bowl** will take care of it.
```html
<script>
var bowl = new Bowl()
bowl.add([
  { url: 'dist/vendor.[hash].js', key: 'vendor' },
  { url: 'dist/app.[hash].js', key: 'app' },
  { url: 'dist/style.[hash].css', key: 'style' }
])
bowl.inject().then(() => {
  // do some stuff
})
</script>
```
**bowl** will add these resources to cache(currently localStorage). whenever the url of the resources get modified, bowl will update the files in the cache. For more useful functions of **bowl**, just checkout the API document.

## Development Setup
After cloning the repo, run:
```shell
$ yarn install # yep, yarn is recommended. :)
```
### Commonly used NPM scripts:
```shell
# watch and auto rebuild lib/bowl.js and lib/bowl.min.js
$ npm run dev

# watch and auto re-run unit tests in Chrome
$ npm run test:unit

# build all dist files
$ npm run build
```

## Project Structure
+ **`assets`**: logo files.
+ **`build`**: contains build-related configuration files.
+ **`docs`**: project's home page and documents.
+ **`lib`**: contains build files for distribution, after running **`npm run build`** script, files in this directory will be updated as well.
+ **`test`**: contains all tests. The unit tests are written with [Jasmine](http://jasmine.github.io/2.5/introduction) and run with [Karma](http://karma-runner.github.io/1.0/index.html), e2e tests are written with [Mocha](https://mochajs.org/).
+ **`src`**: source code directory.

## API
**bowl** will add a property named `bowl` to the global object, which is `window` in browsers. Bowl has several methods for you.
*localStorage and Promise are required by bowl. You can use a Promise Polyfill if your project needs to be compatible with browsers that do not support Promise.*

### `bowl.configure`
`bowl.configure(config)`

*config:* an object contains custom settings of bowl instance, supported settings are:
+ **timeout**: time limit of fetching resources(in milliseconds).

**Examples**
```javascript
bowl.configure({
  timeout: 10000
})
```

### `bowl.add`
`bowl.add(resources)`

*scripts:* an array of objects with the following fields:
+ **url**(required): *String* the URI of the resources to be handled. Because of the CORS restrictions, the URI should be on the same origin as the caller. Resources which are cross-origin won't be cached. You can Either use an absolute address or just use path.
+ **key**(required): *String* the name for **bowl** to identify the resource, if you don't specify this field, the resource will be ignored.
+ **noCache**: *Boolean* defaults to false. Bowl won't cache the resource if it's true.
+ **dependencies**: *Array* an array containing the resource's dependencies' keys.
+ **expireAfter**: *Number* specify how long before the resource is expired after being injected(in milliseconds).
+ **expireWhen**: *Number* specify the time when the resource is expired(in milliseconds).
**`expireWhen`'s priority is higher than `expireAfter`'**

**Examples**
```javascript
bowl.add([
  { url: '/vendor.js', key: 'vendor', expireAfter: 30 * 24 * 60 * 60 * 1000 }
  { url: '/main.js', key: 'main', dependencies: ['vendor'] }
])
```

`bowl.add(resource)`

*resource:* single resource object
```javascript
bowl.add({ url: '/main.js', key: 'main' })
```

### `bowl.inject`
`bowl.inject()`

this method triggers the handling of the scripts added by `bowl.add()` method. Bowl will check if the resource has been stored in the localStorage. If not, bowl will fetch it from the server and save it to cache(localStorage).
```javascript
bowl.inject().then(() => {
  // do some stuff
})
```

### `bowl.remove`
`bowl.remove(resource)`  
*resource:* this parameter supports two types:  
*String:* indicates the key of the resource to be removed.

*Object:* an object with the following fields:
+ **url**: url of the resource you want to remove from the controlling scope of bowl.
+ **key**: key of the resource to be removed.

`bowl.remove()`  
Parameter `resource` is optional. When `resource` is not not Provided, bowl will remove all the resources from bowl instance and local storage.

## License
MIT

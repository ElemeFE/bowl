<p align="center"><image src="https://github.com/classicemi/bowl.js/blob/develop/assets/logo.png?raw=true" width="128"></p>

<p align="center">
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/dt/bowl.js.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/v/bowl.js.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/l/bowl.js.svg" alt="License"></a>
</p>

# bowl.js
**bowl.js** is a loader that caches scripts and stylesheets with localStorage. After receiving any scripts or stylesheets, this tiny JavaScript library will save them to the browser's localStorage. When the file is requested next time, bowl.js will read it from localStorage and inject it to the webpage.

## Installation
``` shell
$ npm install bowl.js
```
then insert an `script` tag to your page(`head` tag is recommended):
``` html
<script src="node_modules/bowl.js/lib/bowl.js"></script>
```

## Development Setup
After cloning the repo, run:
```shell
$ npm install
```
### Commonly used NPM scripts:
```shell
# watch and auto rebuild lib/bowl.js and lib/bowl.min.js
$ npm run dev

# watch and auto re-run unit tests in Chrome
$ npm run test

# build all dist files
$ npm run build
```

## Project Structure
+ **`build`**: contains build-related configuration files.
+ **`lib`**: contains build files for distribution, after running **`test`** script, files in this directory will be updated as well.
+ **`test`**: contains all tests. The unit tests are written with [Jasmine](http://jasmine.github.io/2.5/introduction) and run with [Karma](http://karma-runner.github.io/1.0/index.html).
+ **`src`**: contains the source code, obviously. The codebase is written in ES2015.

## API
`bowl.js` will add a property named `bowl` to the global object, which is `window` in browsers. `bowl` has several methods for you.

### `bowl.add`
`bowl.add(scripts)`

*scripts:* an array of objects with the following fields:
+ **url**(required): the URI of the script to be handled. Because of the CORS restrictions, the URI should be on the same origin as the caller. You can Either use an absolute address or a relative address. `bowl.js` converts all of them to absolute addresses.
+ **key**: the name for `bowl.js` to identify the script, if you don't specify this field, it defaults to the **url**.
+ **expire**: How log(in hours) before the cached item expires.
+ **noCache**: defaults to false. Bowl.js won't cache the resource if it's true.

**Examples**
```javascript
bowl.add([
  { url: '/main.js', key: 'main', expire: 10 }
]);
```

### `bowl.inject`
`bowl.inject()`

this method triggers the handling of the scripts added by `bowl.add()` method. `bowl.js` will check if the script has been stored in the localStorage and is not expired. If not, bowl will fetch it from the server and save it to cache(localStorage).

### `bowl.remove`
`bowl.remove(scripts)`
*scripts:* an array of objects with the following fields:
+ **url**: url of the script you want to remove from the controlling scope of `bowl.js`.
+ **key**: id of the script to be removed.

`bowl.remove()`
Parameter `scripts` is optional. When `scripts` is not not Provided, bowl.js will remove all the ingredients from `bowl` instance and local storage.

## License
MIT

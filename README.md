<p align="center"><image src="https://github.com/classicemi/bowl.js/blob/develop/assets/logo.png?raw=true" width="128"></p>

<p align="center">
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/dt/bowl.js.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/v/bowl.js.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/l/bowl.js.svg" alt="License"></a>
</p>

# bowl.js
> 🍚 static resources front-end storage solving strategy

## Links
+ [Documentation]()

## Quick Start
For those scripts that need to be cached, you do not have to insert `script` tags to the pages. Just write a little piece of JavaScript and **bowl** will take care of it.
```html
<script>
var bowl = new Bowl()
bowl.add([
  { url: 'dist/vendor.[hash].js', key: 'vendor' },
  { url: 'dist/app.[hash].js', key: 'app' }
])
bowl.inject()
</script>
```
**bowl** will add these scripts to cache(currently localStorage). whenever the hashes in the filenames get modified, bowl will update the files in the cache. For more useful functions of **bowl**, just checkout the [API document]().

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

## License
MIT

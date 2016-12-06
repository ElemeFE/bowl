<p align="center"><image src="https://github.com/classicemi/bowl.js/blob/develop/assets/logo.png?raw=true" width="128"></p>

# bowl.js
[![npm](https://img.shields.io/npm/v/bowl.js.svg?style=flat-square)](https://www.npmjs.com/package/bowl.js)
[![npm](https://img.shields.io/npm/dt/bowl.js.svg?style=flat-square)](https://www.npmjs.com/package/bowl.js)
[![license](https://img.shields.io/github/license/elemefe/bowl.svg?style=flat-square)](https://github.com/ElemeFE/bowl)
[![GitHub stars](https://img.shields.io/github/stars/elemefe/bowl.svg?style=social&label=Star)](https://github.com/ElemeFE/bowl)
> 🍚 static resources front-end storage solving strategy

## Links
+ [Documentation](https://elemefe.github.io/bowl/)

## Quick Start
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
**bowl** will add these resources to cache(currently localStorage). whenever the url of the resources get modified, bowl will update the files in the cache. For more useful functions of **bowl**, just checkout the [API document](https://elemefe.github.io/bowl/).

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

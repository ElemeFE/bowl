# bowl.js
**bowl.js** is a loader that caches scripts and stylesheets with localStorage. After receiving any scripts or stylesheets, this tiny JavaScript library will save them to the browser's localStorage. When the file is requested next time, bowl.js will read it from localStorage and inject it to the webpage.

## Installation
``` shell
npm install bowl.js
```
then insert an `script` tag to your page(`head` tag is recommended):
``` html
<script src="path/to/the/script"></script>
```

## API
`bowl.js` will add a property named `bowl` to the global object, which is `window` in browsers. `bowl` has several methods for you.

### `bowl.add()`
`bowl.add(scripts)`  
*scripts:* an array of objects with the following fields:  
+ **url**(required): the URI of the script to be handled. Because of the CORS restrictions, the URI should be on the same origin as the caller. You can Either use an absolute address or a relative address. `bowl.js` converts all of them to absolute addresses.
+ **key**: the name for `bowl.js` to identify the script, if you don't specify this field, it defaults to the **url**.
+ **expire**: How log(in hours) before the cached item expires.

**Examples**  
```javascript
bowl.add([
  { url: '/main.js', key: 'main', expires: 10 }
]);
```

### `bowl.inject()`  
this method triggers the handling of the scripts added by `bowl.add()` method. `bowl.js` will check if the script has been stored in the localStorage and is not expired. If not, bowl will fetch it from the server and save it to cache(localStorage).

### `bowl.remove(scripts)`  
*scripts:* an array of objects with the following fields:  
+ **url**: url of the script you want to remove from the controlling scope of `bowl.js`.
+ **key**: id of the script to be removed.

## License
MIT

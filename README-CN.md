<p align="center"><image src="https://github.com/classicemi/bowl.js/blob/develop/assets/logo.png?raw=true" width="128"></p>

<p align="center">
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/dt/bowl.js.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/v/bowl.js.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/bowl.js"><img src="https://img.shields.io/npm/l/bowl.js.svg" alt="License"></a>
</p>

# bowl.js
**bowl** 是一个用 localStorage 来缓存脚本和样式资源的加载器。在获取脚本和样式之后，这个小巧的 JavaScript 库会将它们保存到浏览器的 localStorage 中。当这个文件下次再被请求的时候，bowl 将会从 localStorage 中读取并将它插入到页面中。

## 安装
``` shell
$ npm install bowl.js
```
然后，在页面中插入一个 `script` 标签（推荐在 `head` 标签中插入）：
``` html
<script src="node_modules/bowl.js/lib/bowl.js"></script>
```

## 示例
对于那些需要被缓存的脚本，你不需要在页面中写入 `script` 标签。只需要写一些简单的 JS，bowl 会替你处理接下来的事情。
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
**bowl** 会把这些脚本加入缓存（目前是 localStorage）。只要文件名中的 hash 发生了改变，bowl 会更新缓存中的文件。要了解更多 **bowl** 的功能，请参考 API 文档。

## 设置开发环境
克隆仓库之后，运行：
```shell
$ yarn install # 是的，推荐使用 yarn。 :)
```
### 常用 NPM 脚本：
```shell
# 监听并自动重新构建 lib/bowl.js 和 lib/bowl.min.js 文件
$ npm run dev

# 监听并自动在 Chrome 中重新执行单元测试
$ npm run test:unit

# 构建所有发布文件
$ npm run build
```

## 项目结构
+ **`build`**: 包含所有和构建过程相关的配置文件。
+ **`lib`**: 包含用来发布的文件，执行 **`test`** 脚本后，这个目录中的文件会被更新。
+ **`test`**: 包含所有的测试，单元测试使用 [Jasmine](http://jasmine.github.io/2.5/introduction) 编写，依赖 [Karma](http://karma-runner.github.io/1.0/index.html) 执行。
+ **`src`**: 包含源代码，很显然，代码使用 ES2015。

## API
**bowl** 将会在全局对象上添加一个 `bowl` 属性，在浏览器环境中是在 window 对象上。Bowl 包含了一些方法供你使用。

### `bowl.configure`
`bowl.configure(config)`

*config:* 一个包含 bowl 实例自定义设置的对象，支持的配置项有：
+ **timeout**: 获取资源操作的时间限制（单位为毫秒）。

**示例**
```javascript
bowl.configure({
  timeout: 10000
})
```

### `bowl.add`
`bowl.add(scripts)`

*scripts:* 包含一系列对象的数组，对象支持的属性如下：
+ **url**(必需): 需要被处理的脚本资源 URI 地址。 由于跨域问题的限制，URI 必需和页面同域，如果不同域的话，资源将不会被缓存。你既可以使用绝对路径，也可以省略 origin。 **bowl** 会将它们都转换为完整的绝对路径地址。
+ **key**: 用来让 **bowl** 识别资源的名字，如果你没有指定这个属性，它将默认为 **url**。
+ **noCache**: 默认为 `false`。当它为 `true` 时，Bowl 将不会缓存这个资源。

**示例**
```javascript
bowl.add([
  { url: '/main.js', key: 'main' }
])
```

### `bowl.inject`
`bowl.inject()`

这个方法触发对在 `bowl.add()` 方法中添加的资源进行的处理。Bowl 会检查资源是否在 localStorage 中有缓存。如果没有，bowl 将会从服务器获取资源并将它缓存至 localStorage。

### `bowl.remove`
`bowl.remove(scripts)`  
*scripts:* 这个参数支持两种类型：  
*String:* 表示将要从 bowl 中被移除的资源的 key。

*Object:* 包含以下属性的对象：
+ **url**: 想要从 bowl 的控制范围中被移除的资源的 url。
+ **key**: 要被移除资源的 key。

`bowl.remove()`  
参数 `scripts` 是可选的。当没有提供 `scripts` 参数时，bowl 将会从 bowl 实例和缓存中移除所有的资源。

## 开源许可类型
MIT

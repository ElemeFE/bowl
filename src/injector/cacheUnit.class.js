export default class CacheUnit {
  constructor(ingredient) {
    this.key = ingredient.key
    this.url = ingredient.url
    this.content = ingredient.content
    this.expire = ingredient.expire
  }
}

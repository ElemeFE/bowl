import * as utils from '../../src/utils';
import Bowl from '../../src/bowl.class';

describe('utils', () => {
  it('can tell if a variable is instance of `Object` properly', () => {
    const obj = { foo: 'bar' };
    const arr = [ 1, 2, 3 ];
    const primary = 123;

    expect(utils.isObject(obj)).toBe(true);
    expect(utils.isObject(arr)).toBe(false);
    expect(utils.isObject(primary)).toBe(false);
  });

  it('can tell if a variable is instance of `Array` properly', () => {
    const arr = [ 1, 2, 3 ];
    const obj = { foo: 'bar' };
    const primary = 123;

    expect(utils.isArray(arr)).toBe(true);
    expect(utils.isArray(obj)).toBe(false);
    expect(utils.isArray(primary)).toBe(false);
  });

  it('can tell if a path is an complete url', () => {
    const absolute1 = 'http://foo.com/bar';
    const absolute2 = 'https://foo.com/bar';
    const absolute3 = '//foo.com/bar';
    const relative1 = 'foo/bar';
    const relative2 = '/foo/bar/';

    expect(utils.isUrl(absolute1)).toBe(true);
    expect(utils.isUrl(absolute2)).toBe(true);
    expect(utils.isUrl(absolute3)).toBe(true);
    expect(utils.isUrl(relative1)).toBe(false);
    expect(utils.isUrl(relative2)).toBe(false);
  });
});

describe('bowl instance', () => {

  describe('ingredients', () => {
    it('add `scripts` to bowl.ingredient', () => {
      let bowl = new Bowl();
      bowl.add({ url: 'foo/bar' });
      expect(bowl.ingredients.length).toBe(1);
    });

    it('converts url to key of the ingredient if not provided', () => {
      let bowl = new Bowl();
      bowl.add({ url: 'foo/bar' });
      expect(bowl.ingredients[0].key).toBe('bowl-foo/bar');
    });

    it('jump out of `bowl.add` if the param is neither array nor object', () => {
      let bowl = new Bowl();
      bowl.add('foo/bar');
      expect(bowl.ingredients.length).toBe(0);
    });
  });

  describe('remove method', () => {
    it('remove all ingredients if no params are provided', () => {
      let bowl = new Bowl();
      bowl.add([
        { url: 'foo' },
        { url: 'bar' }
      ]);
      bowl.remove();
      expect(bowl.ingredients.length).toBe(0);
    });

    it('remove the correct item(has the provided key) out of ingredients', () => {
      let bowl = new Bowl();
      bowl.add([
        { url: 'foo' },
        { url: 'bar' }
      ]);
      bowl.remove('bar');
      expect(bowl.ingredients.length).toBe(1);
      expect(bowl.ingredients[0].key).toBe('bowl-foo');
    });
  });

});

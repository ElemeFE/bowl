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

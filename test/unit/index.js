import * as utils from '../../src/utils';
import Bowl from '../../src/Bowl';

describe('utils', () => {
  it('test if a variable is instance of `Object` properly', () => {
    const obj = { foo: 'bar' };
    const arr = [ 1, 2, 3 ];
    const primary = 123;

    expect(utils.isObject(obj)).toBe(true);
    expect(utils.isObject(arr)).toBe(false);
    expect(utils.isObject(primary)).toBe(false);
  });
});

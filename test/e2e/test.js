describe('bowl instance', () => {
  let bowl = new Bowl();

  beforeEach(() => {
    bowl = new Bowl();
  });

  describe('ingredients', () => {
    it('add `scripts` to bowl.ingredient', () => {
      bowl.add({ url: 'foo/bar' });
      expect(bowl.ingredients.length).to.be(1);
    });

    it('converts url to key of the ingredient if not provided', () => {
      bowl.add({ url: 'foo/bar' });
      expect(bowl.ingredients[0].key).to.be('bowl-foo/bar');
    });

    it('jump out of `bowl.add` if the param is neither array nor object', () => {
      bowl.add('foo/bar');
      expect(bowl.ingredients.length).to.be(0);
    });
  });

  describe('remove method', () => {
    it('remove all ingredients if no params are provided', () => {
      bowl.add([
        { url: 'foo' },
        { url: 'bar' }
      ]);
      bowl.remove();
      expect(bowl.ingredients.length).to.be(0);
    });

    it('remove the correct item(has the provided key) out of ingredients', () => {
      bowl.add([
        { url: 'foo' },
        { url: 'bar' }
      ]);
      bowl.remove('bar');
      expect(bowl.ingredients.length).to.be(1);
      expect(bowl.ingredients[0].key).to.be('bowl-foo');
    });
  });

  describe('inject method', () => {
    it('returns false if there is no ingredients', () => {
      expect(bowl.inject()).to.be(false);
    });

    it('returns a promise if there is any ingredient', () => {
      bowl.add({ url: 'foo/bar' });
      expect(bowl.inject() instanceof Promise).to.be(true);
    });
  });

});
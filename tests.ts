import SkipList from './index'
var
    assert = require('assert'),
    crypto = require('crypto');

function makeList(keys, values) {
    var list = new SkipList();
    for (let i = 0; i < keys.length; i++) {
        list.insert(keys[i], values[i]);
    }
    return list;
}

describe('SkipList', function() {
    describe('#insert()', function() {
        it('adds an item to the skiplist', function() {
            var list = new SkipList();
            assert.equal(list.length(), 0);
            list.insert('key', 'value');
            assert.equal(list.length(), 1);

            var result = list.search('key');
            assert.equal(result, 'value');
        });
    });

    describe('#valueAtIndex()', function() {
        it('works?', function() {
            let keys = ['cat', 'dog', 'aardvark', 'wallaby', 'chicken'];
            let values = [1, 3, 0, 4, 2];
            let v = [];
            let list = makeList(keys, values);
            for (let i = 0; i < list.length(); i++) {
                v.push(list.valueAtIndex(i));
            }
            assert.equal([0, 1, 2, 3, 4], v);
        });
    });
});
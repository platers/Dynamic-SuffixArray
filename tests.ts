import SkipList from './skiplist'
import { SuffixArray, Record } from './suffixarray'
var
    assert = require('assert')

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

            var result = list.getValue('key');
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
                assert.equal(list.valueAtIndex(i), i);
            }
        });
    });

});

describe('SuffixArray', function() {
    describe('#insertRecord()', function() {
        it('adds correct length', function() {
            const sa = new SuffixArray();
            const rec = new Record(2, 'hello');
            sa.insertRecord(rec);
            assert.equal(sa.length(), rec.text.length + 1);
            const rec2 = new Record(3, 'jack');
            sa.insertRecord(rec2);
            assert.equal(sa.length(), rec2.text.length + rec.text.length + 2);
        });
    });

    describe('#deleteRecord()', function() {
        it('deletes correct length', function() {
            const sa = new SuffixArray();
            const rec = new Record(2, 'hello');
            sa.insertRecord(rec);
            sa.deleteRecord(rec);
            assert.equal(sa.length(), 0);
        });
    });
});
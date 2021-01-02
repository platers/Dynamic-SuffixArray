import SkipList from './skiplist'
import { SuffixArray, Record } from './suffixarray'
var
    assert = require('assert'),
    fs = require('fs'),
    util = require('util')

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
});

const readTextFile : (fileName : string) => Promise<string> = async (fileName : string) => {
    return await util.promisify(fs.readFile)(fileName, 'utf8');
}

const getEnglishSuffixArray = async (fileName : string) => {
    const sa = new SuffixArray();
    const text = await readTextFile(fileName);
    console.log(text.length);
    const splitText = text.split('.');
    const records = [];
    console.log('records', splitText.length);
    for (let i = 0; i < splitText.length; i++) {
        sa.insertRecord(new Record(i, splitText[i]));
        records.push(splitText[i]);
        if (i % 1000 == 0) {
            console.log('inserted ', i, ' records. size', sa.length());
            if (sa.length() > 1e6) {
                break;
            }
        }
    }
    return {sa, records};
}

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

    const querySlow = (query : string, records : string[]) => {
        const vals = [];
        for (let i = 0; i < records.length; i++) {
            if (records[i].includes(query)) {
                vals.push(i);
            }
        }
        return vals;
    };

    describe('#query()', function() {
        it('works with 1 record', function() {
            const sa = new SuffixArray();
            const rec = new Record(2, 'hello');
            sa.insertRecord(rec);
            assert.deepEqual(sa.query('h', 10), [2]);
            assert.deepEqual(sa.query('hel', 10), [2]);
            assert.deepEqual(sa.query('ell', 10), [2]);
            assert.deepEqual(sa.query('o', 10), [2]);
            assert.deepEqual(sa.query('or', 10), []);
            assert.deepEqual(sa.query('l', 10), [2]);
        });

        it('works with 2 records', function() {
            const sa = new SuffixArray();
            const rec = new Record(2, 'hello');
            const rec2 = new Record(3, 'helmets are cool');
            sa.insertRecord(rec);
            sa.insertRecord(rec2);
            assert.deepEqual(sa.query('h', 10).sort(), [2, 3]);
            assert.deepEqual(sa.query('hel', 10).sort(), [2, 3]);
            assert.deepEqual(sa.query('ell', 10).sort(), [2]);
            assert.deepEqual(sa.query('o', 10).sort(), [2, 3]);
            assert.equal(sa.query('o', 1).length, 1);
            assert.deepEqual(sa.query('or', 10).sort(), []);
            assert.deepEqual(sa.query('l', 10).sort(), [2, 3]);
            assert.deepEqual(sa.query('are ', 10).sort(), [3]);
        });

        it('works with lots of records', async function () {
            const {sa, records} = await getEnglishSuffixArray('sampletext.txt');
            for (let record of records) {
                for (let word of record.split(' ')) {
                    //console.log(word, sa.query(word, 100).length);
                    assert.deepEqual(sa.query(word, 100).sort(), querySlow(word, records).sort());
                }
            }
        });

        it('works with lots of records and delete', async function () {
            const {sa, records} = await getEnglishSuffixArray('sampletext.txt');
            for (let i = 0; i < records.length / 2; i++) {
                sa.deleteRecord(new Record(i, records[i]));
                records[i] = '';
            }
            for (let record of records) {
                for (let word of record.split(' ')) {
                    if (word != '') {
                        assert.deepEqual(sa.query(word, 100).sort(), querySlow(word, records).sort());
                    }
                }
            }
        });
    });

    describe.skip('#performance', function() {
            it('works with lots of records and delete on big.txt with 1 million chars', async function () {
            const {sa, records} = await getEnglishSuffixArray('big.txt');
            console.log('inserted records');
            for (let i = 0; i < records.length / 2; i++) {
                sa.deleteRecord(new Record(i, records[i]));
                records[i] = '';
            }
            console.log('deleted records');

            let i = 0;
            for (let record of records) {
                if (i > 20000) {
                    break;
                }
                for (let word of record.split(' ')) {
                    if (word != '') {
                        sa.query(word, 10);
                        i++;
                        if (i % 1000 == 0) {
                            console.log('query', i);
                        }
                    }
                }
            }
        });
    });

});
import SkipList from './skiplist'

type Char = string;
type Id = number;

class Key {
    public char : Char;
    public id : Id;
    public next : Key; //null if end of record
    constructor (char : Char, id : Id, next : Key) {
        this.char = char;
        this.id = id;
        this.next = next;
    } 
}

class Value {

}

class Record {
    public id : Id;
    public text : string;
    constructor (id : number, text : string) {
        this.id = id;
        this.text = text;
    }
}

class SuffixArray {
    private skiplist : SkipList<Key, Value>;
    
    constructor () {
        this.initSkipList();
    }
    
    private initSkipList = () => {
        this.skiplist = new SkipList<Key, Value>(0.5, 10);
        const compare = (a : Key, b : Key) => {
            if (!a.next) return false;
            if (!b.next) return true;
            if (a.char != b.char) return a.char < b.char;
            return compare(a.next, b.next);
        }
        this.skiplist.setCompare(compare);
    }

    private getEndOfRecordKey = (id : Id) => {
        return new Key(null, id, null);
    }

    private applyToRecord = (record : Record, f : (key : Key) => void) => {
        let lastKey = this.getEndOfRecordKey(record.id);
        f(lastKey);
        for (let i = record.text.length - 1; i >= 0; i--) {
            const key = new Key(record.text[i], record.id, lastKey);
            f(key);
            lastKey = key;
        }
        return lastKey;
    }

    public insertRecord = (record : Record) => {
        this.applyToRecord(record, this.skiplist.insert);
    }

    public deleteRecord = (record : Record) => {
        this.applyToRecord(record, this.skiplist.delete);
    }

    private match = (pattern : Key, key : Key) => {
        if (!pattern.next) return true;
        if (!key.next) return false;
        if (pattern.char != key.char) return false;
        return this.match(pattern.next, key.next);
    }

    public query = (pattern : string, num_results : number) => {
        const record = new Record(null, pattern);
        const patternKey = this.applyToRecord(record, (key : Key) => {});
        const keys = this.skiplist.getNextKeys(patternKey, num_results, (key : Key) => { return key.id });
        const results = [];
        for (const key of keys) {
            if (this.match(patternKey, key)) {
                results.push(key.id);
            } else { // matching suffixes are consecutive
                break;
            }
        }
        return results; 
    }
}
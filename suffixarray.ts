import { Datastore } from './datastore';
import { SkipList, Key } from './skiplist'

type Id = number;

export class Record {
    public id : Id;
    public text : string;
    constructor (id : number, text : string) {
        this.id = id;
        this.text = text;
    }
}

export class SuffixArray {
    private skiplist : SkipList;
    private store: Datastore;
    
    constructor () {
        this.store = new Datastore();
        this.skiplist = new SkipList(this.store, 0.5, 30);
    }
    
    private getEndOfRecordKey = (id : Id) => {
        return new Key('', id, -1, null);
    }

    public insertRecord = (record : Record) => {
        let lastNode = this.skiplist.insert(this.getEndOfRecordKey(record.id));
        for (let i = record.text.length - 1; i >= 0; i--) {
            const key = new Key(record.text[i], record.id, i, lastNode.id);
            lastNode = this.skiplist.insert(key);
        }
    }

    public deleteRecord = (record : Record) => {
        const keys = [this.getEndOfRecordKey(record.id)];
        // keys are in reverse order
        for (let i = record.text.length - 1; i >= 0; i--) {
            const node = this.skiplist.getNodeFromKey(keys[keys.length - 1]);
            if (node == null) {
                console.log("Could not find record to delete");
                return;
            }
            const key = new Key(record.text[i], record.id, i, node.id);
            keys.push(key);
        }
        // must delete nodes front to back
        for (let i = keys.length - 1; i >= 0; i--) {
            this.skiplist.delete(keys[i]);
        }
    }

    private match = (pattern : string, key : Key) : boolean => {
        if (pattern.length == 0) return true;
        if (key.next == null) return false; // key is end of record
        if (pattern[0] != key.char) return false;
        return this.match(pattern.slice(1), this.skiplist.getNode(key.next)!.key);
    }

    public query = (pattern : string, num_results : number) => {
        const keys = this.skiplist.getNextKeys(pattern, num_results);
        const results = [];
        for (const key of keys) {
            if (this.match(pattern, key)) {
                results.push(key.id);
            } else { // matching suffixes are consecutive
                break;
            }
        }
        return results; 
    }

    public length = () => {
        return this.skiplist.length();
    }
}
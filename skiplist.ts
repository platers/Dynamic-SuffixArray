import { Datastore } from './datastore';
import { Char, Id, SkipListNodeId } from './types'

const headNodeId = -1, tailNodeId = -2;

export class Key {
    public char : Char;
    public id : Id;
    public col : number;
    public next : SkipListNodeId | null; // id of skiplistnode storing the next suffix. null if end of record
    constructor (char : Char, id : Id, col : number, next : SkipListNodeId | null) {
        this.char = char;
        this.id = id;
        this.col = col;
        this.next = next;
    } 

    public isNil = () => {
        return this.id === tailNodeId;
    }

    public isHead = () => {
        return this.id === headNodeId;
    }
}

export class SkipListNode {
    public forward : SkipListNodeId[];
    public width : number[];
    public key : Key;
    public id : number; //-1 reserved for head, -2 for tail

    constructor (id : number, levels : number, key : Key) {
        this.key = key;
        this.forward = new Array(levels);
        this.width = new Array(levels);
        this.id = id;
    }

    public isNil = () => {
        return this.key.id === tailNodeId;
    }

    public isHead = () => {
        return this.key.id === headNodeId;
    }
}

export class SkipList {
    private store: Datastore;
    private p : number;
    private maxLevel : number;
    private head : SkipListNode;
    private tail : SkipListNode;
    private size : number;

    constructor (store : Datastore, p : number = 0.5, maxLevel : number = 10) {
        this.store = store;
        this.size = 0;
        this.p = p;
        this.maxLevel = maxLevel;
        this.tail = this.getTailNode();
        this.head = this.getHeadNode();
        for (let i = 0; i < this.maxLevel; i++) {
            this.head.forward[i] = this.tail.id;
        }
    }

    private compareKey = (a : Key, b : Key) : boolean => {
        // return a < b
        if (b.isHead() ) return false; //null when b is head
        if (a.isHead()) return true;
        if (a.isNil()) return false;
        if (b.isNil()) return true;

        if (a.next == null && b.next == null) return a.id < b.id; // sort by id for delete
        if (a.next == null) return false; // end of key 
        if (b.next == null) return true; // end of key

        if (a.char != b.char) return a.char < b.char;
        return this.compareKey(this.getNode(a.next)!.key, this.getNode(b.next)!.key);
    }
    private sameKey = (a : Key, b : Key) => {
        return a.id === b.id && a.col === b.col;
    }
    public getNode = (id : SkipListNodeId) => {
        return this.store.getNode(id);
    }

    public getNodeFromKey = (key : Key) => {
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            let next = this.getNode(x.forward[i])!;
            while (!next.isNil() && this.compareKey(next.key, key)) {
                x = next;
                next = this.getNode(x.forward[i])!;
            }
        }
        x = this.getNode(x.forward[0])!;
        if (!x.isNil() && this.sameKey(x.key, key)) {
            return x;
        } else {
            return null;
        }
    }

    private newNode = (key : Key) => {
        const node = new SkipListNode(this.store.newId(), this.maxLevel, key);
        this.store.setNode(node);
        return node;
    }

    private getHeadNode = () => {
        const result = this.store.getNode(headNodeId);
        if (result) {
            return result;
        } else {
            return this.newNode(new Key('', headNodeId, -1, null));
        }
    }

    private getTailNode = () => {
        const result = this.store.getNode(tailNodeId);
        if (result) {
            return result;
        } else {
            return this.newNode(new Key('', tailNodeId, -2, null));
        }
    }

    private randomLevel = () => {
        let lvl = 1;
        while (Math.random() < this.p && lvl < this.maxLevel) {
            lvl++;
        }
        return lvl;
    }

    private lowerBound = (key : Key) => {
        let update : SkipListNode[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            let next = this.getNode(x.forward[i])!;
            while (!next.isNil() && this.compareKey(next.key, key)) {
                x = next;
                next = this.getNode(x.forward[i])!;
            }
            update[i] = x;
        }
        x = this.getNode(x.forward[0])!;
        return {x, update};
    }

    public insert = (key : Key) => {
        let {x, update} = this.lowerBound(key);
        if (!x.isNil() && this.sameKey(x.key, key)) {
            //overwrite existing?
        } else {
            const lvl = this.randomLevel();
            x = this.newNode(key);
            for (let i = 0; i < lvl; i++) {
                x.forward[i] = update[i].forward[i];
                update[i].forward[i] = x.id;
            }
            this.size++;
        }
        return x;
    }

    public delete = (key : Key) => {
        let {x, update} = this.lowerBound(key);
        if (!x.isNil() && this.sameKey(x.key, key)) {
            for (let i = 0; i < this.maxLevel; i++) {
                if (this.getNode(update[i].forward[i]) != x) {
                    break;
                } else {
                    update[i].forward[i] = x.forward[i];
                }
            }
            this.size--;
        } else {
            console.log('Failed to delete key not in suffix array', key, x.key);
        }
    }

    private compareKeyString = (a : Key, b : string) : boolean => {
        //TODO
        // return a < b
        if (b.length == 0) return false; // end of pattern
        if (a.isHead()) return true;
        if (a.isNil()) return false;

        if (a.next == null) return false; // end of key 

        if (a.char != b[0]) return a.char < b[0];
        return this.compareKeyString(this.getNode(a.next)!.key, b.slice(1));
    }

    public length = () => {
        return this.size;
    }

    // Get up to num_results unique ids that might match query
    public getNextKeys = (query : string, num_results : number) => {
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            let next = this.getNode(x.forward[i])!;
            while (!next.isNil() && this.compareKeyString(next.key, query)) {
                x = next;
                next = this.getNode(x.forward[i])!;
            }
        }
        x = this.getNode(x.forward[0])!;
        const ids = new Set();
        const results = [];
        while (!x.isNil() && ids.size < num_results) {
            if (!ids.has(x.key.id)) {
                ids.add(x.key.id);
                results.push(x.key);
            }
            x = this.getNode(x.forward[0])!;
        }
        return results;
    }
}
class SkipListNode<Key, Value> {
    public forward : SkipListNode<Key, Value>[];
    public width : number[];
    public key : Key;
    public value : Value;
    private nil : boolean;

    constructor (levels : number, key : Key, value : Value, nil : boolean = false) {
        this.key = key;
        this.value = value;
        this.nil = nil;
        this.forward = new Array(levels);
        this.width = new Array(levels);
    }

    public isNil = () => {
        return this.nil;
    }
}

export default class SkipList<Key, Value> {
    private p : number;
    private maxLevel : number;
    private head : SkipListNode<Key, Value>;
    private tail : SkipListNode<Key, Value>;
    private size : number;
    private compareKey : (a : Key, b : Key) => boolean;
    private sameKey : (a : Key, b : Key) => boolean;
    //private level : number;

    constructor (p : number = 0.5, maxLevel : number = 10) {
        this.size = 0;
        this.p = p;
        this.maxLevel = maxLevel;
        //this.level = 0; //implement this for a little more speed
        this.tail = new SkipListNode<Key, Value>(this.maxLevel, null, null, true);
        this.head = new SkipListNode<Key, Value>(this.maxLevel, null, null);
        this.compareKey = (a : Key, b : Key) => {
            return a < b;
        }
        this.sameKey = (a : Key, b : Key) => {
            return a === b;
        }
        for (let i = 0; i < this.maxLevel; i++) {
            this.head.forward[i] = this.tail;
            this.head.width[i] = 1;
        }
    }

    public setCompare = (lt : ((a : Key, b : Key) => boolean)) => {
        this.compareKey = lt;
    }

    public setSameKey = (same : ((a : Key, b : Key) => boolean)) => {
        this.sameKey = same;
    }

    private randomLevel = () => {
        let lvl = 1;
        while (Math.random() < this.p && lvl < this.maxLevel) {
            lvl++;
        }
        return lvl;
    }

    public insert = (key : Key, value : Value = null) => {
        let update : SkipListNode<Key, Value>[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (!x.forward[i].isNil() && this.compareKey(x.forward[i].key, key)) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (!x.isNil && this.sameKey(x.key, key)) {
            x.value = value;
        } else {
            const lvl = this.randomLevel();
            x = new SkipListNode<Key, Value>(this.maxLevel, key, value);
            for (let i = 0; i < lvl; i++) {
                x.forward[i] = update[i].forward[i];
                update[i].forward[i] = x;
            }
            this.size++;
        }
    }

    public delete = (key : Key) => {
        let update : SkipListNode<Key, Value>[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (!x.forward[i].isNil() && this.compareKey(x.forward[i].key, key)) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (!x.isNil() && this.sameKey(x.key, key)) {
            for (let i = 0; i < this.maxLevel; i++) {
                if (update[i].forward[i] != x) {
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

    private getNodeBefore = (key : Key) => {
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (!x.forward[i].isNil() && this.compareKey(x.forward[i].key, key)) {
                x = x.forward[i];
            }
        }
        return x;
    }

    public getValue = (key : Key) => {
        let x = this.getNodeBefore(key);
        x = x.forward[0];
        if (this.sameKey(x.key, key)) {
            return x.value;
        } else {
            return null;
        }
    }

    public length = () => {
        return this.size;
    }

    // Get up to num_results unique ids that might match key
    public getNextKeys = (key : Key, num_results : number, id : (key : Key) => number) => {
        let x = this.getNodeBefore(key);
        x = x.forward[0];
        const ids = new Set();
        const results = [];
        while (!x.isNil() && ids.size < num_results) {
            if (!ids.has(id(x.key))) {
                ids.add(id(x.key));
                results.push(x.key);
            }
            x = x.forward[0];
        }
        return results;
    }
}
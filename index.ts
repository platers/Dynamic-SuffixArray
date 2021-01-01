type Key = string;

class SkipListNode<E> {
    public forward : SkipListNode<E>[];
    public width : number[];
    public key : Key;
    public value : E;
    private nil : boolean;

    constructor (levels : number, key : Key, value : E, nil : boolean = false) {
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

export default class SkipList<E> {
    private p : number;
    private maxLevel : number;
    private head : SkipListNode<E>;
    private tail : SkipListNode<E>;
    private size : number;
    //private level : number;

    constructor () {
        this.size = 0;
        this.p = 0.5;
        this.maxLevel = 10;
        //this.level = 0;
        this.tail = new SkipListNode<E>(this.maxLevel, null, null, true);
        this.head = new SkipListNode<E>(this.maxLevel, null, null);
        for (let i = 0; i < this.maxLevel; i++) {
            this.head.forward[i] = this.tail;
            this.head.width[i] = 1;
        }
    }

    private randomLevel = () => {
        let lvl = 1;
        while (Math.random() < this.p && lvl < this.maxLevel) {
            lvl++;
        }
        return lvl;
    }

    private compareKey = (a : SkipListNode<E>, b : Key) => {
        if (a.isNil()) {
            return false;
        }
        return a.key < b;
    }

    public insert = (key : Key, value : E) => {
        let update : SkipListNode<E>[] = new Array(this.maxLevel);
        let skipped : number[] = new Array(this.maxLevel, 0);
        let x = this.head;
        let pos = 0; //pos = pos(x)
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (this.compareKey(x.forward[i], key)) {
                pos += x.width[i];
                x = x.forward[i];
            }
            update[i] = x;
            skipped[i] = pos;
        }
        x = x.forward[0];
        if (x.key === key) {
            x.value = value;
        } else {
            const lvl = this.randomLevel();
            x = new SkipListNode<E>(this.maxLevel, key, value);
            for (let i = 0; i < this.maxLevel; i++) {
                x.forward[i] = update[i].forward[i];
                x.width[i] = skipped[i] + update[i].width[i] - pos;
                update[i].forward[i] = x;
                update[i].width[i] = pos - skipped[i] + 1;
            }
            this.size++;
        }
    }

    public delete = (key : Key) => {
        let update : SkipListNode<E>[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (this.compareKey(x.forward[i], key)) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (x.key === key) {
            for (let i = 0; i < this.maxLevel; i++) {
                if (update[i].forward[i] != x) {
                    break;
                } else {
                    update[i].width[i] += x.width[i] - 1;
                    update[i].forward[i] = x.forward[i];
                }
            }
            this.size--;
        }
    }

    public search = (key : Key) => {
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (this.compareKey(x.forward[i], key)) {
                x = x.forward[i];
            }
        }
        x = x.forward[0];
        if (x.key === key) {
            return x.value;
        } else {
            return null;
        }
    }

    public length = () => {
        return this.size;
    }

    public valueAtIndex = (idx: number) => {
        if (idx >= this.size) {
            return null;
        }
        let x = this.head;
        idx++;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (idx >= x.width[i]) {
                idx -= x.width[i];
                x = x.forward[i];
            }
        }
        return x.value;
    }
}
type Key = string;

class SkipListNode<E> {
    public forward : SkipListNode<E>[];
    public key : Key;
    public value : E;
    private nil : boolean;

    constructor (levels : number, key : Key, value : E, nil : boolean = false) {
        this.key = key;
        this.value = value;
        this.nil = nil;
        this.forward = new Array(levels);
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
        }
    }

    private randomLevel = () => {
        let lvl = 1;
        while (Math.random() < this.p && lvl < this.maxLevel) {
            lvl++;
        }
        return lvl;
    }

    public insert = (key : Key, value : E) => {
        let update : SkipListNode<E>[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (x.forward[i].key < key) {
                x = x.forward[i];
            }
            update[i] = x;
        }
        x = x.forward[0];
        if (x.key === key) {
            x.value = value;
        } else {
            const lvl = this.randomLevel();
            x = new SkipListNode<E>(this.maxLevel, key, value);
            for (let i = 0; i < this.maxLevel; i++) {
                x.forward[i] = update[i].forward[i];
                update[i].forward[i] = x;
            }
            this.size++;
        }
    }

    public delete = (key : Key) => {
        let update : SkipListNode<E>[] = new Array(this.maxLevel);
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (x.forward[i].key < key) {
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
                    update[i].forward[i] = x.forward[i];
                }
            }
            this.size--;
        }
    }

    public search = (key : Key) => {
        let x = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (x.forward[i].key < key) {
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
}
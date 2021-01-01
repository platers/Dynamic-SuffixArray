import SkipList from './skiplist'

class Key {

}

class Value {

}

class Record {
    public id : number;
    public text : string;
    constructor (id : number, text : string) {
        this.id = id;
        this.text = text;
    }
}

class SuffixArray {
    private skiplist : SkipList<Key, Value>;
    
    constructor () {
        this.skiplist = new SkipList<Key, Value>();
    }

    public insertRecord = (record : Record) => {
        
    }

    public deleteRecord = (record : Record) => {

    }

    public query = (pattern : string, num_results : number) => {

    }
}
import { SkipList } from "./skiplist";

import { SkipListNode } from './skiplist';
import { SkipListNodeId } from './types';

export class Datastore {
    private data: { [id: number]: SkipListNode } = {};
    private lastId: number = 0;
    
    public getNode = (id : SkipListNodeId) => {
        if (id in this.data) {
            return this.data[id];
        } else {
            return null;
        }
    }

    public setNode = (node : SkipListNode) => {
        this.data[node.id] = node;
    }

    public newId = () => {
        this.lastId++;
        return this.lastId;
    }
}
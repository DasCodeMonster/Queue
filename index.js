const {EventEmitter} = require("events");

class Queue extends EventEmitter{
    constructor(data={currentItem: null, loopAll:false, loopSingle:false, maxLimit:null}){
        super();
        this._currentItem = data.currentItem || null;
        this._loopAll = data.loopAll || false;
        this._loopSingle = data.loopSingle || false;
        this._maxLimit = data.maxLimit || null;
        if(data instanceof Queue){
            this._queue = new Map(data.queue.entries());
        }else{
            this._queue = new Map();
        }
    }
    get currentItem(){
        return this._currentItem;
    }
    set currentItem(item){
        if(typeof item !== typeof this._currentItem){
            this.emit("error", new Error("Wrong input type"));
            return;
        }else{
            const oldItem = this._currentItem;
            this._currentItem = item;
            if(oldItem && this.loopAll) this.addItems(this.size, oldItem);
            this.emit("currentItemChange", oldItem, item);
        }
    }
    get loopAll(){
        return this._loopAll;
    }
    set loopAll(boolean){
        if(typeof boolean !== "boolean") this.emit("error", new Error("Must be a boolean"));
        else{
            const oldLoopState = {loopAll: this.loopAll, loopSingle: this.loopSingle};
            this._loopAll = boolean;
            const newLoopState = {loopAll: boolean, loopSingle: this.loopSingle};
            this.emit("loopChange", oldLoopState, newLoopState);
        }
    }
    get loopSingle(){
        return this._loopSingle;
    }
    set loopSingle(boolean){
        if(typeof boolean !== "boolean") this.emit("error", new Error("Must be a boolean"));
        else {
            const oldLoopState = {loopAll: this.loopAll, loopSingle: this.loopSingle};
            this._loopSingle = boolean;
            const newLoopState = {loopAll: this.loopAll, loopSingle: boolean};
            this.emit("loopChange", oldLoopState, newLoopState);
        }
    }
    get maxLimit(){
        return this._maxLimit;
    }
    set maxLimit(limit){
        if(typeof limit !== "number") this.emit("error", new Error("Must be a number"));
        else {
            const oldMaxLimit = this.maxLimit;
            this._maxLimit = limit;
            this.emit("maxLimitChange", oldMaxLimit, limit);
        }
    }
    get size(){
        return this._queue.size;
    }
    /**
     * 
     * @param  {...number} indexes 
     */
    getItem(...indexes){
        if(indexes.length === 0) return;
        else if(indexes.length === 1){
            const [index] = indexes;
            return this._queue.has(index)?this._queue.get(index):null;
        }else {
            const result = [];
            indexes.forEach(index=>{
                result.push(this._queue.has(index)?this._queue.get(index):null);
            });
            return result;
        }
    }
    /**
     * 
     * @param {number} index 
     * @param  {...any} items 
     */
    addItems(index, ...items){
        if(typeof index !== "number" && index !== null) throw new Error("Index must be a number");
        if(this.maxLimit && (this.size + items.length) > this.maxLimit) return false;
        const copy = this.toArray();
        if(index === null || index >= copy.length){
            copy.push(...items);
        }else{
            copy.splice(index, 0, ...items);
        }
        this._queue = new Map(copy.entries());
        this.emit("add");
        return true;
    }
    removeItems(...indexes){
        const copy = this.toArray();
        const removed = [];
        indexes.forEach(index=>{
            if(typeof index !== "number") throw new Error("Index must be a number");
            if(index >= indexes.length || index < 0) return;
            removed.push(copy.splice(index, 1));
        });
        this._queue = new Map(copy.entries());
        this.emit("remove", removed);
        return removed;
    }
    /**
     * 
     * @param {number} endIndex 
     * @param  {...number} indexes 
     */
    moveItems(endIndex, ...indexes){
        const copy = this.toArray();
        let toMove = [];
        indexes.forEach(index=>{
            if(typeof index !== "number") throw new Error("Index must be a number");
            if(index >= indexes.length || index < 0) return;
            toMove = [...toMove, ...copy.splice(index, 1)];
        });
        copy.splice(endIndex, 0, ...toMove);
        this._queue = new Map(copy.entries());
        this.emit("move", toMove);
        return toMove;
    }
    /**
     * 
     * @returns {any[]}
     */
    toArray(){
        return Array.from(this._queue.values());
    }
    foreach(callback){
        this._queue.forEach(callback);
    }
    shuffle(){
        const copy = this.toArray();
        let currentIndex = copy.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = copy[currentIndex];
            copy[currentIndex] = copy[randomIndex];
            copy[randomIndex] = temporaryValue;
        }
        this._queue = new Map(copy.entries());
        this.emit("shuffle", this);
    }
    next(){
        if(this.loopSingle){
            return this.currentItem;
        }else{
           this.skip()
        }
    }
    skip(){
        const copy = this.toArray();
        if(copy.length === 1 && (this.loopAll || this.loopSingle)){
            return this.currentItem;
        }else if(copy.length === 0) return null;
        const current = this.currentItem;
        this.currentItem = copy.shift() || null;
        if(this.loopAll) copy.push(current);
        this._queue = new Map(copy.entries());
        return this.currentItem;
    }
    
}

module.exports = {Queue};
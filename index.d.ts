
declare module "queue" {
    import {EventEmitter} from "events";
    type LoopState = {loopAll:boolean, loopSingle:boolean};
    export class Queue<t> extends EventEmitter {
        constructor(data: Queue | {qeueue:t[], currentItem:t, loopSingle:boolean, loopAll:boolean, maxLimit:number});
        
        readonly _queue:Map<number,t>;
        readonly _currentItem: t;
        readonly _loopSingle:boolean;
        readonly _loopAll:boolean;
        readonly _maxLimit:number;

        get currentItem():t;
        set currentItem(item:t):void;

        get loopSingle():boolean;
        set loopSingle(boolean: boolean):void;

        get loopAll():boolean;
        set loopAll(boolean:boolean):void;

        get maxLimit():number;
        set maxLimit():number;

        get size():number;

        addItems(index:number, ...items:t[]):boolean;
        getItem(index:number):t;
        getItem(...indexes:number[]):t[];
        next():t;
        skip():t;
        removeItems(...indexes:number[]):t[];
        moveItems(endIndex, ...indexes):t[];
        toArray():t[];
        shuffle():t[];
        foreach(callback:(item:t, index:number, map:Map<number,t>)=>void):void;

        //events
        public on(event:"currentItemChange", listener: (oldItem:t, newItem:t)=>void):this;
        public on(event:"loopChange", listener: (oldLoopState:LoopState, newLoopState:LoopState)=>void):this;
        public on(event:"maxLimitChange", listener: (oldMaxLimit:number, newMaxLimit:number)=>void):this;
        public on(event:"add", listener: ()=>void):this;
        public on(event:"remove", listener: (removed:t[])=>void):this;
        public on(event:"move", listener: (moved:t[])=>void):this;
        public on(event:"shuffle", listener: (queue:Queue)=>void):this;
    }
}

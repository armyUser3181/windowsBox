import cdebugger from "../Debugger/cdebugger.js";
import SuperTaster from "./SuperTaster.js";

export default class DebuggerTaster extends SuperTaster {

    debugger = new cdebugger
    constructor() {
        super();
        this.debugger.log('hello world');
        this.debugger.measure(()=>{
            const list = new Array;
            for(let i = 0; i < (1 << 16); i++) {
                list.push(i);
            }
            const toList = new Array;
            list.forEach(value=>{
                toList.push( value * 3);
            });
            this.debugger.printMemoryUsage();
            this.debugger.log(list);
            return;

        }, 'tast');
    }


}
import Debugger from "../Debugger/Debugger.js";
import Taster from "./Taster.js";

export default class DebuggerTaster extends Taster {

    debugger = new Debugger
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
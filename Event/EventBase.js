import cdebugger from "../Debugger/Debugger.js";
import SuperMap from "../Map/SuperMap.js";
import EventInstance from "./EventInstance.js";

const debug = new cdebugger();

/** @type {Map<string, EventInstance} */
class InstanceMap extends SuperMap {}

/** @type {Map<HTMLElement, string} */
class keyMap extends WeakMap {}



export default class EventBase {
    constructor() {
        this.eventMap = new keyMap;
        this.eventKeyMap = new InstanceMap;
    }
}

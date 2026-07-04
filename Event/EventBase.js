import cdebugger from "../Debugger/Debugger.js";
import EventInstance from "./EventInstance.js";


/*

event key map <HTMLElement, string> -> event map <string, elementEvents> -> event element events <event tag, event instance> -> event instance < event name, event data array< tag, action > >

*/

const debug = new cdebugger();

class ElementEventMap {

    map = new Map();

    constructor() {}

    /** @param {string} eventTag @param {EventInstance} instance */
    push(eventTag, instance) {
        if (typeof eventTag === "string" && instance instanceof EventInstance) {
            this.map.set(eventTag, instance);
        } else {
            debug.error(`Invalid event tag or instance. Event tag must be a string and instance must be an EventInstance.`);
        }
        return this;
    }

    /** @param {string} eventTag */
    pop(eventTag) {
        if (typeof eventTag === "string" && this.map.has(eventTag)) {
            this.map.delete(eventTag);
        } else {
            debug.error(`Invalid event tag. Event tag must be a string.`);
        }
        return this;
    }

    /** @param {string} eventTag */
    get(eventTag) {
        if (typeof eventTag === "string" && this.map.has(eventTag)) {
            return this.map.get(eventTag);
        }
        debug.error(`Invalid event tag. Event tag must be a string.`);
        return null;
    }
}

class EventMap {
    /** @type {Map<string, ElementEventMap>} */
    map = new Map();

    constructor() {}

    /** @param {string} key @param {string} eventTag @param {EventInstance} instance */
    push(key, eventTag, instance) {
        if (typeof key === "string" && typeof eventTag === "string" && instance instanceof EventInstance) {
            if (!this.map.has(key)) {
                this.map.set(key, new ElementEventMap());
            }
            this.map.get(key).push(eventTag, instance);
        } else {
            debug.error(`Invalid key, event tag, or instance. Key and event tag must be strings and instance must be an EventInstance.`);
        }
        return this;
    }

    /** @param {string} key @param {string} [eventTag] */
    pop(key, eventTag) {
        if (typeof key === "string" && this.map.has(key)) {
            if (eventTag === undefined) {
                this.map.delete(key);
            } else if (typeof eventTag === "string") {
                this.map.get(key).pop(eventTag);
            } else {
                debug.error(`Invalid event tag. Event tag must be a string.`);
            }
        } else {
            debug.error(`Invalid key. Key must be a string.`);
        }
        return this;
    }

    /** @param {string} key @param {string} [eventTag] */
    get(key, eventTag) {
        if (typeof key === "string" && this.map.has(key)) {
            const elementEvents = this.map.get(key);
            if (eventTag === undefined) {
                return elementEvents;
            }
            if (typeof eventTag === "string") {
                return elementEvents.get(eventTag);
            }
            debug.error(`Invalid event tag. Event tag must be a string.`);
        } else {
            debug.error(`Invalid key. Key must be a string.`);
        }
        return null;
    }
}

class EventKeyMap {
    /** @type {Map<HTMLElement, string>} */
    map = new Map();

    constructor() {}

    /** @param {HTMLElement} element @param {string} key */
    push(element, key) {
        if (element instanceof HTMLElement && typeof key === "string") {
            this.map.set(element, key);
        } else {
            debug.error(`Invalid element or key. Element must be an instance of HTMLElement and key must be a string.`);
        }
        return this;
    }

    /** @param {HTMLElement} element */
    pop(element) {
        if (element instanceof HTMLElement && this.map.has(element)) {
            this.map.delete(element);
        } else {
            debug.error(`Invalid element. Element must be an instance of HTMLElement.`);
        }
        return this;
    }

    /** @param {HTMLElement} element */
    get(element) {
        if (element instanceof HTMLElement && this.map.has(element)) {
            const key = this.map.get(element);
            if (typeof key === "string") {
                return key;
            }
            debug.error(`Key associated with element is not a string.`);
        } else {
            debug.error(`Invalid element. Element must be an instance of HTMLElement.`);
        }
        return null;
    }
}

export default class EventBase {
    constructor() {
        this.eventMap = new EventMap();
        this.eventKeyMap = new EventKeyMap();
    }
}

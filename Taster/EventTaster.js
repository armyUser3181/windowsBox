
import EventRepository from "../Event/EventRepository.js";
import EventCaller from "../Event/EventCaller.js";
import EventInstance from "../Event/EventInstance.js";
import EventAction from "../Event/EventAction.js";
import SuperTaster from "./SuperTaster.js";



export default class EventTaster extends SuperTaster {
    constructor() {
        super();
        this.eventRepository = new EventRepository;
    }

    part1() {
        
    }
}
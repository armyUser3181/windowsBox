
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
        const target = document.getElementById('back');
        if(!target) return false;
        const caller = new EventCaller({
            repository: this.eventRepository,
            eventClass: MouseEvent,
            eventName: 'click',
            target: target,
        });
        const instance = new EventInstance({
            id: 'instance1',
            repository: this.eventRepository,
            actions: [
                new EventAction({
                    id: 'action1',
                    handler: ({event, caller, actions, eventInstance})=>{
                        console.log('action1 executed', {event, caller, actions, eventInstance});
                    }
                }),
                new EventAction({
                    id: 'action2',
                    handler: ({event, caller, actions, eventInstance})=>{
                        console.log('action2 executed', {event, caller, actions, eventInstance});
                    }
                }),
            ],
            handler: ({event, caller, actions, eventInstance})=>{
                console.log('instance executed', {event, caller, actions, eventInstance});
                actions.forEach(action=>{
                    action.execute({event, caller, eventInstance});
                });
            }
        });
        this.eventRepository.push(caller);
        this.eventRepository.push(instance);
        caller.bind();
        // instance.bind();
    }
}
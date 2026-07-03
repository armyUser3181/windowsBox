import WindowClosebar from "./WindowClosebar.js";
import WindowMaxizebar from "./WindowMaxizebar.js";
import WindowMinizebar from "./WindowMinizebar.js";

export default class WindowMenubar {

    constructor() {
        this.closebar = new WindowClosebar;
        this.maxizebar = new WindowMaxizebar;
        this.minizebar = new WindowMinizebar;
    }
}
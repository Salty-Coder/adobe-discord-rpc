/**
 * @author Tee
 */
"use strict";

import RichPresence from "./rpc";
import isEqual from "lodash/isEqual"
import clone from "lodash/clone"

const csInterface = new CSInterface();
const client = require("./client.js")[csInterface.getApplicationID()];

let interval = 1000;
let props = {
    state: undefined,
    details: undefined,
    startTimestamp: new Date(),
    largeImageKey: 'logo',
    largeImageText: undefined,
    smallImageKey: undefined,
    smallImageText: undefined,
    partySize: 0,
    partyMax: 0,
}
let activity = {}

// do not initialize if its ran through dynamic link (after effects)
if (csInterface.getApplicationID() === "AEFT") {
    let isDynamicLink = false
    csInterface.evalScript("app.activeViewer", (x) => {
        if (x === "null")
            isDynamicLink = true
    });
    if (isDynamicLink)
        throw new Error("Started as dynamic link");
}

const rpc = new RichPresence(client);
rpc.login()
.then(() => main())
.catch(console.error)
function main() {
    try {
        csInterface.evalScript('state()', x => props.state = x);
        csInterface.evalScript('details()', x => props.details = x);
        csInterface.evalScript('smallImageKey()', x => props.smallImageKey = x);
        csInterface.evalScript('smallImageText()', x => props.smallImageText = x);
        csInterface.evalScript('largeImageText()', x => props.largeImageText = x);
        csInterface.evalScript('partySize()', x => props.partySize = parseInt(x));
        csInterface.evalScript('partyMax()', x => props.partyMax = parseInt(x));

        if (!isEqual(activity, props)) {
            rpc.setActivity(props)
            activity = clone(props)
        }

    } catch (err) {
        console.error(err);
    }
    setTimeout(main, interval);
}

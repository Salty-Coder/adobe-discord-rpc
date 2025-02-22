/**
 * @author Tee
 */
"use strict";

import RichPresence from "./rpc";
import isEqual from "lodash/isEqual";
import clone from "lodash/clone";

const csInterface = new CSInterface();
const client = require("./client.js")[csInterface.getApplicationID()];
const event = new CSEvent("com.tee.rpc.activity", "APPLICATION")
const user = new CSEvent("com.tee.rpc.user", "APPLICATION")

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
let status = true;

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
    .then(() => {
        csInterface.addEventListener('com.tee.rpc.update', (e) => {
            activity = {}
            if(rpc.getStatus()){
                user.data = rpc.getUser()
                console.log(rpc.getUser())
                csInterface.dispatchEvent(user)
            }
            console.log(e)
        })
    })
    .then(() => main())
    .catch(console.error)
function main() {
    try {
        if (rpc.getStatus()) {
            if (!status) {
                activity = {}
                status = true
            }
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
                event.data = {
                    ...activity,
                    name: client.name
                }
                csInterface.dispatchEvent(event)
            }

        } else {
            status = false;
        }
    } catch (err) {
        console.error(err);
    }
    setTimeout(main, interval);
}

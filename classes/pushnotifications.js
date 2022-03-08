
// The AR-Reshare application is meant to be exclusive to the Android platform.
// We will be using FCM and the corresponding node library to interface with this
// FCM Docs: https://firebase.google.com/docs/cloud-messaging

// We want to try to reduce the amount of unneccessary work that it is necessary
// Therefore we are going to be using Notification messages instead of Data messages
// That way the client services bundled with the device should handle displaying the message

// We are also going to use non-collapsible message (for the most part)
// This is because I do not believe we are under a scenario where we want to update the message with the newer one

// Question: What actions should result in a push notification?
// /conversation/create (maybe)
// /conversation/message
// /conversation/close

// We'll use Priority Normal for Android
// TTL for Android is set to 4 weeks by default

// FCM returns a messageID once it has accepted the message (as opposed to when it is delivered to the cliebt device)

// Make sure to delete
// 1. Unregistered (404) tokens
// 2. Invalid argument (400) tokens


// FCM Setup:
// 1. The client app needs to retreive a token from the FCM server at startup
// 2. This then needs to be provided to the app server alongside a timestamp (timestamp needs to be provided by us)

// It's important to update the token and timestamp whenever it changes
// e.g. app restoration on new device, uninstall/reinstall app, user clears app data

// Recomendation: Update tokens on a regular basis

var admin = require('firebase-admin');


class PushNotifications {
    constructor(){
        //pass
    }

    static serviceAccountKeyPath = 'ar-reshare-76ae2-firebase-adminsdk-k2pgc-a5c689d3db.json';
    
    static initializeApp() {
        let serviceAccount = require(PushNotifications.serviceAccountKeyPath);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

}

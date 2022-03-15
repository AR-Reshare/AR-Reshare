
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
var path = require('path');
const {TemplateError, InvalidArgumentError, AbsentArgumentError, PrivateKeyReadError} = require('./errors.js');

class PushNotifications {
    constructor(){
        //pass
    }

    static serviceAccountKeyPath = `..${path.sep}secrets${path.sep}ar-reshare-76ae2-firebase-adminsdk-k2pgc-a5c689d3db.json`;
    
    static initializeApp() {
        let serviceAccount;
        try {
            serviceAccount = require(PushNotifications.serviceAccountKeyPath);
        } catch(err){
            throw new PrivateKeyReadError();
        }
        return admin.initializeApp({   
            credential: admin.credential.cert(serviceAccount)
        });
    }



}



// NOTE: THis class needs to handle
// 1. Taking templates and replacing information there with the user-specific data 
// 2. Then send this message to the FCM backend HTTP v1 service via the sdk

// 2a. If too busy, then we keep on trying (exponential backoff)
// 2b. If stale then we want to manipulate the database to remove the token

// NOTE: It also needs to handle
// 1. storing device token hashes in the database for a specific user
// 2. ...

class PushNotifTemplates {
    static messageSend = {
        notification: {
            title: '${senderName} sent you a message',
            body: '${senderName} said \'${senderMessage}\''
          }
    };

    static messageClose = {
        notification: {
            title: '${senderName} has closed the conversation',
            // body: ''
          }       
    };

    static messageCreate = {
        notification: {
            title: '${senderName} has started a conversation',
            // body: ''
          }
    };

    static arguments = {
        'Message-Send': ['senderName', 'senderMessage'],
        'Message-Close': ['senderName'],
        'Message-Start': ['senderName'],
    };

    static templates = {
        'Message-Send': PushNotifTemplates.messageSend,
        'Message-Close': PushNotifTemplates.messageClose,
        'Message-Start': PushNotifTemplates.messageStart,
    };
    
}


// NOTE: THis is very similar structure to the EmailRespond
// TODO: Make sure to make a subclass
class PushNotif {
    constructor(templateType){
        let supportedTemplateTypes = ['Message-Send', 'Message-Start', 'Message-Close'];
        if (!templateType){
            throw new TemplateError('No TemplateType was provided');
        } else if (!supportedTemplateTypes.includes(templateType)){
            throw new TemplateError('An accepted TemplateType was not provided');
        } else {
            this.templateType = templateType;
            this.templateDict = PushNotifTemplates.templates[this.template];
            this.templateArguments = PushNotifTemplates.arguments[this.templateType];
        }

    }

    async templateReplace(replacementObject){
        // TODO: Quite inefficient -- If you have time modify later
        let message = this.templateDict;
        for (const arg of this.templateArguments){
            message.notification.title = message.notification.title.replace(`\${${arg}}`, replacementObject[arg]);
            message.notification.body = message.notification.body.replace(`\${${arg}}`, replacementObject[arg]);
        }
        return content;
    };

    async replacementObjectValidate(replacementObject){
        // existance check and type check
        if (!replacementObject){
            throw new AbsentArgumentError();
        } else if (replacementObject.length != this.templateArguments.length){
            throw new InvalidArgumentError();
        }

        for (arg in replacementObject){
            if (!this.templateArguments.includes(arg)) {
                throw new InvalidArgumentError();
            } else if(replacementObject[arg] === undefined){
                throw new AbsentArgumentError();
            } else if (!replacementObject[arg] instanceof String){
                throw new InvalidArgumentError();
            }
        }

        return true;
    }

    async sendPushNotif(fcmApp, registration, message){

    };

    async process(fcmApp, registrationToken, inputObject){
        // throws an error if the inputObject is invalid
        await this.replacementObjectValidate(inputObject);
        // replaces the templates using the validated input object
        let message = await this.templateReplace(inputObject);
        // sends the pushnotification using the fcm app instance
        this.sendPushNotif(fcmApp, registrationToken, message);

    };
}



fcmApp = PushNotifications.initializeApp();

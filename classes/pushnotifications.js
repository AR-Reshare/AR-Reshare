
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
var fs = require('fs/promises');
const {TemplateError, InvalidArgumentError, AbsentArgumentError, PrivateKeyReadError, QueryExecutionError} = require('./errors.js');

class PushNotifHelper {
    static serviceAccountKeyPath = `secrets${path.sep}ar-reshare-76ae2-firebase-adminsdk-k2pgc-a5c689d3db.json`;
    static tokenExpirationLength = 30; // This value is in terms of days

    static async initializeApp() {
        let serviceAccount;
        let out;
        try {
            out = await fs.readFile(PushNotifHelper.serviceAccountKeyPath);
            serviceAccount = JSON.parse(out);
        } catch(err){
            console.log(err);
            throw new PrivateKeyReadError();
        }
        return admin.initializeApp({   
            credential: admin.credential.cert(serviceAccount)
        });
    }

    static async updateRegistrationTokenTimestamp(db, userID, registrationToken){
        // NOTE: We update the registration token with the current timestamp
        const timestamp = new Date().toISOString().slice(0,10);
        const args = [registrationToken, timestamp, userID];
        const queryTemplate = 'REPLACE INTO PushToken (DeviceToken, Time, UserID) VALUES ($1, $2, $3)';
        return db.simpleQuery(queryTemplate, args).then(res => {
            // res should be an integer containing the number of modified rows
            if (res == 1){
                return true; // a single insert has been performed (i.e. the token didn't exist)
            } else if (res == 2){
                return true; // a deletion and insertion has been performed (i.e. the token has been replaced with new timestamp)
            } else {
                throw new QueryExecutionError();
            }
        });
    };

    static async removeRegistrationTokens(db, userID, registrationTokens){
        if (registrationTokens.length == 0){
            throw new InvalidArgumentError();
        }
        registrationTokens = `('${registrationTokens.join(`', '`)}')`;
        const args = [userID, registrationTokens];
        const queryTemplate = 'DELETE FROM PushToken WHERE UserID = $1 AND DeviceToken IN $2';
        return db.simpleQuery(queryTemplate, args).then(res => {
            //res should be an integer containing the number of deleted rows
            if (res == 1){
                return true;
            } else {
                throw new QueryExecutionError();
            }
        });
    }

    static async removeUserExpiredTokens(userID){
        // TODO: Create this function
        const args = [userID, PushNotifHelper.tokenExpirationLength];
        const queryTemplate = 'DELETE FROM PushToken WHERE UserID = $1 AND Time < DATE_SUB(NOW(), INTERVAL $2 day);'
        return db.simpleQuery(queryTemplate, args).then(res => {
            // res should be an integer containg the number of deleted rows
            if (res >= 0){
                return true;
            } else {
                throw new QueryExecutionError();
            }
        });
    };

    static async accountLogin(userID, registrationToken){
        // We remove any tokens in the local database that are > 30 days (upon login)
        await PushNotifHelper.removeUserExpiredTokens(userID);
        // If the registration token is not there, then we add it, otherwise we update its timestamp
        return await PushNotifHelper.updateRegistrationToken(userID, registrationToken);
    }

    static async getDeviceGroupTokens(userID){
        let deviceGroupTokens = [];
        const args = [userID];
        const queryTemplate = 'SELECT DeviceToken WHERE UserID = $1';
        return db.simpleQuery(queryTemplate, args).then(res => {
            // res should be a list of rows e.g. [{registrationToken: ...}, {registrationToken:...}]
            if (res.length >= 0){
                for(let i = 0; i < res.length; i++){
                    deviceGroupTokens.push(res[i]['DeviceToken']);
                }
                return deviceGroupTokens;
            } else {
                throw new QueryExecutionError();
            }
        });
    }
}

// TOOD: Add fixes to the EmailRespond component

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
            title: '${SenderName} sent you a message',
            body: '${SenderName} said \'${SenderMessage}\''
          }
    };

    static messageClose = {
        notification: {
            title: '${SenderName} has closed the conversation',
            // body: '' // Body not needed
          }       
    };

    static messageStart = {
        notification: {
            title: '${SenderName} has started a conversation',
            // body: '' // Body not needed
          }
    };

    static arguments = {
        'Message-Send': ['SenderName', 'SenderMessage'],
        'Message-Close': ['SenderName'],
        'Message-Start': ['SenderName'],
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
            this.templateDict = PushNotifTemplates.templates[this.templateType];
            this.templateArguments = PushNotifTemplates.arguments[this.templateType];
        }

    }

    async templateReplace(replacementObject){
        // TODO: Quite inefficient -- If you have time modify later
        let message = this.templateDict;
        for (const arg of this.templateArguments){
            if (message.notification.title)
                message.notification.title = message.notification.title.replace(`\${${arg}}`, replacementObject[arg]);
            
            if (message.notification.body)
                message.notification.body = message.notification.body.replace(`\${${arg}}`, replacementObject[arg]);
            
        }
        return message;
    };

    async replacementObjectValidate(replacementObject){
        // existance check and type check
        if (!replacementObject){
            throw new AbsentArgumentError();
        } else if (Object.keys(replacementObject).length != this.templateArguments.length){
            throw new InvalidArgumentError();
        }

        for (let arg in replacementObject){
            if (!this.templateArguments.includes(arg)) {
                throw new InvalidArgumentError();
            } else if(replacementObject[arg] === undefined){
                throw new AbsentArgumentError();
            } else if (!(typeof replacementObject[arg] === 'string')){
                throw new InvalidArgumentError();
            }
        }

        return true;
    }

    // TODO: We need to link PushNotif helper functions to maybe modify the database
    // TODO: We need to ensure proper error handling here
    async sendPushNotif(fcmApp, userID, message){
        // Since we working with groups of devices, we need to get the set of those tokens
        let deviceGroupTokens = await PushNotifHelper.getDeviceGroupTokens(userID);
        // No need to add exponential backoff as this is handled by fcm-admin package
        fcmApp.messaging().sendToDevice(deviceGroupTokens, message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
          })
        .catch((error) => {
            if (typeof(error) === admin.messaging.INVALID_ARGUMENT){
                console.log('invalid argument');
                throw error;
            } else if (typeof(error) === admin.messaging.UNREGISTERED){
                console.log('unregistered');
                throw error;
            }
            console.log('Error sending message:', error);
          });

          return true;
    };

    async process(fcmApp, userID, inputObject){
        // throws an error if the inputObject is invalid
        await this.replacementObjectValidate(inputObject);
        // replaces the templates using the validated input object
        let message = await this.templateReplace(inputObject);
        // sends the pushnotification using the fcm app instance
        return await this.sendPushNotif(fcmApp, userID, message);
    };
}




module.exports = {
    PushNotif,
    PushNotifHelper,
    PushNotifTemplates,
}

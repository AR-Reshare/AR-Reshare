const {PushNotif, PushNotifTemplates, PushNotifHelper} = require('../../classes/pushnotifications.js');
const {TemplateError, InvalidArgumentError, AbsentArgumentError} = require('../../classes/errors.js');


describe('Unit Test XX - PushNotif Class Construction', () => {
    test('Invalid Value/Type TemplateType', () => {
        let pushNotifTemplate;
        let templateType = 'invalidType';
        let expectedError = new TemplateError('An accepted TemplateType was not provided');
        try {
            pushNotifTemplate = new PushNotif(templateType);
        } catch(err) {
            expect(err).toEqual(expectedError);
        }
    });

    test('Absent TemplateType', () => {
        let pushNotifTemplate;
        let templateType = null;
        let expectedError = new TemplateError('No TemplateType was provided');
        try {
            pushNotifTemplate = new PushNotif(templateType);
        } catch(err) {
            expect(err).toEqual(expectedError);
        }
    });

    test('Valid TemplateType (Message-Start)', () => {
        let templateType = 'Message-Start';
        let PushNotifTemplate = new PushNotif(templateType);
        expect(PushNotifTemplate.templateType).toEqual(templateType);
        expect(PushNotifTemplate.templateArguments).toEqual(PushNotifTemplates.arguments[templateType]);
        expect(PushNotifTemplate.templateDict).toEqual(PushNotifTemplates.templates[templateType]);
    });

    test('Valid TemplateType (Message-Send)', () => {
        let templateType = 'Message-Send';
        let PushNotifTemplate = new PushNotif(templateType);
        expect(PushNotifTemplate.templateType).toEqual(templateType);
        expect(PushNotifTemplate.templateArguments).toEqual(PushNotifTemplates.arguments[templateType]);
        expect(PushNotifTemplate.templateDict).toEqual(PushNotifTemplates.templates[templateType]);
    });

    test('Valid TemplateType (Message-Close)', () => {
        let templateType = 'Message-Close';
        let PushNotifTemplate = new PushNotif(templateType);
        expect(PushNotifTemplate.templateType).toEqual(templateType);
        expect(PushNotifTemplate.templateArguments).toEqual(PushNotifTemplates.arguments[templateType]);
        expect(PushNotifTemplate.templateDict).toEqual(PushNotifTemplates.templates[templateType]);
    });

});


let pushNotifTemplate, templateType, fcmApp;


beforeAll(async () => {
    fcmApp = await PushNotifHelper.initializeApp();
});

beforeEach(() => {
    templateType = 'Message-Send';
    pushNotifTemplate = new PushNotif(templateType);
});

describe('Unit Test XX - PushNotif Class (template replacement validate)', () => {
    test('Missing replacementObject', async () => {
        let inputObject = null;
        let registrationToken = null;
        let expectedError = new AbsentArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Overexceeded replacement argument length', () => {
        let inputObject = {
            SenderName: 'Sam Sepiol',
            SenderMessage: 'Hi, I\'m interested about the laptop for sale',
            exceededVariable: 'This shouldn\'t be processed'
        };
        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    
    test('Insufficient replacement argument length', () => {
        let inputObject = {
            SenderName: 'Sam Sepiol'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });
    

    test('Correct replacement argument length + included invalid attribute', () => {
        let inputObject = {
            SenderName: 'Sam Sepiol',
            randomAttribute: 'randomElement'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    
    test('Correct replacement argument length + all invalid attribute', () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });
    
    test('Correct replacement argument length + Correct attributes + Incorrect value type', () => {
        let inputObject = {
            SenderName: 5,
            SenderMessage: 'randomElement'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        // let out = pushNotifTemplate.replacementObjectValidate(inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
        let inputObject = {
            SenderName: null,
            randomAttribute2: 5
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Valid replacementObject', () => {
        let inputObject = {
            SenderName: 'Sam Sepiol',
            SenderMessage: 'Test message'
        };

        let out = pushNotifTemplate.replacementObjectValidate(inputObject);
        expect(out).resolves.toEqual(true);
    });

});

// TODO: Add tests here

// TODO: We need to create temporary templates for the the provided scenarios
describe('Unit Test XX - PushNotif Class (template replacement execute)', () => {
    test('Template Replacement Success (Message-Send)', async () => {
        let senderName = 'Sam Sepiol';
        let senderMessage = 'Hello I\'m interested in your laptop';
        let templateType = 'Message-Send';
        let replacementObject = {
            SenderName: senderName,
            SenderMessage: senderMessage
        };

        let emailTemplate = new PushNotif(templateType);
        let content = await emailTemplate.templateReplace(replacementObject);
        expect(content['notification']['title']).toEqual(`${senderName} sent you a message`);
        expect(content['notification']['body']).toEqual(`${senderName} said \'${senderMessage}\'`);
    });

    test('Template Replacement Success (Message-Start)', async () => {
        let templateType = 'Message-Start';
        let senderName = 'Sam Sepiol';
        let replacementObject = {
            SenderName: senderName,
        };

        let emailTemplate = new PushNotif(templateType);
        let content = await emailTemplate.templateReplace(replacementObject);
        expect(content['notification']['title']).toEqual(`${senderName} has started a conversation`);
    });

    test('Template Replacement Success (Message-Close)', async () => { 
        let templateType = 'Message-Close';
        let senderName = 'Sam Sepiol';
        let replacementObject = {
            SenderName: senderName,
        };

        let emailTemplate = new PushNotif(templateType);
        let content = await emailTemplate.templateReplace(replacementObject);
        expect(content['notification']['title']).toEqual(`${senderName} has closed the conversation`);
    });
});


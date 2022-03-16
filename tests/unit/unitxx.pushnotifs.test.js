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

    test('Valid TemplateType (MessageStart)', () => {
        let templateType = 'MessageStart';
        let PushNotifTemplate = new PushNotif(templateType);
        expect(PushNotifTemplate.templateType).toEqual(templateType);
        expect(PushNotifTemplate.templateArguments).toEqual(PushNotifTemplates.arguments[templateType]);
        expect(PushNotifTemplate.templateDict).toEqual(PushNotifTemplates.templates[templateType]);
    });

    test('Valid TemplateType (MessageSend)', () => {
        let templateType = 'MessageSend';
        let PushNotifTemplate = new PushNotif(templateType);
        expect(PushNotifTemplate.templateType).toEqual(templateType);
        expect(PushNotifTemplate.templateArguments).toEqual(PushNotifTemplates.arguments[templateType]);
        expect(PushNotifTemplate.templateDict).toEqual(PushNotifTemplates.templates[templateType]);
    });

    test('Valid TemplateType (MessageClose)', () => {
        let templateType = 'MessageClose';
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
    templateType = 'MessageSend';
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
            senderName: 'Sam Sepiol',
            senderMessage: 'Hi, I\'m interested about the laptop for sale',
            exceededVariable: 'This shouldn\'t be processed'
        };
        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    
    test('Insufficient replacement argument length', () => {
        let inputObject = {
            senderName: 'Sam Sepiol'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });
    

    test('Correct replacement argument length + included invalid attribute', () => {
        let inputObject = {
            senderName: 'Sam Sepiol',
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
            senderName: 5,
            senderMessage: 'randomElement'
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        // let out = pushNotifTemplate.replacementObjectValidate(inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
        let inputObject = {
            senderName: null,
            randomAttribute2: 5
        };

        let registrationToken = null;
        let expectedError = new InvalidArgumentError();

        let out = pushNotifTemplate.process(fcmApp, registrationToken, inputObject);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Valid replacementObject', () => {
        let inputObject = {
            senderName: 'Sam Sepiol',
            senderMessage: 'Test message'
        };

        let out = pushNotifTemplate.replacementObjectValidate(inputObject);
        expect(out).resolves.toEqual(true);
    });

});

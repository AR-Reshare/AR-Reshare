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

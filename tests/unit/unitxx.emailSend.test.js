const {EmailRespond, EmailTemplateDefinitions} = require('../../classes/email.js');
const {TemplateError, InvalidArgumentError, AbsentArgumentError, EmailCredentialsReadError} = require('../../classes/errors.js');

// There are three integrations we want to test
// Account Creation
// Account Modification
// Password Reset

// For now we are focusing on unit tests

// emailRespond class
// 1. constructor tests
// --> templateType (valid)
// --> templateType (invalid)



describe('Unit Test XX - emailResond Class Construction', () => {
    test('Invalid Value/Type TemplateType', () => {
        let templateType = 'invalidType';
        let expectedError = new TemplateError('An accepted TemplateType was not provided');
        let emailTemplate;

        try {
            emailTemplate = new EmailRespond(templateType);
        } catch(err) {
            expect(err).toEqual(expectedError);
        }
    });

    test('Absent TemplateType', () => {
        let templateType = null;
        let expectedError = new TemplateError('No TemplateType was provided');
        let emailTemplate;
        try {
            emailTemplate = new EmailRespond(templateType);
        } catch(err) {
            expect(err).toEqual(expectedError);
        }
    });

    test('Valid TemplateType (Account Creation)', () => {
        let templateType = 'Account-Create';
        let emailTemplate = new EmailRespond(templateType);
        expect(emailTemplate.templateType).toEqual(templateType);
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.templates[templateType]);
        expect(emailTemplate.templatePlaceholder).toEqual(EmailTemplateDefinitions.arguments[templateType]);

    });

    test('Valid TemplateType (Account Modification)', () => {
        let templateType = 'Account-Modify';
        let emailTemplate = new EmailRespond(templateType);
        expect(emailTemplate.templateType).toEqual(templateType);
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.templates[templateType]);
        expect(emailTemplate.templatePlaceholder).toEqual(EmailTemplateDefinitions.arguments[templateType]);

    });

    test('Valid TemplateType (Password Reset)', () => {
        let templateType = 'Password-Reset';
        let emailTemplate = new EmailRespond(templateType);
        expect(emailTemplate.templateType).toEqual(templateType);
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.templates[templateType]);
        expect(emailTemplate.templatePlaceholder).toEqual(EmailTemplateDefinitions.arguments[templateType]);

    });

});

describe('Unit Test XX - emailResond Class (template replacement validate)', () => {
    test('Missing replacementObject', () => {
        //pass
    });

    test('Overexceeded replacement argument length', () => {
        //pass
    });

    test('Insufficient replacement argument length', () => {
        //pass
    });

    test('Correct replacement argument length + included invalid attribute', () => {
        //pass
    });

    test('Correct replacement argument length + all invalid attribute', () => {
        //pass
    });

    test('Correct replacement argument length + Correct attributes + Incorrect value type', () => {
        //pass
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
        //pass
    });

    test('Valid replacementObject', () => {
        //pass
    });

});

describe('Unit Test XX - emailResond Class (template replacement execute)', () => {
    test('Template Replacement Success (Account Creation)', () => {
        //pass
    });

    test('Template Replacement Success (Account Modification)', () => {
        //pass
    });

    test('Template Replacement Success (Password Reset)', () => {
        //pass
    });
});
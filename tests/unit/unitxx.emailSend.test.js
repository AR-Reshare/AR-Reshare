const {EmailRespond, EmailTemplateDefinitions, EmailTransporter} = require('../../classes/email.js');
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
        try {
            let emailTemplate = new EmailRespond(templateType);
        } catch(err) {
            expect(err).toEqual(expectedError);
        }
    });

    test('Absent TemplateType', () => {
        let templateType = null;
        let expectedError = new TemplateError('No TemplateType was provided');
        try {
            let emailTemplate = new EmailRespond(templateType);
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

beforeEach(async () => {
    let templateType = 'Account-Create';
    let emailTemplate = new EmailRespond(templateType);
    let emailTransport = await EmailTransporter.setup();
    let emailaddress = 'test@example.com';

});

describe('Unit Test XX - emailResond Class (template replacement validate)', () => {
    test('Missing replacementObject', async () => {
        let inputObject = null;

        let expectedError = new AbsentArgumentError();

        expect(async () => {
          let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
          expect(out).toEqual(expectedError);
        });
    });

    test('Overexceeded replacement argument length', async () => {
        let inputObject = {
            email: 'foo@example.com',
            userID: '12345',
            additionalAttribute: 'random-stuff'
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Insufficient replacement argument length', async () => {
        let inputObject = {
            email: 'foo@example.com',
            //Account-Create requires a userID attribute
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Correct replacement argument length + included invalid attribute', async () => {
        let inputObject = {
            email: 'foo@example.com',
            randomAttribute: 'randomElement'
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Correct replacement argument length + all invalid attribute', async () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Correct replacement argument length + Correct attributes + Incorrect value type', async () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', async () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        let expectedError = new InvalidArgumentError();

        expect(async () => {
            let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(expectedError);
        });
    });

    test('Valid replacementObject', async () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        expect(async () => {
            let out = await emailTemplate.replacementObjectValidate(emailTransport, emailaddress, inputObject);
            expect(out).toEqual(true);
        });
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
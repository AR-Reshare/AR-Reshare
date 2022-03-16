const {EmailRespond, EmailTemplateDefinitions, EmailTransporter} = require('../../classes/email.js');
const {TemplateError, InvalidArgumentError, AbsentArgumentError} = require('../../classes/errors.js');

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
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.arguments[templateType]);
        expect(emailTemplate.htmltemplate).toEqual(EmailTemplateDefinitions.htmltemplates[templateType]);
        expect(emailTemplate.texttemplate).toEqual(EmailTemplateDefinitions.texttemplates[templateType]);
    });

    test('Valid TemplateType (Account Modification)', () => {
        let templateType = 'Account-Modify';
        let emailTemplate = new EmailRespond(templateType);
        expect(emailTemplate.templateType).toEqual(templateType);
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.arguments[templateType]);
        expect(emailTemplate.htmltemplate).toEqual(EmailTemplateDefinitions.htmltemplates[templateType]);
        expect(emailTemplate.texttemplate).toEqual(EmailTemplateDefinitions.texttemplates[templateType]);
    });

    test('Valid TemplateType (Password Reset)', () => {
        let templateType = 'Password-Reset';
        let emailTemplate = new EmailRespond(templateType);
        expect(emailTemplate.templateType).toEqual(templateType);
        expect(emailTemplate.templateArguments).toEqual(EmailTemplateDefinitions.arguments[templateType]);
        expect(emailTemplate.htmltemplate).toEqual(EmailTemplateDefinitions.htmltemplates[templateType]);
        expect(emailTemplate.texttemplate).toEqual(EmailTemplateDefinitions.texttemplates[templateType]);
    });

});

let templateType, emailTemplate, emailTransport, emailaddress;

beforeEach(async () => {
    templateType = 'Account-Create';
    emailTemplate = new EmailRespond(templateType);
    emailTransport = await EmailTransporter.setup();
    emailaddress = 'test@example.com';
});

describe('Unit Test XX - emailResond Class (template replacement validate)', () => {
    test('Missing replacementObject', () => {
        let inputObject = null;

        let expectedError = new AbsentArgumentError();

        expect(async () => {
          let out = await emailTemplate.process(emailTransport, emailaddress, inputObject);
          expect(out).toEqual(expectedError);
        });
    });

    test('Overexceeded replacement argument length', () => {
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

    test('Insufficient replacement argument length', () => {
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

    test('Correct replacement argument length + included invalid attribute', () => {
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

    test('Correct replacement argument length + all invalid attribute', () => {
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

    test('Correct replacement argument length + Correct attributes + Incorrect value type', () => {
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

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
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

    test('Valid replacementObject', () => {
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


// TODO: We need to create temporary templates for the the provided scenarios
describe('Unit Test XX - emailResond Class (template replacement execute)', () => {
    test('Template Replacement Success (Account Creation)', async () => {
        let replacementObject = {
            Email: 'foo@example.com',
            UserID: '12345'
        };

        let templateType = 'Account-Create';
        let emailTemplate = new EmailRespond(templateType);
        let [textcontent, htmlcontent] = await emailTemplate.templateReplace(replacementObject);
        expect(textcontent).toContain(`Email:${replacementObject.Email}`);
        expect(textcontent).toContain(`UserID:${replacementObject.UserID}`);
        expect(htmlcontent).toContain(`Email:${replacementObject.Email}`);
        expect(htmlcontent).toContain(`UserID:${replacementObject.UserID}`);
    });

    test('Template Replacement Success (Account Modification)', async () => {
        let replacementObject = {
            Email: 'foo@example.com',
            UserID: '12345'
        };

        let templateType = 'Account-Modify';
        let emailTemplate = new EmailRespond(templateType);
        let [textcontent, htmlcontent] = await emailTemplate.templateReplace(replacementObject);
        expect(textcontent).toContain(`Email:${replacementObject.Email}`);
        expect(textcontent).toContain(`UserID:${replacementObject.UserID}`);
        expect(htmlcontent).toContain(`Email:${replacementObject.Email}`);
        expect(htmlcontent).toContain(`UserID:${replacementObject.UserID}`);
    });

    test('Template Replacement Success (Password Reset)', async () => {
        let replacementObject = {
            Email: 'foo@example.com',
            UserID: '12345',
            Token: 'FDAS4534FDS'
        };

        let templateType = 'Password-Reset';
        let emailTemplate = new EmailRespond(templateType);
        let [textcontent, htmlcontent]= await emailTemplate.templateReplace(replacementObject);
        expect(textcontent).toContain(`Email:${replacementObject.Email}`);
        expect(textcontent).toContain(`UserID:${replacementObject.UserID}`);
        expect(textcontent).toContain(`Token:${replacementObject.Token}`);
        expect(htmlcontent).toContain(`Email:${replacementObject.Email}`);
        expect(htmlcontent).toContain(`UserID:${replacementObject.UserID}`);
        expect(htmlcontent).toContain(`Token:${replacementObject.Token}`);
    });
});


// TODO: We need to design tests for this SMTP email message sending operations
// TODO: We need to setup an email address to perform these operations
// TODO: We need to create a mock object to mock the emailTransporter
describe('Unit Test XX - emailRespond Class (email-sending)', () => {
    test('Succesful Email sending', () => {
        //pass
    });
});
const {EmailRespond, EmailTemplateDefinitions, EmailTransporter} = require('../../classes/email.js');
const {TemplateError, InvalidArgumentError, AbsentArgumentError} = require('../../classes/errors.js');

// There are three integrations we want to test
// Account Creation
// Account Modification
// Password Reset

// TODO: ADD Email validation checks and tests


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

        let expectedError = new AbsentArgumentError('The replacement object cannot be null');
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Overexceeded replacement argument length', () => {
        let inputObject = {
            email: 'foo@example.com',
            userID: '12345',
            additionalAttribute: 'random-stuff'
        };

        let expectedError = new InvalidArgumentError('The replacement object has an incorrect number of keys');
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Insufficient replacement argument length', () => {
        let inputObject = {
            email: 'foo@example.com',
            //Account-Create requires a userID attribute
        };

        let expectedError = new InvalidArgumentError('The replacement object has an incorrect number of keys');
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + included invalid attribute', () => {
        let inputObject = {
            Email: 'foo@example.com',
            randomAttribute: 'randomElement'
        };

        let arg = 'randomAttribute';
        let expectedError = new InvalidArgumentError(`The replacement object should not have the following: ${arg}`);
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + all invalid attribute', () => {
        let inputObject = {
            randomAttribute1: 'foo@example.com',
            randomAttribute2: 'randomElement'
        };

        let arg = 'randomAttribute1';
        let expectedError = new InvalidArgumentError(`The replacement object should not have the following: ${arg}`);
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + Incorrect case attributes + Correct value type', () => {
        let inputObject = {
            email: 'foo@example.com',
            userID: '432154315'
        };

        let arg = 'email'; // NOTE: emailTemplate is case sensitive, it requires uppercase first letter
        let expectedError = new InvalidArgumentError(`The replacement object should not have the following: ${arg}`);
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + Correct attributes + Incorrect value type', () => {
        let inputObject = {
            Email: 'foo@example.com',
            UserID: 432154315
        };

        let arg = 'UserID';
        let expectedError = new InvalidArgumentError(`The replacement object's attribute ${arg} should be of type 'string'`);
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
        let inputObject = {
            Email: 5,
            UserID: 432154315
        };

        let arg = 'Email'; // NOTE: We take the first error and throw it, this is why UserID is not in the error eventhough its meant to be a string
        let expectedError = new InvalidArgumentError(`The replacement object's attribute ${arg} should be of type 'string'`);
        let int = emailTemplate.process(emailTransport, emailaddress, inputObject);
        let unit = emailTemplate.replacementObjectValidate(inputObject);
        expect(int).rejects.toEqual(expectedError);
        expect(unit).rejects.toEqual(expectedError);
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
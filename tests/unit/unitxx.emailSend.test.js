const {EmailRespond, EmailTemplateDefinitions, EmailTransporter} = require('../../classes/email.js');
const {TemplateError, InvalidArgumentError, AbsentArgumentError, EmailDeliveryError} = require('../../classes/errors.js');

// There are three integrations we want to test
// Account Creation
// Account Modification
// Password Reset

// TODO: ADD Email validation checks and tests


describe('Unit Test XX - emailRespond Class Construction', () => {
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
    emailTransport = await EmailTransporter.setup(true);
    emailaddress = 'test@example.com';
});

describe('Unit Test XX - emailRespond Class (template replacement validate)', () => {
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


beforeEach(async () => {
    templateType = 'Account-Create';
    emailTemplate = new EmailRespond(templateType);
    emailTransport = await EmailTransporter.setup(true);
    emailaddress = 'test@example.com';
});


// TODO: We need to create temporary templates for the the provided scenarios
describe('Unit Test XX - emailRespond Class (template replacement execute)', () => {
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
        let [textcontent, htmlcontent] = await emailTemplate.templateReplace(replacementObject);
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

// TODO: We need to change the expected errors here (as they have all been defaulted to the same)
describe('Unit Test XX - emailRespond Class (email-sending)', () => {
    test('No text content', async () => {
        let email = 'test@example.com';
        let textcontent = null;
        let htmlcontent = '<p> Test content </p>';
        // emailTransport.sendMail = jest.fn().mockImplementationOnce((args) => { return {accepted: [email]};);

        let expectedError =  new AbsentArgumentError('There is no \'textcontent\' provided');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });

    test('No html content', async () => {
        let email = 'test@example.com';
        let textcontent = 'Test content';
        let htmlcontent = null;
        
        let expectedError =  new AbsentArgumentError('There is no \'htmlcontent\' provided');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });

    test('No htmlcontent AND No textcontent', () => {
        let email = 'test@example.com';
        let textcontent = null;
        let htmlcontent = null;

        let expectedError =  new AbsentArgumentError('There is no \'textcontent\' provided');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
        
    });

    test('No email address', () => {
        let email = null;
        let textcontent = 'Test Content';
        let htmlcontent = '<p>Test Content</p>';

        let expectedError =  new AbsentArgumentError('There is no \'userEmail\' provided');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);

    });


    test('No transport', async () => {
        let email = 'test@example.com';
        let textcontent = 'Test Content';
        let htmlcontent = '<p>Test Content</p>';
        emailTransport = null;
        
        let expectedError =  new AbsentArgumentError('There is no \'transport\' provided');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
        emailTransport = await EmailTransporter.setup(true);

    });

    test('Invalid Email', () => {
        let email = 'example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p>Test content</p>';

        // TODO: There is no email validation so this is raised by nodemailer itself when performing sendMail()
        let expectedError = new EmailDeliveryError(); 
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });
    
    test('Invalid EmailTransport', async () => {
        let email = 'example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p>Test content</p>';
        emailTransport = {};
        
        let expectedError = new InvalidArgumentError('The transport object has no method \'sendMail\'');
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
        emailTransport = await EmailTransporter.setup(true);
    });

    test('Invalid Text Content', () => {
        // as long as it is a string, then it is valid (this is performed by "No Text Content" test already)
    });

    test('Invalid HTML Content', () => {
        // as long as it is a string, then it is valid (to wasteful to do html parsing)
        // (this is performed by "No Text Content" test already)
    });

    test('Invalid Authentication Credentials (No username + No password', () => {
        let email = 'test@example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p> Test content </p>';
        emailTransport.options.auth.user = undefined;
        emailTransport.options.auth.pass = undefined;
        emailTransport.sendMail = jest.fn().mockImplementationOnce((args) => {throw new Error();});

        let expectedError = new EmailDeliveryError();
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Invalid Authentication Credentials (No password)', () => {
        let email = 'test@example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p> Test content </p>';
        emailTransport.options.auth.user = 'user';
        emailTransport.options.auth.pass = undefined;
        emailTransport.sendMail = jest.fn().mockImplementationOnce((args) => {throw new Error();});

        let expectedError = new EmailDeliveryError();
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Invalid Authentication Credentials (No username)', () => {
        let email = 'test@example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p> Test content </p>';
        emailTransport.options.auth.user = undefined;
        emailTransport.options.auth.pass = 'fdhaijkfdaslr3';
        emailTransport.sendMail = jest.fn().mockImplementationOnce((args) => {throw new Error();});

        let expectedError = new EmailDeliveryError();
        let out = emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out).rejects.toEqual(expectedError);
    });

    test('Succesful Email sending', async () => {
        let email = 'test@example.com';
        let textcontent = 'Test content';
        let htmlcontent = '<p> Test content </p>';

        let out = await emailTemplate.sendEmail(emailTransport, email, textcontent, htmlcontent);
        expect(out['accepted']).toEqual([email]);
    });
});
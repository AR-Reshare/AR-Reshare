const {TemplateError, InvalidArgumentError, AbsentArgumentError, EmailConfigurationReadError, EmailDeliveryError} = require('./errors.js');
const fs = require('fs/promises');
const path = require('path');
const nodemailer = require('nodemailer');
// There are certain events which require the application to send an email, which can include:
// 1. Account Creation
// 2. Password Reset
// 3. Account Detail Modification

// To implement this module, we need to:
// 1. create the 'templates' that we can use to send these emails
// 2. provide the logic to perform the email sending operations
// 3. integrate this functionality with the above operations (account-creation, password-reset, account-modification)

// The general workflow is
// 1. Create an emailTemplate using the resourcename
// 2. Pass the emailTemplate with the input object to the function EmailRespond
// 3. This function EmailRespond will 

// TODO: Add email validation

// TODO: Move this to the schemas folder
// TODO: We need to provide a template -- (This should be handled by the Bristol Team, but we should create a placeholder for now)
class EmailTemplateDefinitions {
    static htmltemplates = {
        'Account-Modify': 'Email:${Email}\tUserID:${UserID}',
        'Account-Create': 'Email:${Email}\tUserID:${UserID}',
        'Password-Reset': 'Email:${Email}\tUserID:${UserID}\tToken:${Token}',
    };

    static texttemplates = {
        'Account-Modify': 'Email:${Email}\tUserID:${UserID}',
        'Account-Create': 'Email:${Email}\tUserID:${UserID}',
        'Password-Reset': 'Email:${Email}\tUserID:${UserID}\tToken:${Token}',
    };

    static arguments = {
        'Account-Modify': ['Email', 'UserID'],
        'Account-Create': ['Email', 'UserID'],
        'Password-Reset': ['Email', 'UserID', 'Token'],
    };
}

class EmailTransporter {
    static emailConfigLocation = `secrets${path.sep}emailconnection.conf`;
    static sourceEmailAddress = 'donotreply@arreshare.com';
    static sourceName = 'AR-Reshare';

    static async getConfig(){
        let out, config;
        try {
            out = await fs.readFile(EmailTransporter.emailConfigLocation);
            config = JSON.parse(out);
        } catch(err) {
            throw new EmailConfigurationReadError();
        }
        return config;
    }

    /**
     * Sets up a `nodemailer SMTP transport` object which handles the sending of email requests to the target smtp service
     * @async
     * @param {boolean} defaultconf - If false, `EmailTransporter.setup()` reads the configuration file whose location is stored in the static attribute `EmailTransporter.emailConfigLocation`. 
     * Otherwise, if true, then a default configuration is created on the fake SMTP service `smtp.ethereal.email`
     * @returns {Promise<Object>} - Returns a promise that when resolved returns an `SMTP Transport` object created by nodemailer
    **/
    static async setup(defaultconf=false){
        // TODO: Setup an email address and replace default account
        // TODO: Add secure transport to the transporter
        let smtpServiceConf;
        if (defaultconf){
            let testAccount = await nodemailer.createTestAccount();
            smtpServiceConf = {
                host: 'smtp.ethereal.email', // fake email address
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            };
        } else {
            smtpServiceConf = await EmailTransporter.getConfig();
        }
        return nodemailer.createTransport(smtpServiceConf);
    }
}


class EmailRespond {
    /**
     * Constructs a EmailRespond object (similar to a Template that is used in other classes/*.js) and validates it
     * @param {string} templateType A string that directs the construction of the EmailRespond object that is created (this argument is validated)
     */
    constructor(templateType){
        let supportedTemplateTypes = ['Account-Modify', 'Account-Create', 'Password-Reset'];
        if (!templateType){
            throw new TemplateError('No TemplateType was provided');
        } else if (!supportedTemplateTypes.includes(templateType)){
            throw new TemplateError('An accepted TemplateType was not provided');
        } else {
            this.templateType = templateType;
            this.templateArguments = EmailTemplateDefinitions.arguments[this.templateType];
            this.htmltemplate = EmailTemplateDefinitions.htmltemplates[this.templateType];
            this.texttemplate = EmailTemplateDefinitions.texttemplates[this.templateType];
        }

    }

    async templateReplace(replacementObject){
        // TODO: Quite inefficient -- If you have time modify later
        let htmlcontent = this.htmltemplate;
        let textcontent = this.texttemplate;
        for (const arg of this.templateArguments){
            htmlcontent = htmlcontent.replace(`\${${arg}}`, replacementObject[arg]);
            textcontent = textcontent.replace(`\${${arg}}`, replacementObject[arg]);
        }
        return [textcontent, htmlcontent];
    }

    async replacementObjectValidate(replacementObject){
        // existance check and type check
        if (!replacementObject){
            throw new AbsentArgumentError('The replacement object cannot be null');
        } else if (Object.keys(replacementObject).length != this.templateArguments.length){
            throw new InvalidArgumentError('The replacement object has an incorrect number of keys');
        }

        for (let arg in replacementObject){
            if (!this.templateArguments.includes(arg)) {
                throw new InvalidArgumentError(`The replacement object should not have the following: ${arg}`);
            } else if(replacementObject[arg] === undefined){
                throw new AbsentArgumentError(`The replacement object's attribute ${arg} should not be null`);
            } else if (!(typeof replacementObject[arg] === 'string')){
                throw new InvalidArgumentError(`The replacement object's attribute ${arg} should be of type 'string'`);
            }
        }
        return true;
    }

    // TODO: We may need to add more arguments if required by the username
    // TODO: Add a callback function here to handle exceptions
    async sendEmail(transport, userEmail, textcontent, htmlcontent){
        if (!textcontent){
            throw new AbsentArgumentError('There is no \'textcontent\' provided');
        } else if (!htmlcontent){
            throw new AbsentArgumentError('There is no \'htmlcontent\' provided');
        } else if (!userEmail){
            throw new AbsentArgumentError('There is no \'userEmail\' provided');
        } else if (!transport){
            throw new AbsentArgumentError('There is no \'transport\' provided');
        }

        if (!((textcontent && (typeof textcontent === 'string')) && (htmlcontent && (typeof htmlcontent === 'string')))){
            throw new InvalidArgumentError('One of the content attributes is not of type \'string\'');
        } else if (!typeof userEmail === 'string'){
            // TODO: Add email validation here
            throw new InvalidArgumentError('The email address is not valid');
        } else if (!(typeof transport.sendMail === 'function')){
            throw new InvalidArgumentError('The transport object has no method \'sendMail\'');
        }

        return transport.sendMail({
            from: `"${EmailTransporter.sourceName}" <${EmailTransporter.sourceEmailAddress}>`, // sender address
            to: userEmail, // list of receivers
            subject: this.templateType, // Subject line
            text: textcontent,
            html: htmlcontent, // html body
        }).then(res => {
            // NOTE: res should be an object containing feedback about the "email message request"
            return res;
        }).catch(err => {
            // NOTE: For some reason I cannot find good definitions of errors
            // According to github issues, nodemailer doesn't have this because the error definitions keep on changing
            // Therefore we are going to throw a generic error
            throw new EmailDeliveryError();
        });
    }

    /**
    * Sends an email request to an SMTP service defined in `/secrets/emailconnection.js`
    * @async
    * @param {object} emailTransporter - An object that is an SMTP transport (or implements equiv interface) as defined by nodemailer
    * @param {object} inputObject - An object containing the parameters and replacement-values that replaces the placeholder
    * parameters in the email template string definitions, (which is then used as the htmlcontent or textcontent for the email request)
    * @param {string} email - A string whose value is the target email-address we wish to send an email message to
    * @returns {promise<object>} - Returns a promise that when resolved should return a nodemailer response object that acts
    * as a confirmation receipt and lists what email addresses rejected/accepted the request
    **/
    async process(emailTransporter, email, inputObject){
        // First we check the input object to see if the inputObject contains the correct attributes
        // --> This can check the emailTemplate's accepted arguments to check
        await this.replacementObjectValidate(inputObject);

        // We then get the emailTemplate string and replace certain strings using the valid inputObject
        let [textcontent, htmlcontent] = await this.templateReplace(inputObject);
        // Finally, we use the emailTransport to execute the request
        // --> Using sendMail in nodemailer, we fill in using the html template we replaced aswell as other information
        return this.sendEmail(emailTransporter, email, textcontent, htmlcontent);
    }
}


module.exports = {
    EmailRespond,
    EmailTransporter,
    EmailTemplateDefinitions
}
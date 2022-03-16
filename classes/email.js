const {TemplateError, InvalidArgumentError, AbsentArgumentError, EmailConfigurationReadError} = require('./errors.js');
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
                    pass: testAccount.password, // generated ethereal password
                },
            };
        } else {
            smtpServiceConf = await EmailTransporter.getConfig();
        }
        return nodemailer.createTransport(smtpServiceConf);
    }
}


class EmailRespond {
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
            throw new AbsentArgumentError();
        } else if (replacementObject.length != this.templateArguments.length){
            throw new InvalidArgumentError();
        }

        for (arg in replacementObject){
            if (!this.templateArguments.includes(arg)) {
                throw new InvalidArgumentError();
            } else if(replacementObject[arg] === undefined){
                throw new AbsentArgumentError();
            } else if (!replacementObject[arg] instanceof String){
                throw new InvalidArgumentError();
            }
        }


        return true;
    }

    // TODO: We may need to add more arguments if required by the username
    async sendEmail(emailTransporter, userEmail, textcontent, htmlcontent){
        emailTransporter.sendMail({
            from: '"AR-Reshare" <donotreply@example.com>', // sender address
            to: userEmail, // list of receivers
            subject: this.templateType, // Subject line
            text: textcontent,
            html: htmlcontent, // html body
          });
    }


    async process(emailTransporter, email, inputObject){
        // First we check the input object to see if the inputObject contains the correct attributes
        // --> This can check the emailTemplate's accepted arguments to check
        await this.replacementObjectValidate(inputObject);

        // We then get the emailTemplate string and replace certain strings using the valid inputObject
        let [textcontent, htmlcontent] = await this.templateReplace(inputObject);
        
        // Finally, we use the emailTransport to execute the request
        // --> Using sendMail in nodemailer, we fill in using the html template we replaced aswell as other information
        this.sendEmail(emailTransporter, email, textcontent, htmlcontent);
    }
}

module.exports = {
    EmailRespond,
    EmailTransporter,
    EmailTemplateDefinitions
}
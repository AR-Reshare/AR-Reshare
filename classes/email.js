const {TemplateError, InvalidArgumentError, AbsentArgumentError, EmailCredentialsReadError} = require('./errors.js');
const fs = require('fs/promises');
const path = require('path');
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
    static templates = {
        'Account-Modify': '',
        'Account-Create': '',
        'Password-Reset': '',
    };

    static arguments = {
        'Account-Modify': ['email', 'userID'],
        'Account-Create': ['email', 'userID'],
        'Password-Reset': ['email', 'userID', 'token'],
    };
}

class EmailTransporter {
    static emailConfigLocation = `classes${path.sep}emailConfig.conf`;

    static async getEmailCredentials(){
        // Here we access the credentials from the file
        let file, emailConfig;
        try {
            file = await fs.readFile(emailTransporter.emailConfigLocation);
            emailConfig = JSON.parse(file);
        } catch (err) {
            throw new emailConfigReadError();
        }

        if (!emailConfig){
            throw new AbsentArgumentError();
        }

        if (!emailConfig.credentials){
            throw new AbsentArgumentError('No "credentials" object was provided in the file');
        } else if (!emailConfig.credentials instanceof Object){
            throw new InvalidArgumentError('The "credentials" object is meant to be an object type');
        } else if (!emailConfig.credentials.username){
            throw new AbsentArgumentError('The "credentials.username" attribute is missing');
        } else if (!emailConfig.credentials.username instanceof String){
            throw new InvalidArgumentError('The "credentials.username" attribute should be of type String');
        } else if (!emailConfig.credentials.password) {
            throw new AbsentArgumentError('The "credentials.password" attribute is missing');
        } else if (!emailConfig.credentials.password instanceof String){
            throw new InvalidArgumentError('The "credentials.password" attribute should be of type String');
        }


        if (!emailConfig.connection){
            throw new AbsentArgumentError('No "connection" object was provided in the file');
        } else if (!emailConfig.connection instanceof Object){
            throw new InvalidArgumentError('The "connection" object is meant to be an object type');
        } else if (!emailConfig.connection.host){
            throw new InvalidArgumentError('The "connection.host" attribute is missing');
        }  else if (!emailConfig.connection.host instanceof String){
            throw new InvalidArgumentError('The "connection.host" attribute should be of type String');
        } else if (!emailConfig.connection.port){
            throw new InvalidArgumentError('The "connection.port" attribute is missing');
        } else if (!emailConfig.connection.port instanceof Number){
            throw new InvalidArgumentError('The "connection.port" attribute should be of type Number');
        } else if (!emailConfig.connection.secure){
            throw new InvalidArgumentError('The "connection.secure" attribute is missing');
        } else if (!emailConfig.connection.port instanceof Boolean){
            throw new InvalidArgumentError('The "connection.secure" attribute should be of type Boolean');
        }


        return emailConfig;

    }
    static async setup(username=null, password=null, host=null){
        // TODO: Setup an email address and replace default account
        // TODO: Add secure transport to the transporter
        if (!username || !password || !host){
            let testAccount = await nodemailer.createTestAccount();
            username = testAccount.user;
            password = testAccount.password;
            hostname = 'smtp.ethereal.email';
        }

        return nodemailer.createTransport({
            host: hostname,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: username, // generated ethereal user
              pass: password, // generated ethereal password
            },
          });
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
            this.templateArguments = EmailTemplateDefinitions.templates[this.templateType];
            this.templatePlaceholder = EmailTemplateDefinitions.arguments[this.templateType];
        }

    }

    async templateReplace(replacementObject){
        // TODO: Quite inefficient -- If you have time modify later
        for (arg in this.templateArguments){
            template.replace(arg, replaceObject.arg);
        }
        return template;
    }

    async replacementObjectValidate(replacementObject){
        // existance check and type check
        if (!replacementObject){
            throw new AbsentArgumentError();
        }

        for (arg in replacementObject){
            if (replacementObject[arg] === undefined){
                throw new AbsentArgumentError();
            } else if (!replacementObject[arg] instanceof String){
                throw new InvalidArgumentError();
            }
        }
        return true;
    }

    // TODO: We may need to add more arguments if required by the username
    async sendEmail(emailTransporter, userEmail, content){
        emailTransporter.sendMail({
            from: '"AR-Reshare" <donotreply@example.com>', // sender address
            to: userEmail, // list of receivers
            subject: this.templateType, // Subject line
            html: content, // html body
          });
    }


    async process(emailTransporter, email, inputObject){
        // First we check the input object to see if the inputObject contains the correct attributes
        // --> This can check the emailTemplate's accepted arguments to check
        await this.replacementObjectValidate(inputObject);

        // We then get the emailTemplate string and replace certain strings using the valid inputObject
        let content = await this.templateReplace(inputObject);
        
        // Finally, we use the emailTransport to execute the request
        // --> Using sendMail in nodemailer, we fill in using the html template we replaced aswell as other information
        this.sendEmail(emailTransporter, email, content);
    }
}

module.exports = {
    EmailRespond,
    EmailTemplateDefinitions
}
const {TemplateError, InvalidArgumentError, AbsentArgumentError} = require('./errors.js');
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
class emailTemplate {
    static templates = {
        'Account-Modify': null,
        'Account-Create': null,
        'Password-Reset': null,
    };

    static arguments = {
        'Account-Modify': ['email', 'userID'],
        'Account-Create': ['email', 'userID'],
        'Password-Reset': ['email', 'userID', 'token'],
    };
}




class emailRespond {
    constructor(templateType){
        let supportedTemplateTypes = ['Account-Modify', 'Account-Create', 'Password-Reset'];
        if (!supportedTemplateTypes.includes(templateType)){
            throw new TemplateError('An accepted TemplateType was not provided');
        } else {
            this.templateType = templateType;
            this.templateArguments = emailTemplate.templates[this.templateType];
            this.templatePlaceholder = emailTemplate.arguments[this.templateType];
        }

    }

    async templateReplace(replacementObject){
        // TODO: Quite inefficient -- If you have time modify later
        for (arg in this.templateArguments){
            template.replace(`{${arg}}`, replaceObject.arg);
        }
        return template;
    }

    async replacementObjectValidate(replacementObject){
        // existance check and type check
        if (replacementObject === null){
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
    async sendEmail(emailTransport, userEmail, content){
        transporter.sendMail({
            from: '"AR-Reshare" <donotreply@example.com>', // sender address
            to: userEmail, // list of receivers
            subject: this.templateType, // Subject line
            html: content, // html body
          });
    }


    async process(emailTransport, email, inputObject){
        // First we check the input object to see if the inputObject contains the correct attributes
        // --> This can check the emailTemplate's accepted arguments to check
        await this.replacementObjectValidate(inputObject);

        // We then get the emailTemplate string and replace certain strings using the valid inputObject
        let content = await this.templateReplace(inputObject);
        
        // Finally, we use the emailTransport to execute the request
        // --> Using sendMail in nodemailer, we fill in using the html template we replaced aswell as other information
        this.sendEmail(emailTransport, email, content);
    }
}
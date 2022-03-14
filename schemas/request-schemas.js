const RequestTemplate = require("../classes/requesttemplate");
const bcrypt = require('bcrypt');

// combination of lowercase, uppercase, numbers, and special characters
// change the numbers to require more of each
const PassPattern = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

const IsNonEmptyString = (aString) => {
    return (typeof aString === 'string' || aString instanceof String) && aString.length > 0;
}

const getAge = (dob) => Math.floor((new Date() - dob.getTime()) / 3.15576e+10)

const IsPosInt = (anInt) => {
    let num = Number.parseFloat(anInt);
    return Number.isInteger(num) && num >= 0;
}

const IsDate = (aString) => {
    if (!IsNonEmptyString(aString)) return false;
    let split = aString.split('-');
    if (!split.length === 3) return false;
    let date = new Date(`${split[0]}-${split[1]}-${split[2]}Z`);
    if (isNaN(date)) return false;
    return true;
}

const IsLocation = (anObject) => {
    return (typeof anObject === 'object'
            && 'country' in anObject
            && IsNonEmptyString(anObject['country'])
            && 'region' in anObject
            && IsNonEmptyString(anObject['region'])
            && 'postcode' in anObject
            && IsNonEmptyString(anObject['postcode'])
            );
}

const IsCondition = (aString) => ['poor', 'average', 'good', 'like new', 'new'].includes(aString);

const emptyReq = new RequestTemplate([]);

const accountIDOnly = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}]);

const createAccountTemplate = new RequestTemplate([{
    in_name: 'email',
    required: true,
    conditions: [
        IsNonEmptyString,
        (email) => (email.length >= 3 && email.includes('@')),
    ],
}, {
    in_name: 'name',
    required: true,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'password',
    out_name: 'passhash',
    required: true,
    conditions: [
        IsNonEmptyString,
        (password) => {
            if (PassPattern.test(password)) return true;
            else throw new Error('Password not strong enough'); // trigger 422
        },
    ],
    sanitise: (password) => bcrypt.hashSync(password, 12), // I'd rather do this as non-blocking but eh, whatever
}, {
    in_name: 'dob',
    required: true,
    conditions: [
        IsDate,
        (dob) => {
            let date = new Date(`${dob}Z`);
            if (getAge(date) < 13) throw new Error('Not old enough');
            else return true;
        }
    ],
    sanitise: (dob) => new Date(`${dob}Z`),
}, {
    in_name: 'address',
    required: false,
    conditions: [IsLocation],
}]);

const loginTemplate = new RequestTemplate([{
    in_name: 'email',
    required: true,
    conditions: [
        IsNonEmptyString,
        (email) => (email.length >= 3 && email.includes('@')),
    ],
}, {
    in_name: 'password',
    required: true,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'deviceToken',
    required: false,
}]);

const modifyAccountTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'name',
    required: false,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'email',
    required: false,
    conditions: [
        IsNonEmptyString,
        (email) => (email.length >= 3 && email.includes('@')),
    ],
}, {
    in_name: 'newPassword',
    out_name: 'passhash',
    required: false,
    conditions: [
        IsNonEmptyString,
        (password) => {
            if (PassPattern.test(password)) return true;
            else throw new Error('Password not strong enough'); // trigger 422
        },
    ],
    sanitise: (password) => bcrypt.hashSync(password, 12),
}, {
    in_name: 'dob',
    required: false,
    conditions: [
        IsDate,
        (dob) => {
            let date = new Date(`${dob}Z`);
            if (getAge(date) < 13) throw new Error('Not old enough');
            else return true;
        }
    ],
    sanitise: (dob) => new Date(`${dob}Z`),
}]);

const viewAccountListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}]);

const searchAccountListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'maxResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'startResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'categoryID',
    required: false,
    conditions: [IsPosInt],
}]);

const viewListingTemplate = new RequestTemplate([{
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}]);

const searchListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: false,
    conditions: [IsPosInt],
}, {
    in_name: 'maxResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'startResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'categoryID',
    required: false,
    conditions: [IsPosInt],
}, {
    in_name: 'region',
    required: false,
    conditions: [IsNonEmptyString],
}]);

const createListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'title',
    required: true,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'description',
    required: true,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'location',
    required: true,
    conditions: [
        (loc) => { return IsPosInt(loc) || IsLocation(loc); },
    ],
}, {
    in_name: 'categoryID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'condition',
    required: true,
    conditions: [IsCondition],
}, {
    in_name: 'media',
    required: false,
    // TODO: add support for media. Issue #32
}]);

const modifyListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'title',
    required: false,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'description',
    required: false,
    conditions: [IsNonEmptyString],
}, {
    in_name: 'location',
    required: false,
    conditions: [
        (loc) => { return IsPosInt(loc) || IsLocation(loc); },
    ],
}, {
    in_name: 'categoryID',
    required: false,
    conditions: [IsPosInt],
}, {
    in_name: 'condition',
    required: false,
    conditions: [IsCondition],
}]);

const closeListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'receiverID',
    required: false,
    conditions: [
        IsPosInt,
        (rcv, obj) => (Number.parseInt(obj['accountID']) !== rcv),
    ],
}]);

const createConversationTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}]);

const closeConversationTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'conversationID',
    required: true,
    conditions: [IsPosInt],
}]);

const createMessageTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'conversationID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'textContent',
    required: true,
    conditions: [IsNonEmptyString],
}]);

const listConversationTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'maxResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'startResults',
    required: true,
    conditions: [IsPosInt],
}]);

const viewConversationTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'conversationID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'maxResults',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'startResults',
    required: true,
    conditions: [IsPosInt],
}]);

const RequestTemplateDefinitions = {
    'get-index': null,
    'regenerate-token': null,

    'request-reset': null,
    'execute-reset': null,

    'search-category': emptyReq,
    
    'create-account': createAccountTemplate,

    'close-account': accountIDOnly,
    'login': loginTemplate,
    'modify-account': modifyAccountTemplate,
    'view-accountListing': viewAccountListingTemplate,
    'search-accountListing': searchAccountListingTemplate,
    'search-savedListing': null,
    'search-address': accountIDOnly,

    'view-listing': viewListingTemplate,
    'search-listing': searchListingTemplate,
    'create-listing': createListingTemplate,
    'modify-listing': modifyListingTemplate,
    'close-listing': closeListingTemplate,

    'create-conversation': createConversationTemplate,
    'close-conversation': closeConversationTemplate,
    'create-message': createMessageTemplate,
    'search-conversation': listConversationTemplate,
    'view-conversation': viewConversationTemplate,
};

module.exports = RequestTemplateDefinitions;

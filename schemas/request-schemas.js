const RequestTemplate = require('../classes/requesttemplate');
const bcrypt = require('bcrypt');
const { UnprocessableArgumentError } = require('../classes/errors');

// combination of lowercase, uppercase, numbers, and special characters
// change the numbers to require more of each
const PassPattern = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

/**
 * Checks whether a parameter is both a string and not the empty string
 * @param {*} aString Paramater to check
 * @returns Boolean
 */
const IsNonEmptyString = (aString) => {
    return (typeof aString === 'string' || aString instanceof String) && aString.length > 0;
};

/**
 * Gets the age of a person, if the argument is their date of birth
 * @param {Date} dob The person's date of birth
 * @returns Age of the person
 */
const getAge = (dob) => Math.floor((new Date() - dob.getTime()) / 3.15576e+10);

/**
 * Checks whether a parameter is both an integer and a positive one (or possibly a string containing an integer)
 * @param {*} anInt Parameter to check
 * @returns Boolean
 */
const IsPosInt = (anInt) => {
    let num = Number.parseFloat(anInt);
    return Number.isInteger(num) && num >= 0;
};

/**
 * Checks whether a parameter is a valid ISO8601 date (YYYY-MM-DD)
 * @param {*} aString Parameter to check
 * @returns Boolean
 */
const IsDate = (aString) => {
    if (!IsNonEmptyString(aString)) return false;
    let split = aString.split('-');
    if (!split.length === 3) return false;
    let date = new Date(`${split[0]}-${split[1]}-${split[2]}Z`);
    if (isNaN(date)) return false;
    return true;
};

/**
 * Checks wether a parameter is a valid Location
 * @param {*} anObject Parameter to check
 * @returns Boolean
 */
const IsLocation = (anObject) => {
    return (typeof anObject === 'object'
            && 'country' in anObject
            && IsNonEmptyString(anObject['country'])
            && 'region' in anObject
            && IsNonEmptyString(anObject['region'])
            && 'postcode' in anObject
            && IsNonEmptyString(anObject['postcode'])
    );
};

/**
 * Checks whether a parameter is a valid Condition
 * @param {*} aString Parameter to check
 * @returns Boolean
 */
const IsCondition = (aString) => ['poor', 'average', 'good', 'like new', 'new'].includes(aString);

/**
 * Checks whether a parameter is a valid data URI containing an image
 * @param {*} aString Parameter to check
 * @returns Boolean
 */
const IsImage = (aString) => {
    if (!IsNonEmptyString(aString)) return false;
    const mimetypepattern = /^data:(\w+)\/(\w+);base64,[A-Za-z0-9/+]+=*$/g;
    let matches = Array.from(aString.matchAll(mimetypepattern));
    if (matches.length !== 1 || matches[0].length !== 3) return false;
    if (matches[0][1] === 'image') return true;
    else throw new UnprocessableArgumentError('Media must be an image');
};

/**
 * Checks whether a parameter is a valid data URI containing an image or video
 * @param {*} aString Parameter to check
 * @returns Boolean
 */
const IsImageOrVideo = (aString) => {
    if (!IsNonEmptyString(aString)) return false;
    const mimetypepattern = /^data:(\w+)\/(\w+);base64,[A-Za-z0-9/+]+=*$/g;
    let matches = Array.from(aString.matchAll(mimetypepattern));
    if (matches.length !== 1 || matches[0].length !== 3) return false;
    if (matches[0][1] === 'image' || matches[0][1] === 'video') return true;
    throw new UnprocessableArgumentError('Media must be an image or video');
};

/**
 * Discard all request parameters
 */
const emptyReq = new RequestTemplate([]);

/**
 * Discard all request parameters. Keep the accountID from authentication
 */
const accountIDOnly = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}]);

/******************************************* START OF SCHEMAS ******************************************/

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
}, {
    in_name: 'picture',
    out_name: 'media',
    required: false,
    conditions: [IsImage],
    sanitise: (media) => [media],
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
    in_name: 'registrationToken',
    out_name: 'deviceToken',
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
}, {
    in_name: 'picture',
    out_name: 'media',
    required: false,
    conditions: [IsImage],
    sanitise: (media) => [media],
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
    conditions: [
        Array.isArray,
        (media) => (media.every(IsImageOrVideo)),
    ]
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
}, {
    in_name: 'media',
    required: false,
    conditions: [
        Array.isArray,
        (media) => (media.every(IsImageOrVideo)),
    ]
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
}, {
    in_name: 'mediaContent',
    required: false,
    conditions: [
        Array.isArray,
        (media) => (media.every(IsImageOrVideo)),
    ]
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

/******************************************* END OF SCHEMAS ******************************************/

/**
 * Dictionary of request templates
 */
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

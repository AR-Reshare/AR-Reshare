const RequestTemplate = require("../classes/requesttemplate")

const IsNonEmptyString = (aString) => {
    return (typeof aString === 'string' || aString instanceof String) && aString.length > 0;
}

const CanBeID = (anInt) => {
    let num = Number.parseFloat(anInt);
    return Number.isInteger(num) && num >= 1;
}

const IsLocation = (anObject) => {
    return (typeof anObject === 'object'
            && 'country' in anObject
            && IsNonEmptyString(anObject['country'])
            && 'postcode' in anObject
            && IsNonEmptyString(anObject['postcode'])
            );
}

const IsCondition = (aString) => ['poor', 'average', 'good', 'like new', 'new'].includes(aString);

const emptyReq = new RequestTemplate([]);

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
    in_name: 'device_token',
    required: false,
}]);

const viewListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: false,
    conditions: [CanBeID],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [CanBeID],
}]);

const createListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [CanBeID],
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
        (loc) => { return CanBeID(loc) || IsLocation(loc); },
    ],
}, {
    in_name: 'category',
    required: true,
    conditions: [CanBeID],
}, {
    in_name: 'condition',
    required: true,
    conditions: [IsCondition],
}, {
    in_name: 'media',
    required: false,
    // TODO: add support for media. Issue #32
}]);

const RequestTemplateDefinitions = {
    'get-index': null,
    'regenerate-token': null,

    'request-reset': null,
    'execute-reset': null,

    'search-category': emptyReq,
    
    'create-account': null,

    'close-account': null,
    'login': loginTemplate,
    'modify-account': null,
    'view-accountListing': null,
    'search-accountListing': null,
    'search-savedListing': null,
    'search-address': null,

    'view-listing': viewListingTemplate,
    'search-listing': null,
    'create-listing': createListingTemplate,
    'modify-listing': null,
    'close-listing': null,

    'create-conversation': null,
    'close-conversation': null,
    'create-message': null,
    'search-conversation': null,
    'view-conversation': null,
};

module.exports = RequestTemplateDefinitions;

const RequestTemplate = require("../classes/requesttemplate")

const IsNonEmptyString = (aString) => {
    return (typeof aString === 'string' || aString instanceof String) && aString.length > 0;
}

const IsPosInt = (anInt) => {
    let num = Number.parseFloat(anInt);
    return Number.isInteger(num) && num >= 0;
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

const viewAccountListingTemplate = new RequestTemplate([{
    in_name: 'accountID',
    required: true,
    conditions: [IsPosInt],
}, {
    in_name: 'listingID',
    required: true,
    conditions: [IsPosInt],
}])

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

const RequestTemplateDefinitions = {
    'get-index': null,
    'regenerate-token': null,

    'request-reset': null,
    'execute-reset': null,

    'search-category': emptyReq,
    
    'create-account': null,

    'close-account': accountIDOnly,
    'login': loginTemplate,
    'modify-account': null,
    'view-accountListing': viewAccountListingTemplate,
    'search-accountListing': null,
    'search-savedListing': null,
    'search-address': accountIDOnly,

    'view-listing': viewListingTemplate,
    'search-listing': searchListingTemplate,
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

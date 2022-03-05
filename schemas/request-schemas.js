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

const RequestTemplateDefinitions = {
    'login': new RequestTemplate([{
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
    }]),

    'create-listing': new RequestTemplate([{
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
    }]),
};

module.exports = RequestTemplateDefinitions;

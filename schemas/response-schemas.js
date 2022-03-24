const ResponseTemplate = require('../classes/responsetemplate');

/**
 * Schema for the details of a Listing entity
 */
const listingDetails = new ResponseTemplate([{
    out_name: 'listingID',
    field: 'listingid',
}, {
    out_name: 'contributorID',
    field: 'contributorid',
}, {
    out_name: 'title',
    field: 'title',
}, {
    out_name: 'description',
    field: 'description',
}, {
    out_name: 'condition',
    field: 'condition',
}, {
    out_name: 'location',
    one_row_with_fields: ['country'],
}, {
    out_name: 'categoryID',
    field: 'categoryid',
}, {
    out_name: 'media',
    rows_with_fields: ['mimetype', 'url'],
}, {
    out_name: 'creationDate',
    field: 'creationdate',
}, {
    out_name: 'modificationDate',
    field: 'modificationdate',
}, {
    out_name: 'closedDate',
    field: 'closeddate',
}, {
    out_name: 'receiverID',
    field: 'receiverid',
}], {
    'EmptyResponseError': 404,
    'BackreferenceError': 404, // the first query returned nothing, so the backreferences failed
});

/**
 * Schema for the details of a Conversation entity
 */
const ConversationDetails = new ResponseTemplate([{
    out_name: 'listingID',
    field: 'listingID'
}, {
    out_name: 'title',
    field: 'title',
}, {
    out_name: 'mimetype',
    field: 'mimetypeMain',
}, {
    out_name: 'url',
    field: 'urlMain',
}, {
    out_name: 'receiverID',
    field: 'receiverID',
}, {
    out_name: 'receiverName',
    field: 'receiverName',
}, {
    out_name: 'contributorID',
    field: 'contributorID',
}, {
    out_name: 'contributorName',
    field: 'contributorName',
}, {
    out_name: 'closedDate',
    field: 'closedDate',
}, {
    out_name: 'messages',
    rows_with_fields: 'senderID',
}], {'BackreferenceError': 404});

/**
 * Schema dictionary, smaller schemas are inline
 */
const ResponseTemplateDict = {
    'search-category': new ResponseTemplate([{
        out_name: 'categories',
        rows_with_fields: ['categoryID'],
    }]),
    'create-account': new ResponseTemplate([], {
        null: 201,
        'EmptyResponseError': 409,
    }),
    'close-account': new ResponseTemplate([], {}),
    'login': new ResponseTemplate([], {}),
    'modify-account': new ResponseTemplate([], {
        'EmptyQueryError': 400,
        'EmptyResponseError': 403,
    }),
    'regenerate-token': new ResponseTemplate([], {
        null: 201,
    }),
    'view-accountListing': listingDetails,
    'search-accountListing': new ResponseTemplate([{
        out_name: 'listings',
        rows_with_fields: ['listingID'],
    }]),
    'search-savedListing': new ResponseTemplate([{
        out_name: 'listings',
        rows_with_fields: ['listingID'],
    }]),
    'create-savedListing': new ResponseTemplate([], {}),
    'close-savedListing': new ResponseTemplate([], {}),
    'search-address': new ResponseTemplate([{
        out_name: 'addresses',
        rows_with_fields: ['addressID'],
    }]),
    'view-listing': listingDetails,
    'search-listing': new ResponseTemplate([{
        out_name: 'listings',
        rows_with_fields: ['listingID'],
    }]),
    'create-listing': new ResponseTemplate([{
        out_name: 'success',
        field: 'listingid',
    }], {null: 201}),
    'modify-listing': new ResponseTemplate([], {
        'EmptyQueryError': 400,
    }),
    'close-listing': new ResponseTemplate([], {'BackreferenceError': 404}),
    'create-conversation': new ResponseTemplate([{
        out_name: 'success',
        field: 'conversationid',
    }], {null: 201}),
    'close-conversation': new ResponseTemplate([], {}),
    'create-message': new ResponseTemplate([{
        out_name: 'success',
        field: 'messageid',
    }], {null: 201}),
    'search-conversation': new ResponseTemplate([{
        out_name: 'conversations',
        rows_with_fields: ['conversationID'],
    }]),
    'view-conversation': ConversationDetails,
};

module.exports = ResponseTemplateDict;

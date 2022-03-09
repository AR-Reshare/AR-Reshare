const ResponseTemplate = require("../classes/responsetemplate");

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

const ListingDescArray = new ResponseTemplate([{
    out_name: 'listings',
    rows_with_fields: ['listingID'],
}]);

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
    'view-accountListing': listingDetails,
    'search-address': new ResponseTemplate([{
        out_name: 'addresses',
        rows_with_fields: ['addressID'],
    }]),
    'view-listing': listingDetails,
    'search-listing': ListingDescArray,
    'create-listing': new ResponseTemplate([{
        out_name: 'success',
        field: 'listingid',
    }], {null: 201}),
    'close-listing': new ResponseTemplate([], {}),
};

module.exports = ResponseTemplateDict;

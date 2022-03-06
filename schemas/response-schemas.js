const ResponseTemplate = require("../classes/responsetemplate");

const listingDetails = new ResponseTemplate([{
    out_name: 'title',
    field: 'title',
}, {
    out_name: 'description',
    field: 'description',
}, {
    out_name: 'condition',
    field: 'condition',
}, {
    out_name: 'country',
    field: 'country',
}, {
    out_name: 'postcode',
    field: 'postcode',
}, {
    out_name: 'category',
    field: 'categoryname',
}, {
    out_name: 'category-icon',
    field: 'icon',
}, {
    out_name: 'category-colour',
    field: 'colour',
}, {
    out_name: 'media',
    rows_with_fields: ['mimetype', 'url'],
}], {
    'EmptyResponseError': 404,
});

const ListingDesc = new ResponseTemplate([{
    out_name: 'title',
    field: 'title',
}, {
    out_name: 'description',
    field: 'description',
}, {
    out_name: 'condition',
    field: 'condition',
}, {
    out_name: 'country',
    field: 'country',
}, {
    out_name: 'postcode',
    field: 'postcode',
}, {
    out_name: 'media_mime',
    field: 'mimetype',
}, {
    out_name: 'media_url',
    field: 'url',
}]);

const ResponseTemplateDict = {
    'search-category': new ResponseTemplate([{
        out_name: 'categories',
        rows_with_fields: ['categoryid'],
    }]),
    'close-account': new ResponseTemplate([], {}),
    'login': new ResponseTemplate([], {}),
    'view-accountListing': listingDetails,
    'search-address': new ResponseTemplate([{
        out_name: 'addresses',
        rows_with_fields: ['addressid'],
    }]),
    'view-listing': listingDetails,
    'search-listing': ListingDesc,
    'create-listing': new ResponseTemplate([{
        out_name: 'listingID',
        field: 'listingid',
    }], {null: 201}),
};

module.exports = ResponseTemplateDict;

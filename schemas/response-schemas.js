const ResponseTemplate = require("../classes/responsetemplate");

const ResponseTemplateDict = {
    'search-category': new ResponseTemplate([{
        out_name: 'categories',
        rows_with_fields: ['categoryid'],
    }]),
    'login': new ResponseTemplate([], {
        null: 200,
    }),
    'search-address': new ResponseTemplate([{
        out_name: 'addresses',
        rows_with_fields: ['addressid'],
    }]),
    'view-listing': new ResponseTemplate([{
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
    }),
    'create-listing': new ResponseTemplate([{
        out_name: 'listingID',
        field: 'listingid',
    }], {null: 201}),
};

module.exports = ResponseTemplateDict;

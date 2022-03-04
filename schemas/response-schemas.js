const ResponseTemplate = require("../classes/responsetemplate");

const ResponseTemplateDict = {
    'login': new ResponseTemplate([], {
        null: 200,
    }),
    'create-listing': new ResponseTemplate([{
        out_name: 'listingID',
        field: 'listingid',
    }], {null: 201}),
};

module.exports = ResponseTemplateDict;

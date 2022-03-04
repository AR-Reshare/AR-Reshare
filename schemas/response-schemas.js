const ResponseTemplate = require("../classes/responsetemplate");

const ResponseTemplateDict = {
    'login': new ResponseTemplate([], {
        null: 200,
    }),
};

module.exports = ResponseTemplateDict;

const RequestTemplate = require("../classes/requesttemplate")

const RequestTemplateDefinitions = {
    'login': new RequestTemplate([{
        in_name: 'email',
        required: true,
        conditions: [
            (email) => (typeof email === 'string' || email instanceof String),
            (email) => (email.length >= 3 && email.includes('@')),
        ],
    }, {
        in_name: 'password',
        required: true,
        conditions: [
            (pass) => (typeof pass === 'string' || pass instanceof String),
            (pass) => (pass.length >= 1),
        ],
    }, {
        in_name: 'device_token',
        required: false,
    }])
}

module.exports = RequestTemplateDefinitions;

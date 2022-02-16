/* This file will contain template strings for PostgreSQL
*/
const SQLTemplate = require('../classes/sqltemplate');

// define a bunch of SQLTemplates, including maybe some custom ones that overwrite .build
const CreateAccountTemplate = new SQLTemplate({
    create: {
        text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ($1, $2, $3, $4) RETURNING UserID',
        values: [{
            from_input: 'name'
        }, {
            from_input: 'email'
        }, {
            from_input: 'hash_password'
        }, {
            from_input: 'date_of_birth'
        }],
    },
}, ['create']);

const CreateAdminAccountTemplate = new SQLTemplate({
    create: {
        text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ($1, $2, $3, $4) RETURNING UserID',
        values: [{
            from_input: 'name'
        }, {
            from_input: 'email'
        }, {
            from_input: 'hash_password'
        }, {
            from_input: 'date_of_birth'
        }],
    },
    make_admin: {
        text: 'INSERT INTO Administrator (UserID) VALUES ($1)',
        values: [{
            from_query: ['create', 'UserID'],
        }],
    },
}, ['create', 'make_admin']);

const sqlTemplatesDict = {
    'create-account': CreateAccountTemplate,
    'create-admin': CreateAdminAccountTemplate,
};

module.exports = {SQLTemplate, sqlTemplatesDict};

const SQLTemplate = require('../classes/sqltemplate');

/**
 * Some things to bear in mind when creating these:
 *  1. Create queries should always return in their final row the IDs of the accounts who are affected by this change
 */

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

const LoginTemplate = new SQLTemplate({
    get_id: {
        text: 'SELECT UserID FROM Account WHERE Email = $1',
        condition: (inputObject) => ('device_token' in inputObject),
        values: [{
            from_input: 'email',
        }],
    },
    store_token: {
        text: 'INSERT INTO PushToken (DeviceToken, UserID) VALUES ($1, $2) ON CONFLICT (DeviceToken) DO UPDATE SET UserID = EXCLUDED.UserID, Time = CURRENT_TIMESTAMP',
        condition: (inputObject) => ('device_token' in inputObject),
        values: [{
            from_input: 'device_token',
        }, {
            from_query: ['get_id', 'userid'],
        }],
    }
}, ['get_id', 'store_token']);

const sqlTemplatesDict = {
    'create-account': CreateAccountTemplate,
    'login': LoginTemplate,
};

module.exports = sqlTemplatesDict;

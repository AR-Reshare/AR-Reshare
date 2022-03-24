// NOTE0: Some of these paths are likely to be scrapped since we don't have enough time

// NOTE1: This file should contain the categorization of each of the paths/urls that will be used
// NOTE2: Admin functionality has been ommitted
// NoAuth = 'NA', TokenCreation = 'TC', TokenRegeneration = 'TR', Authorize+Authenticate = 'AA'

// THe security validation component checks whether the neccessary data exists in a request to bestow trust on a user
// /account/create doesn't form trust in this sense (we are not creating, regenerating a token, or authenticating+authorizing a user)

const { SecuritySchema } = require('../classes/securityvalidation');

const securitySchemaDefinitions = {
    'get-index': new SecuritySchema('NA'),
    
    'regenerate-token': new SecuritySchema('AA_TO'), // should regenerating a token require re-entering a password?
    
    'request-reset' : new SecuritySchema('NA'), // NOTE: Should a token be generated to validate reset-execute?
    'execute-reset' : new SecuritySchema('NA'),

    'search-category': new SecuritySchema('NA'),

    // NOTE: this path is in question. See issue #25
    'create-account': new SecuritySchema('NA'),

    'close-account': new SecuritySchema('AA_TAP'),
    'login': new SecuritySchema('NA'), // attempting a login does not require being logged in
    'modify-account': new SecuritySchema('AA_TAP'),
    'view-accountListing': new SecuritySchema('AA_TO'),
    'search-accountListing': new SecuritySchema('AA_TO'),
    'search-savedListing': new SecuritySchema('AA_TO'),
    'create-savedListing': new SecuritySchema('AA_TO'),
    'close-savedListing': new SecuritySchema('AA_TO'),
    'search-address': new SecuritySchema('AA_TO'),

    'view-listing': new SecuritySchema('NA'),
    'search-listing': new SecuritySchema('NA'),
    'create-listing': new SecuritySchema('AA_TO'),
    'modify-listing': new SecuritySchema('AA_TO'),
    'close-listing': new SecuritySchema('AA_TO'),

    'create-conversation': new SecuritySchema('AA_TO'),
    'close-conversation': new SecuritySchema('AA_TO'),
    'create-message': new SecuritySchema('AA_TO'),
    'search-conversation': new SecuritySchema('AA_TO'),
    'view-conversation': new SecuritySchema('AA_TO'),

};

module.exports = securitySchemaDefinitions;
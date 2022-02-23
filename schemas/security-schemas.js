// NOTE0: Some of these paths are likely to be scrapped since we don't have enough time

// NOTE1: This file should contain the categorization of each of the paths/urls that will be used
// NOTE2: Admin functionality has been ommitted
// NoAuth = "NA", TokenCreation = "TC", TokenRegeneration = "TR", Authorize+Authenticate = "AA"

// THe security validation component checks whether the neccessary data exists in a request to bestow trust on a user
// /account/create doesn't form trust in this sense (we are not creating, regenerating a token, or authenticating+authorizing a user)

var securitySchemaDefinitions = {
    "/": "NA", // NOTE: Might be redundant
    "/index": "NA",
    
    "/admin": "TC",
    "/admin/dashboard": "AA_TO", // NOTE: Non-existent in the oas definition
    "/admin/listing/view": "AA_TO",
    "/admin/listings/search": "AA_TO",
    "/admin/listing/modify": "AA_TO",
    "/admin/user/view": "AA_TO",
    "/admin/users/search": "AA_TO",
    "/admin/user/modify": "AA_TO",
    "/admin/reports/search": "AA_TO",
    "/admin/report/search":"AA_TO",
    "/admin/report/modify":"AA_TO",
    "/admin/sanction/create":"AA_TO",
    "/admin/sanction/close":"AA_TO",
    "/admin/sanction/view":"AA_TO",
    "/admin/sanctions/search":"AA_TO",

    "/account/create": "NA",    // requires email password etc (But not checked by a user)
    "/account/login": "TC",
    "/account/modify": "AA_TAP",
    "/account/listing/view": "AA_TO",
    "/account/listings/search": "AA_TO",
    "/account/reset-request" : "NA", // NOTE: Should a token be generated to validate reset-execute?
    "/account/reset-execute" : "NA",
    "/account/sanction/view": "AA_TO",
    "/account/sanctions/list": "AA_TO",
    "/account/sanctions/search": "AA_TO",
    "/account/request/create": "AA_TO",
    "/account/request/view": "AA_TO",
    "/account/request/close": "AA_TO",

    "/listing/view": "NA",
    "/listings/search": "NA",
    "/listing/create": "AA_TO",
    "/listing/modify": "AA_TO",
    "/listing/close": "AA_TO",

    // NOTE: Should someone be able to report without being logged in? (Seems easy to exploit)
    "/report": "AA_TO",
    "/request": "AA_TO",

    "/conversation/create": "AA_TO",
    "/conversation/close": "AA_TO",
    "/conversations": "AA_TO",
    "/conversation/view": "AA_TO",

};

module.exports(securitySchemaDefinitions);
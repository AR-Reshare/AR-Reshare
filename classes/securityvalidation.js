jwt = require("jsonwebtoken");

// NOTE: This is NOT the token signing system - That hasn't been constructed yet

function SecurityValidate(resource, token) {
    // There are two parts to the securityValidation

    // 1. We start by authenticating the user (i.e. is the token valid, legal etc)
    // 2. We end by checking whether the user should be able to access the said resource
  
    // NOTES:
    // Certain resources do not require authentication - If the user provides a invalid token (regardless of not requiring auth, we reject)

    // Scenarios (Authentication):
    // 0. Malformed token provided by user
    // 1. Non-authenticated resource with non-authenticated user (Good)
    // 2. Non-authenticated resource with invalidly authenticated user (Bad)
    // 3. Non-authenticated resource with correctly authenticated user (Good)
    
    // 4. Authenticated resource with non-authenitcated user (Reject)
    // 5. Authenticated resource with validly authenticated user (Pending on authorization)
    // 6. Authenticated resource with invalidly authenticated user (Pending on authorization)

    // Scenarios (Authorization) - At the point where this is called, the JWT token must be verified succesfully
    // 7. Authenticated resource with validly authenticated user (ext 5.) (Accept)
    // 8. Authenticated resource with invalidly authenticated user (ext 6.) (Reject)
 


    // Scenarios (Token-Creation Request)
    // 1. Non-authenticated users


    // Scenarios (Token-Update Request)
    // 2. Authenticated Users ()


    // Resource categorization
    // 1. Require no Authentication
    // 2. Require details to create a new Token
    // 3. Require a unexpired token to generate a new Token
    // 4. Require Authentication + Authorization 

}


// These are boilerplate functions, who's arguments and return types will be subject to change:

function authenticateRequest(resource, token){};

function authorizeRequest(resource, token){};

function generateNewToken(resource, token){};

function createNewToken(resource, token){};

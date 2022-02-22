jwt = require("jsonwebtoken");

// NOTE: This is NOT the token signing system - That hasn't been constructed yet

// function SecurityValidate(resource, token) {
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

    
    
    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------


    // Resource categorization
    // 1. Require no Authentication
    // 2. Require details to create a new Token
    // 3. Require a unexpired token to generate a new Token
    // 4. Require Authentication + Authorization 


    // Proposed Logic Pseudocode:

    // 1.1 We start by checking whether a token has been provided and whether we have a valid resource - If so verify that it is correct (This saves a lot of hassel later)
    // NOTE: Jwt verify checks the format aswell before verifing

    // validToken = None
    // if token == None:
    //      validToken = jwt.verify(token)
    //      if validToken == False: raise the corresponding exception

    // bIsResourceValid = resource.isValid()                    // This is checked by using a lookup to a definition
    // if bIsResourceValid == False: raise ResourceNotFound     // NOTE: I feel like this should be some function that is called just before the one we are in right now


    // 1.2 Once receiving a valid and verified token, we use it to fill in important variables
    // userId = ...
    // Admin = ...


    // 2. We perform a lookup of the resource name (url) to determine what category it is
    // if category1:
    //      accept request
    //      return 1, None
    // elif category2:
    //      if validToken == True: raise AlreadyAuthenticatedUserError
    //      ...
    //      TODO: Requires checking that credentials are valid              // TOOD: Need to query the database to check whether the credentials exist and are correct
    //      ...
    //      err, newtoken = createNewToken(userId)    
    //      if err.exists: raise Err.exception()
    //      return 2, newtoken
    // elif category3:
    //      if validToken == None: raise InvalidTokenError
    //      err, token = generateToken(userId, token)                       // the token should be valid
    //      if err.exists: raise Err.exception()
    //      return 2, newtoken
    // elif category4:                              
    //      if validToken == None: raise InvalidTokenError                  // If the token was invalid, we would have already raised an exception previously
    //      isAuth = isUserAuthorized(user, token)
    //      if isAuth == False: raise UnauthorizedUserError
    //      return 1, None
    // else:
    //      raise ServerErrorException                                      // The resource has been verified to exist, yet we are here
    //

    // TODO: Consider splitting InvalidTokenError to more specific errors maybe -- they are raised in different situations/scenarios
    // TODO: Update the Exceptions to be more descriptive

// }

function SecurityValidate(resourceName, query, token){
    return new Promise((resolve, reject) => {

        let decodedToken, category;

        // Checking the format of the token and verifying whether it is a valid token
        validToken = null;
        if (token !== null){
            // TODO: After creating the token signing module, add the neccessary verify() arguments (e.g. maybe audience, issuers, jwtid, etc.)
            jwt.verify(token, secret, function(err, decoded){
                switch (err.name){
                    case "JsonWebTokenError":
                        switch (err.message){
                            case "invalid signature":
                                throw new TamperedTokenError;
                            default:
                                throw new InvalidTokenError;
                        }
                    case "TokenExpiredError":
                        throw new ExpiredTokenError;
                    case "NotBeforeError":
                        // NOTE: We are not implementing NBE so this error should never be raise -- Make sure to add it to tests though
                        throw new  NotBeforeTokenError;
                    default:
                        decodedToken = decoded;
                }
            });
            // Token here should be successfully verified
            // TODO: Getting identifiable and important information from valid token
            validToken = True;
            console.log(decodedToken);

        }

        category = authDefinitions.resource;
        // categories are as follows:
        // NoAuth = "NA", TokenCreation = "TC", TokenRegeneration = "TR", Authorize+Authenticate = "AA"

        if (category === "NA"){
            return [true, null];

        } else if (category === "TC"){
            if (validToken) {
                throw new AlreadyAuthenticatedError;
            } else if (!isValidUserCredentials(userID, password)) {
                throw new InvalidCredentialsError;
            } else {
                return [true, createNewToken(resourceName, token)]; // At this point, there should be no current token, and the user has valid creds
            }

        } else if (category === "TR"){
            if (validToken === null){
                throw new InvalidTokenError;
            } else {
                return [true, regenerateToken(token)];
            }

        } else if (category === "AA"){
            if (!validToken){
                throw new UnauthenticatedUserError;
            } else if (!isUserAuthorized(resource, userID)){
                throw new UnauthorizedUserError;
            } else {
                return [true, null];
            }

        } else {
            throw new ServerException;
        }

    })
}


// These are boilerplate functions, who's arguments and return types will be subject to change:

function isUserAuthorized(resource, token){};

// This should encapsulate the token-related code in 1.1
function isUserAuthenticated(token){};

function regenerateToken(token){};

function createNewToken(userID){};

function isValidUserCredentials(userID, password){};

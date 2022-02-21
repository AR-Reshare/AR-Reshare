const jwt = require("jsonwebtoken");

// 1. We create a mock pipeline function
// 2. We call the pipeline securityValidate function() from the mock pipeline
// 3. For each call, we use a different class of input arguments


// The classes are as specified in the Test Plan Report
// NOTE: These may be updated as we find new classes that aren't covered, or in order to split non-atomic classes

// Classes:

// C1. Token String Empty
// C2. Token String is not valid base64 format
// C3. Token String is not in JWT format (i.e. it there base64strings with dot/period dividers)
// C4. Token String isn't parsed into a valid JSON format
// C5. Token String is in a valid format

// NOTE: There is no C6 -- (This is an admin error)

// C7. (C5 and) The token has been tampered with.
// C8. (C5 and) The token has expired.
// C9. (C5 and) The token can be verified 

// C10. (C9. and) The user is not authorised.
// C11. (C9. and) The user is authorised.

// Additionally, we will want to test the above classes on four different request types:

// Requests:

// C12. Authorisation is required for the request.
// C13. Authorisation is optional for the request.
// C14. The request is to generate a token.
// C15. The request is to update a token.

// NOTE: These components are stateless, that mean that there should be no need to perform setup/teardowns for
// states. So far, the basic functionality of this component shouldn't have any dependencies (although, the recent
// decision to merge verification and signing components together will most likley change this).

// TODO: Ensure that the logic is encapsulated in the Pipeline as a function for the securityvalidate
const Pipeline = require('../../classes/pipeline');
const jwt = required('jsonwebtoken');
const crypto = require('crypto');

let pipe, validPayload, validToken, key, query;

beforeAll(() => {
    pipe = new Pipeline();
    key = "testsecretkeybase";
    query = {};
});



describe("Unit Test 12 - Pipeline.SecurityValidation (Assessing Token Format)", () => {
    test("Class 1: Token String Empty", () => {
        let inputToken = "";
        let resourceName = "/";

        return expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(InvalidTokenError);
    });

    test("Class 2: Token String is not valid base64", () => {
        let inputToken = "!(xfdsa]x";
        let resourceName = "/";

        return expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(InvalidTokenError);
    });

    test("Class 3: Token String is not in valid JWT format", () => {
        // inputToken = base64.encode("hello") + "." + base64.encode("there")
        let inputToken = "aGVsbG8K.dGhlcmUK";
        let resourceName = "/";

        return expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(InvalidTokenError);
    });

    test("Class 4: Token String isn't parsed into valid JSON object", () => {
        // inputToken = base64.encode("{'username','password','invalidformat'}")
        let inputToken = "eyJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaW52YWxpZGZvcm1hdCJ9";
        let resourceName = "/";
        
        return expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(InvalidTokenError);
    });

    test("Class 5: Token String is in a valid format", () => {
        // inputToken = default encoded token example from https://jwt.io/
        let inputToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        // NOTE: This isn't tested as the below test set are subsets of class 5
    });
});


describe("Unit Test 12 - Pipeline.SecurityValidation (Verifying Token)", () => {
    // NOTE: THis is empty in the test plan report (is this an ommission error, or did we just skip it?)
    test("Class 6: Unknown Class", () => {
        //pass
    });
    // NOTE: We cannot absolutely say if a token has been tampered with, only that the token information doesn't add up
    test("Class 7: The token has been tampered with", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let modifiedPayload = {
            name: "Dolores Haze",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);
        let signedToken = jwt.sign(payload, privateKey, {algorithm: "HS256"});
        let tokenSections = signedToken.split(".");
        tokenSections[1] = btoa(JSON.stringify(modifiedPayload));

        let inputToken = tokenSections.join(".");
        let resourceName = "/";

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(TamperedTokenError);
    });

    test("Class 8: The token has expired", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);

        let inputToken = jwt.sign(payload, privateKey, {algorithm: "HS256", exp: Date.now() - 1})
        let resourceName = "/";

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(ExpiredTokenError);
    });

    test("Class 9: The token can be verified successfully", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);

        let inputToken = jwt.sign(payload, privateKey, {algorithm: "HS256"});
        let resourceName = "/";

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toBeInstanceOf(string);
    });

});

describe("Unit Test 12 - Pipeline.SecurityValidation (Authorizing User)", () => {
    test("Class 10a: The user is not authorized (user mismatch)", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);
        let inputToken = jwt.sign(payload, privateKey, {algorithm: "HS256"});
        let resourceName = "/listing/modify"; // BUG: This resource is actually incorrectly defined in OAS - (The OAS doesn't use a listingID)
        let query = {listingId: "0"};
        // NOTE: Eventhough, the query is incomplete for the entire pipeline, since we are testing the security-val (which is the first part)
        // no error should occur

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(UnauthroizedUserError);

    })
    test("Class 10b: The user is not authorized (admin mismatch)", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);
        let inputToken = jwt.sign(payload, privateKey, {algorithm: "HS256"});
        let resourceName = "/admin/user/view";
        query = {userId: "ssepiol123"};

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toThrow(UnauthroizedUserError);

    });
    test("Class 11: The user is authorized", () => {
        let payload = {
            name: "Sam Sepiol",
            admin: false
        };

        let privateKey = crypto.createHmac("sha256", key);

        let inputToken = jwt.sign(payload, privateKey, {algorithm: "HS256"});
        let resourceName = "/account/modify";

        expect(() => {
            pipe.SecurityValidate(resourceName, query, inputToken);
        }).toBeInstanceOf(string);

    });
});



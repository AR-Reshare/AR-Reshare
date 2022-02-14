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

describe("Unit Test 12 - Pipeline.SecurityValidation (Assessing Token Format)", () => {
    test("Class 1: Token String Empty", () => {
        //pass
    });
    test("Class 2: Token String is not valid base64", () => {
        //pass
    });
    test("Class 3: Token String is not in valid JWT format", () => {
        //pass
    });
    test("Class 4: Token String isn't parsed into valid JSON object", () => {
        //pass
    });
    test("Class 5: Token String is in a valid format", () => {
        //pass
    });
});


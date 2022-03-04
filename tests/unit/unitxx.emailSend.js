// There are three integrations we want to test
// Account Creation
// Account Modification
// Password Reset

// For now we are focusing on unit tests

// emailRespond class
// 1. constructor tests
// --> templateType (valid)
// --> templateType (invalid)



describe('Unit Test XX - emailResond Class Construction', () => {
    test('Invalid TemplateType', () => {
        // pass
    });

    test('Absent TemplateType', () => {
        //pass
    });

    test('Valid TemplateType (Account Creation)', () => {
        //pass
    });

    test('Valid TemplateType (Account Modification)', () => {
        //pass
    });

    test('Valid TemplateType (Password Reset)', () => {
        //pass
    });

});

describe('Unit Test XX - emailResond Class (template replacement validate)', () => {
    test('Missing replacementObject', () => {
        //pass
    });

    test('Overexceeded replacement argument length', () => {
        //pass
    });

    test('Insufficient replacement argument length', () => {
        //pass
    });

    test('Correct replacement argument length + included invalid attribute', () => {
        //pass
    });

    test('Correct replacement argument length + all invalid attribute', () => {
        //pass
    });

    test('Correct replacement argument length + Correct attributes + Incorrect value type', () => {
        //pass
    });

    test('Correct replacement argument length + Correct attributes + Incorrect values\' types', () => {
        //pass
    });

    test('Valid replacementObject', () => {
        //pass
    });

});

describe('Unit Test XX - emailResond Class (template replacement execute)', () => {
    test('Template Replacement Success (Account Creation)', () => {
        //pass
    });

    test('Template Replacement Success (Account Modification)', () => {
        //pass
    });

    test('Template Replacement Success (Password Reset)', () => {
        //pass
    });
});
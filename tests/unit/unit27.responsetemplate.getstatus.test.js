const ResponseTemplate = require('../../classes/responsetemplate');

describe('Unit Test 28 - ResponseTemplate GetResponse', () => {
    test('Class 1: null error', () => {
        let param1 = {
            out_name: 'name',
            field: 'fieldname',
        };
        let param2 = {
            out_name: 'Name',
            field: 'fieldname2',
        };

        let inputError = null;

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputError);

        expect(result).toMatchObject(200);
    });

    test('Class 2: not null error', () => {
        let param1 = {
            out_name: 'name',
            field: 'fieldname',
        };
        let param2 = {
            out_name: 'Name',
            field: 'fieldname2',
        };

        let inputError = 'notNull';

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputError);

        expect(result).toBe(500);
    });

    test('Class 3: AbsentArgumentError', () => {
        let param1 = {
            out_name: 'name',
            field: 'fieldname',
        };
        let param2 = {
            out_name: 'Name',
            field: 'fieldname2',
        };

        let inputError = 'AbsentArgumentError';

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputError);

        expect(result).toBe(400);
    });
});

const { AbsentArgumentError } = require('../../classes/errors');
const ResponseTemplate = require('../../classes/responsetemplate');

describe('Unit Test 27 - ResponseTemplate GetStatus', () => {
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
        let result = template.getStatus(inputError);

        expect(result).toBe(200);
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
        let result = template.getStatus(inputError);

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

        let inputError = new AbsentArgumentError('Test error');

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getStatus(inputError);

        expect(result).toBe(400);
    });

    // consider having Class 3 be for a default mapping, and Class 4 for a mapping provided by errorMap
});

const ResponseTemplate = require('../../classes/responsetemplate');

describe('Unit Test 28 - ResponseTemplate GetResponse', () => {
    test('Class 1: out_name + field', () => {
        let param1 = {
            out_name: 'name',
            field: 'fieldname',
        };
        let param2 = {
            out_name: 'Name',
            field: 'fieldname2',
        };

        let inputArray = ['field'];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            outName: value,
        });
    });

    test('Class 2: out_name + rows_with_fields', () => {
        let param1 = {
            out_name: 'name',
            rows_with_fields: ['fieldnames', 'fieldNames'],
        };
        let param2 = {
            out_name: 'Name',
            rows_with_fields: ['fieldnames2', 'fieldNames2'],
        };

        let inputArray = ['field1', 'field2'];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            outName: [value],
        });
    });

    test('Class 3: out_name + one_row_with_fields', () => {
        let param1 = {
            out_name: 'name',
            one_row_with_fields: {field1:'field', field2:'field2'},
        };
        let param2 = {
            out_name: 'Name',
            one_row_with_fields: {field1:'Field', field2:'Field2'},
        };

        let inputArray = [{field1:'field', field2:'field2'}];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            outName: [value],
        });
    });

});



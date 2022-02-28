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

        let inputArray = [[{'fieldname': 'field'}]];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            'name': 'field',
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

        let inputArray = [[{'fieldnames': 'field1', 'fieldNames': 'field2'}]];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            'name': [{'fieldnames': 'field1', 'fieldNames': 'field2'}],
        });
    });

    test('Class 3: out_name + one_row_with_fields', () => {
        let param1 = {
            out_name: 'name',
            // one_row_with_fields: {field1:'field', field2:'field2'},
            one_row_with_fields: ['fieldnames', 'fieldNames'],
        };
        let param2 = {
            out_name: 'Name',
            // one_row_with_fields: {field1:'Field', field2:'Field2'},
            one_row_with_fields: ['fieldnames2', 'fieldNames2'],
        };

        let inputArray = [[{'fieldnames': 'field1', 'fieldNames': 'field2'}]];

        let template = new ResponseTemplate([param1, param2]);
        let result = template.getResponse(inputArray);

        expect(result).toMatchObject({
            'name': {'fieldnames': 'field1', 'fieldNames': 'field2'},
        });
    });

    // consider adding some more possibilites to each one:
    // - what happens if the specified field doesn't exist?
    // - what happens if there are multiple fields which match?
    // - what happens if there are no fields which match?
    // try running `jest unit --coverage` to see which lines/branches aren't tested
});

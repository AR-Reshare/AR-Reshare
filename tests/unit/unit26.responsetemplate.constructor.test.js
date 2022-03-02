// const { TemplateError } = require('../../classes/errors');
// const ResponseTemplate = require('../../classes/responsetemplate');
const { TemplateError } = require('error.js');
const ResponseTemplate = require('responsetemplate.js');

describe('Unit Test 26 - ResponseTemplate constructor', () => {
    
    test('Class 1: all values specified and valid', () => {
        let param1 = {
            out_name: 'test',
            field: 'fieldname',
        };
        let template;

        expect(() => {template = new ResponseTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
    });

    test('Class 2: multiple parameters', () => {
        let param1 = {
            out_name: 'test',
            field: 'fieldname',
        };
        let param2 = {
            out_name: 'test1',
            field: 'fieldname1',
        };
        let template;

        expect(() => {template = new ResponseTemplate([param1, param2])}).not.toThrow();
        expect(template.params).toHaveLength(2);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[1]).toMatchObject(param2);
    });

    test('Class 3: out_name not provided', () => {
        let param1 = {
            field: 'fieldname',
        };
        let template; 

        expect(() => {template = new ResponseTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('out_name');
    });

    test('Class 4: out_name not a string', () => {
        let param1 = {
            out_name: 5,
            field: 'fieldname',
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 5: out_name is empty', () => {
        let param1 = {
            out_name: '',
            field: 'fieldname',
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 6: field not provided', () => {
        let param1 = {
            out_name:'test',
        };
        let template;

        expect(() => {template = new ResponseTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('field');
    });
    
    test('Class 7: field not a string', () => {
        let param1 = {
            out_name: 'test',
            field: 5 ,
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 8: field is empty', () => {
        let param1 = {
            out_name: 'test',
            field: '',
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 9 : rows_with_fields not provided', () => {
        let param1 = {
            out_name:'test',
        };
        let template;

        expect(() => {template = new ResponseTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('rows_with_fields');
    });
    
    test('Class 10: rows_with_fields is a string but is empty', () => {
        let param1 = {
            out_name: 'test',
            rows_with_fields: '',
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 11: rows_with_fields is an array but is empty', () => {
        let param1 = {
            out_name: 'test',
            rows_with_fields: [],
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 12: rows_with_fields is an array but contains non-string field name', () => {
        let param1 = {
            out_name:'test',
            rows_with_fields: [fieldnames, fieldnames1],
        };
        let template;

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 13: rows_with_fields is an array but contains empty field name', () => {
        let param1 = {
            out_name: 'test',
            rows_with_fields: ['',''],
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 14: rows_with_fields is not string or array', () => {
        let param1 = {
            out_name: 'test',
            rows_with_fields: 5,
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 15: one_row_with_fields not provided', () => {
        let param1 = {
            out_name:'test',
            field:'fieldname',
        };
        let template;

        expect(() => {template = new ResponseTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('one_row_with_fields');
    });

    test('Class 16: one_row_with_fields is a string but is empty', () => {
        let param1 = {
            out_name: 'test',
            one_row_with_fields: '',
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 17: one_row_with_fields is an array but is empty', () => {
        let param1 = {
            out_name: 'test',
            one_row_with_fields: [],
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 18: one_row_with_fields is an array but contains non-string field name', () => {
        let param1 = {
            out_name:'test',
            field:'fieldname',
            one_row_with_fields: [fieldnames2, fieldnames3],
        };
        let template;

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 19: one_row_with_fields is an array but contains empty field name', () => {
        let param1 = {
            out_name: 'test',
            one_row_with_fields: ['', ''],
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 20: one_row_with_fields is not string or array', () => {
        let param1 = {
            out_name: 'test',
            one_row_with_fields: 5,
        };

        expect(() => new ResponseTemplate([param1])).toThrow(TemplateError);
    });

});
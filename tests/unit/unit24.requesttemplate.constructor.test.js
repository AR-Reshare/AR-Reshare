const { TemplateError } = require('../../classes/errors');
const RequestTemplate = require('../../classes/requesttemplate');

describe('Unit Test 24 - RequestTemplate constructor', () => {
    test('Class 1: all values specified and valid', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
    });

    test('Class 2: multiple parameters', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };
        let param2 = {
            in_name: 'testy',
            out_name: 'test2',
            required: false,
            conditions: [a=>a>=5],
            sanitise: a=>a-1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1, param2])}).not.toThrow();
        expect(template.params).toHaveLength(2);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[1]).toMatchObject(param2);
    });

    test('Class 3: in_name not string', () => {
        let param1 = {
            in_name: 5,
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 4: in_name empty', () => {
        let param1 = {
            in_name: '',
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 5: in_name not present', () => {
        let param1 = {
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 6: out_name not string', () => {
        let param1 = {
            in_name: 'test',
            out_name: 5,
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 7: out_name empty', () => {
        let param1 = {
            in_name: 'test',
            out_name: '',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 8: out_name not present', () => {
        let param1 = {
            in_name: 'test',
            required: true,
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('out_name', param1.in_name);
    });

    test('Class 9: required not boolean', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: 'true',
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 10: required not present', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            conditions: [a=>a<5],
            sanitise: a=>a+1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('required', false);
    });

    test('Class 11: conditions not array', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: 5,
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 12: conditions empty', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [],
            sanitise: a=>a+1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
    });

    test('Class 13: conditions contains non-callable', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [5],
            sanitise: a=>a+1,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });

    test('Class 14: conditions not present', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            sanitise: a=>a+1,
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('conditions', []);
    });

    test('Class 15: sanitise not callable', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
            sanitise: 5,
        };

        expect(() => new RequestTemplate([param1])).toThrow(TemplateError);
    });
    
    test('Class 16: sanitise not present', () => {
        let param1 = {
            in_name: 'test',
            out_name: 'test1',
            required: true,
            conditions: [a=>a<5],
        };
        let template;

        expect(() => {template = new RequestTemplate([param1])}).not.toThrow();
        expect(template.params).toHaveLength(1);
        expect(template.params[0]).toMatchObject(param1);
        expect(template.params[0]).toHaveProperty('sanitise');
        expect(template.params[0].sanitise('anything')).toBe('anything');
    });
});

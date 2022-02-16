const SQLTemplate = require('../../classes/sqltemplate');
const {QueryTemplateError} = require('../../classes/errors');

describe('Unit Test 21 - SQLTemplate.constructor', () => {
    test('Class 1: valid query', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
            },
            test2: {
                text: 'SELECT userid FROM Account WHERE username = $1',
                values: [{
                    from_input: 'username',
                }],
            },
        };
        let order = ['test1', 'test2'];

        let template = new SQLTemplate(queries, order);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', false);
    });

    test('Class 2: valid query with options', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test1', 'test2'];
        let options = {
            error_on_empty_response: true,
            error_on_empty_transaction: true,
            drop_from_results: ['test1'],
        };

        let template = new SQLTemplate(queries, order, options);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', true);
        expect(template).toHaveProperty('errorOnEmptyTransaction', true);
        expect(template).toHaveProperty('dropFromResults', options.drop_from_results);
    });

    test('Class 3: no queries, no error', () => {
        let queries = {};
        let order = [];

        let template = new SQLTemplate(queries, order);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', false);
    });

    test('Class 4: no queries, with error', () => {
        let queries = {};
        let order = [];
        let options = {error_on_empty_transaction: true};

        expect(() => new SQLTemplate(queries, order, options)).toThrow(QueryTemplateError);
    });

    test('Class 5: drop all queries from result, no error', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test1', 'test2'];
        let options = {
            drop_from_results: ['test1', 'test2'],
        };

        let template = new SQLTemplate(queries, order, options);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', options.drop_from_results);
    });

    test('Class 6: drop all queries from result, with error', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test1', 'test2'];
        let options = {
            error_on_empty_response: true,
            drop_from_results: ['test1', 'test2'],
        };

        expect(() =>new SQLTemplate(queries, order, options)).toThrow(QueryTemplateError);
    });

    test('Class 7: drop non-existant query from result', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test'];
        let options = {
            drop_from_results: ['test1'],
        };

        expect(() =>new SQLTemplate(queries, order, options)).toThrow(QueryTemplateError);
    });

    test('Class 8: non-existant query', () => {
        let queries = {
            test1: {
                text: 'w/e',
            },
        };
        let order = ['test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 9: query with no text', () => {
        let queries = {
            test: {
                values: [],
            },
        };
        let order = ['test'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 10: query with callable parameter', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE username = $1',
                values: [(inp, acc, qs) => {
                    return inp['name'+acc.toString()];
                }],
            },
        };
        let order = ['test'];

        let template = new SQLTemplate(queries, order);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', false);
    });

    test('Class 11: query with both from_input and from_query in single value', () => {
        let queries = {
            test1: {
                text: 'w/e',
            },
            test2: {
                text: 'w/e',
                values: [{
                    from_input: 'test',
                    from_query: ['test2', 'userid'],
                }],
            },
        };
        let order = ['test1', 'test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 12: query with value neither from_input nor from_query', () => {
        let queries = {
            test: {
                text: 'w/e',
                values: [{
                    invalid: 'test',
                }],
            },
        };
        let order = ['test'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 13: query with valid from_input', () => {
        let queries = {
            test: {
                text: 'SELECT username FROM Account WHERE email = $1',
                values: [{
                    from_input: 'email',
                }],
            },
        };
        let order = ['test'];

        let template = new SQLTemplate(queries, order);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', false);
    });

    test('Class 14: query with valid backreference', () => {
        let queries = {
            test1: {
                text: 'SELECT userid FROM Account WHERE email = \'ronnieo@yahoo.com\'',
            },
            test2: {
                text: 'SELECT listing FROM Listing WHERE contributorid = $1',
                values: [{
                    from_query: ['test1', 'userid'],
                }],
            },
        };
        let order = ['test1', 'test2'];

        let template = new SQLTemplate(queries, order);

        expect(template).toHaveProperty('queryDict', queries);
        expect(template).toHaveProperty('order', order);
        expect(template).toHaveProperty('errorOnEmptyResponse', false);
        expect(template).toHaveProperty('errorOnEmptyTransaction', false);
        expect(template).toHaveProperty('dropFromResults', false);
    });

    test('Class 15: backreference empty', () => {
        let queries = {
            test1: {
                text: 'w/e',
            },
            test2: {
                text: 'w/e',
                values: [{
                    from_query: null,
                }],
            },
        };
        let order = ['test1', 'test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 16: backreference doesn\'t specify field', () => {
        let queries = {
            test1: {
                text: 'w/e',
            },
            test2: {
                text: 'w/e',
                values: [{
                    from_query: ['test1'],
                }],
            },
        };
        let order = ['test1', 'test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 17: backreferencing future query', () => {
        let queries = {
            test1: {
                text: 'w/e',
                values: [{
                    from_query: ['test2', 'userid'],
                }],
            },
            test2: {
                text: 'w/e',
            },
        };
        let order = ['test1', 'test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 18: backreferencing non-existant query', () => {
        let queries = {
            test1: {
                text: 'w/e',
            },
            test2: {
                text: 'w/e',
                values: [{
                    from_query: ['invalid', 'userid'],
                }],
            },
        };
        let order = ['test1', 'test2'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 19: backreferencing self', () => {
        let queries = {
            test: {
                text: 'w/e',
                values: [{
                    from_query: ['test', 'userid'],
                }],
            },
        };
        let order = ['test'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });

    test('Class 20: query with unparsable value', () => {
        let queries = {
            test: {
                text: 'w/e',
                values: [5],
            },
        };
        let order = ['test'];

        expect(() => new SQLTemplate(queries, order)).toThrow(QueryTemplateError);
    });
});

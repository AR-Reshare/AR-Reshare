const { EmptyResponseError } = require('../../classes/errors');
const SQLTemplate = require('../../classes/sqltemplate');

describe('Unit Test 23 - SQLTemplate.prepareResults', () => {
    test('Class 1: no changes', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
            test3: {
                text: 'SELECT NOW() AS next',
            },
        };
        let order = ['test1', 'test2', 'test3'];
        let queryNames = ['test1', 'test2', 'test3'];
        let db_response = [[{then: 123}], [{now: 456}], [{next: 789}]];

        let template = new SQLTemplate(queries, order);
        let result = template.prepareResults(queryNames, db_response);

        expect(result).toStrictEqual(db_response);
    });

    test('Class 2: drop single', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
            test3: {
                text: 'SELECT NOW() AS next',
            },
        };
        let order = ['test1', 'test2', 'test3'];
        let options = {
            drop_from_results: ['test2'],
        };
        let queryNames = ['test1', 'test2', 'test3'];
        let db_response = [[{then: 123}], [{now: 456}], [{next: 789}]];

        let template = new SQLTemplate(queries, order, options);
        let result = template.prepareResults(queryNames, db_response);

        expect(result).toStrictEqual([[{then: 123}], [{next: 789}]]);
    });

    test('Class 3: drop multiple', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
                times: () => 2,
            },
            test2: {
                text: 'SELECT NOW() AS next',
            },
        };
        let order = ['test1', 'test2'];
        let options = {
            drop_from_results: ['test1'],
        };
        let queryNames = ['test1', 'test1', 'test2'];
        let db_response = [[{now: 123}], [{now: 456}], [{next: 789}]];

        let template = new SQLTemplate(queries, order, options);
        let result = template.prepareResults(queryNames, db_response);

        expect(result).toStrictEqual([[{next: 789}]]);
    });

    test('Class 4: drop all, no error', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
                times: () => 2,
            },
            test2: {
                text: 'SELECT NOW() AS next',
            },
        };
        let order = ['test1', 'test2'];
        let options = {
            drop_from_results: ['test1', 'test2'],
        };
        let queryNames = ['test1', 'test1', 'test2'];
        let db_response = [[{now: 123}], [{now: 456}], [{next: 789}]];

        let template = new SQLTemplate(queries, order, options);
        let result = template.prepareResults(queryNames, db_response);

        expect(result).toStrictEqual([]);
    });

    test('Class 5: no results, no error', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test'];
        let queryNames = ['test'];
        let db_response = [[]];

        let template = new SQLTemplate(queries, order);
        let result = template.prepareResults(queryNames, db_response);

        expect(result).toStrictEqual([[]]);
    });

    
    test('Class 6: no results, with error', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test'];
        let options = {
            error_on_empty_response: true,
        }
        let queryNames = ['test'];
        let db_response = [[]];

        let template = new SQLTemplate(queries, order, options);
        expect(() => template.prepareResults(queryNames, db_response)).toThrow(EmptyResponseError);
    });

    test('Class 7: drop all but empty, with error', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
                times: () => 2,
            },
            test2: {
                text: 'SELECT NOW() AS next',
            },
            test3: {
                text: 'SELECT nothing',
            },
        };
        let order = ['test1', 'test2', 'test3'];
        let options = {
            error_on_empty_response: true,
            drop_from_results: ['test1', 'test2'],
        };
        let queryNames = ['test1', 'test1', 'test2', 'test3'];
        let db_response = [[{now: 123}], [{now: 456}], [{next: 789}], []];

        let template = new SQLTemplate(queries, order, options);
        expect(() => template.prepareResults(queryNames, db_response)).toThrow(EmptyResponseError);
    });
});

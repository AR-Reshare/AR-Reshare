const {SQLTemplate} = require('../../schemas/sql-templates');

describe('Unit Test 21 - SQLTemplate.Build', () => {
    test('Class 1: immediate query', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test'];
        let inputObject = {};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).not.toHaveProperty('values');
    });

    test('Class 2: multiple immediate queries', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS then',
            },
            test2: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test1', 'test2'];
        let inputObject = {};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('text', queries.test1.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(result[1]).toHaveProperty('text', queries.test2.text);
        expect(result[1]).not.toHaveProperty('values');
    })

    test('Class 3: query with accountID parameter', () => {
        let queries = {
            test: {
                text: 'SELECT username FROM Account WHERE accountid = $1',
                values: ['accountID'],
            },
        };
        let order = ['test'];
        let inputObject = {};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [42]);
    });

    test('Class 4: query with parameter from input', () => {
        let queries = {
            test: {
                text: 'SELECT username FROM Account WHERE email = $1',
                values: [{
                    from_input: 'email',
                }],
            },
        };
        let order = ['test'];
        let inputObject = {email: 'ronnieo@yahoo.com'};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [inputObject.email]);
    });

    // Class 5: query with backreference parameter
    test('Class 5: query with backreference parameter', () => {
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
        let inputObject = {};
        let accountID = 42;

        let partResults = [[
            {userid: 13},
        ]];

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('text', queries.test1.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(result[1]).toHaveProperty('text', queries.test2.text);
        expect(result[1]).toHaveProperty('values');
        expect(result[1].values).toHaveLength(1);
        expect(result[1].values[0](partResults)).toBe(13);
    });

    // Class 6: query with conditional execution

    // Class 7: query with multiple execution

    // Class 8: query with backreference parameter to multiple queries (i.e. one of these queries per one of the other queries)

    // Class 9: query with arbitrary callable parameter

    // Class 10+: fail states
});

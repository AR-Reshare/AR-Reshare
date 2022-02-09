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

    test('Class 6a: query with conditional execution (positive)', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                condition: (inp, acc) => 'dostuff' in inp,
            },
        };
        let order = ['test'];
        let inputObject = {dostuff: ''};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).not.toHaveProperty('values');
    });

    test('Class 6b: query with conditional execution (negative)', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                condition: (inp, acc) => 'dostuff' in inp,
            },
        };
        let order = ['test'];
        let inputObject = {dont_dostuff: ''};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toStrictEqual([]);
    });

    test('Class 7: query with multiple execution', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                times: (inp, acc) => inp['times'],
            },
        };
        let order = ['test'];
        let inputObject = {times: 5};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(5);
        for (let i=0; i<inputObject.times; i++) {
            expect(result[i]).toHaveProperty('text', queries.test.text);
            expect(result[i]).not.toHaveProperty('values');
        }
    });

    test('Class 8: queries with multiple backreference parameter', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
                times: (inp, acc) => inp['times'],
            },
            test2: {
                text: 'SELECT userid FROM Account WHERE creationdate = $1',
                times: (inp, acc) => inp['times'],
                values: [{
                    from_query: ['test1', 'now'],
                }],
            },
        };
        let order = ['test1', 'test2'];
        let inputObject = {times: 5};
        let accountID = 42;

        let partResults = [
            [{now: 5}],
            [{now: 6}],
            [{now: 7}],
            [{now: 8}],
            [{now: 9}],
        ];

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(10);
        for (let i=0; i<inputObject.times; i++) {
            expect(result[i]).toHaveProperty('text', queries.test1.text);
            expect(result[i]).not.toHaveProperty('values');
        }
        for (let i=5; i<inputObject.times*2; i++) {
            expect(result[i]).toHaveProperty('text', queries.test2.text);
            expect(result[i]).toHaveProperty('values');
            expect(result[i].values[0](partResults)).toBe(i);
        }
    });

    test('Class 9: query with arbitrary callable parameter', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE username = $1',
                values: [(inp, acc, qs) => {
                    return inp['name'+acc.toString()];
                }],
            },
        };
        let order = ['test'];
        let inputObject = {name42: 'Ronnie Omelettes', name12: 'Gary Cheeseman'};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [inputObject.name42]);
    });

    test('Class 10: no queries', () => {
        let queries = {};
        let order = [];
        let inputObject = {};
        let accountID = 42;

        let template = new SQLTemplate(queries, order);
        let result = template.build(inputObject, accountID);

        expect(result).toStrictEqual([]);
    });

    // Class 11: query doesn't exist
    // Class 12: query with no text
    // Class 13: query with values containing string (not accountID)
    // Class 14: query where value object doesn't contain from_input or from_query
    // Class 15: query with from_input where key doesn't exist
    // Class 16: backreferencing non-existant query
    // Class 17: backreferencing future query
    // Class 18: backreferencing no query
    // Class 19: backreferencing no field
    // Class 20: query with exceptional condition
    // Class 21: query with exceptional times
    // Class 22: query with non-numeric times
    // Class 23: query with non-integer times
    // Class 24: query with negative times
    // Class 25: query with multiple backreference but different number of times
    // Class 26: query with exceptional arbitrary callable parameter
});

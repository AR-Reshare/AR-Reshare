const SQLTemplate = require('../../classes/sqltemplate');
const {QueryConstructionError, EmptyQueryError} = require('../../classes/errors');
const { expect } = require('@jest/globals');

describe('Unit Test 22 - SQLTemplate.build', () => {
    test('Class 1: immediate query', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(names).toStrictEqual(['test']);
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

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('text', queries.test1.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(result[1]).toHaveProperty('text', queries.test2.text);
        expect(result[1]).not.toHaveProperty('values');
        expect(names).toStrictEqual(['test1', 'test2']);
    })

    test('Class 3: query with parameter from input', () => {
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

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [inputObject.email]);
        expect(names).toStrictEqual(['test']);
    });

    test('Class 4: query with backreference parameter', () => {
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

        let partResults = [[
            {userid: 13},
        ]];

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('text', queries.test1.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(result[1]).toHaveProperty('text', queries.test2.text);
        expect(result[1]).toHaveProperty('values');
        expect(result[1].values).toHaveLength(1);
        expect(result[1].values[0](partResults)).toBe(13);
        expect(names).toStrictEqual(['test1', 'test2']);
    });

    test('Class 5: query with conditional execution (positive)', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                condition: inp => 'dostuff' in inp,
            },
        };
        let order = ['test'];
        let inputObject = {dostuff: ''};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).not.toHaveProperty('values');
        expect(names).toStrictEqual(['test']);
    });

    test('Class 6: query with conditional execution (negative)', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                condition: inp => 'dostuff' in inp,
            },
        };
        let order = ['test'];
        let inputObject = {dont_dostuff: ''};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toStrictEqual([]);
        expect(names).toStrictEqual([]);
    });

    test('Class 7: query with multiple execution', () => {
        let queries = {
            test: {
                text: 'SELECT NOW() AS now',
                times: inp => inp['times'],
            },
        };
        let order = ['test'];
        let inputObject = {times: 5};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(5);
        for (let i=0; i<inputObject.times; i++) {
            expect(result[i]).toHaveProperty('text', queries.test.text);
            expect(result[i]).not.toHaveProperty('values');
        }
        expect(names).toStrictEqual(['test', 'test', 'test', 'test', 'test']);
    });

    test('Class 8: queries with multiple from_input parameter', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE username = $1',
                times: inp => inp['username'].length,
                values: [{
                    from_input: 'username',
                }],
            },
        };
        let order = ['test'];
        let inputObject = {username: ['Testy McTestface', 'Kevin McTestface', 'Ronnie Omelettes']};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(3);
        for (let i=0; i<3; i++) {
            expect(result[i]).toHaveProperty('text', queries.test.text);
            expect(result[i]).toHaveProperty('values', [inputObject.username[i]]);
        }
        expect(names).toStrictEqual(['test', 'test', 'test']);
    });

    test('Class 9: queries with multiple backreference parameter', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
                times: inp => inp['times'],
            },
            test2: {
                text: 'SELECT NOW() AS next',
            },
            test3: {
                text: 'SELECT userid FROM Account WHERE creationdate = $1',
                times: inp => inp['times'],
                values: [{
                    from_query: ['test1', 'now'],
                }],
            },
        };
        let order = ['test1', 'test2', 'test3'];
        let inputObject = {times: 5};

        let partResults = [
            [{now: 6}],
            [{now: 7}],
            [{now: 8}],
            [{now: 9}],
            [{now: 10}],
            [{next: 11}],
        ];

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(11);
        for (let i=0; i<5; i++) {
            expect(result[i]).toHaveProperty('text', queries.test1.text);
            expect(result[i]).not.toHaveProperty('values');
        }
        for (let i=6; i<11; i++) {
            expect(result[i]).toHaveProperty('text', queries.test3.text);
            expect(result[i]).toHaveProperty('values');
            expect(result[i].values[0](partResults)).toBe(i);
        }
        expect(names).toStrictEqual([
            'test1', 'test1', 'test1', 'test1', 'test1',
            'test2',
            'test3', 'test3', 'test3', 'test3', 'test3'
        ]);
    });

    test('Class 10: query with arbitrary callable parameter', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE username = $1',
                values: [(inp, qs) => {
                    return inp['name' + 42];
                }],
            },
        };
        let order = ['test'];
        let inputObject = {name42: 'Ronnie Omelettes', name12: 'Gary Cheeseman'};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [inputObject.name42]);
        expect(names).toStrictEqual(['test']);
    });

    test('Class 11: no queries', () => {
        let queries = {};
        let order = [];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toStrictEqual([]);
        expect(names).toStrictEqual([]);
    });

    test('Class 12: query with from_input where key doesn\'t exist', () => {
        let queries = {
            test: {
                text: 'w/e',
                values: [{
                    from_input: 'invalid',
                }],
            },
        };
        let order = ['test'];
        let inputObject = {valid: 5};

        let template = new SQLTemplate(queries, order);
        let [names, result] = template.build(inputObject);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('text', queries.test.text);
        expect(result[0]).toHaveProperty('values', [null]);
        expect(names).toStrictEqual(['test']);
    });

    test('Class 13: query with exceptional condition', () => {
        let queries = {
            test: {
                text: 'w/e',
                condition: inp => {throw new Error('oopsie woopsie');},
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 14: query with exceptional times', () => {
        let queries = {
            test: {
                text: 'w/e',
                times: inp => {throw new Error('oopsie woopsie');},
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 15: query with non-numeric times', () => {
        let queries = {
            test: {
                text: 'w/e',
                times: inp => "invalid",
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 16: query with non-integer times', () => {
        let queries = {
            test: {
                text: 'w/e',
                times: inp => 2.5,
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 17: query with negative times', () => {
        let queries = {
            test: {
                text: 'w/e',
                times: inp => -1,
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 18: query with multiple backreference but different number of times', () => {
        let queries = {
            test1: {
                text: 'w/e',
                times: inp => 5,
            },
            test2: {
                text: 'w/e',
                times: inp => 4,
                values: [{
                    from_query: ['test1', 'something'],
                }],
            },
        };
        let order = ['test1', 'test2'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 19: query with exceptional arbitrary callable parameter', () => {
        let queries = {
            test: {
                text: 'w/e',
                values: [() => {throw new Error('oopsie woopsie');}],
            },
        };
        let order = ['test'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 20: query with backreference to conditional-negative query', () => {
        let queries = {
            test1: {
                text: 'w/e',
                condition: inp => false,
            },
            test2: {
                text: 'w/e',
                values: [{
                    from_query: ['test1', 'something'],
                }],
            },
        };
        let order = ['test1', 'test2'];
        let inputObject = {};

        let template = new SQLTemplate(queries, order);
        expect(() => template.build(inputObject)).toThrow(QueryConstructionError);
    });

    test('Class 21: no queries with error on empty transaction', () => {
        let queries = {
            test: {
                text: 'w/e',
                condition: inp => false,
            },
        };
        let order = ['test'];
        let options = {error_on_empty_transaction: true};
        let inputObject = {};

        let template = new SQLTemplate(queries, order, options);
        expect(() => template.build(inputObject)).toThrow(EmptyQueryError);
    });
});

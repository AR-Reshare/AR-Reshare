const Pipeline = require('../../classes/pipeline');
const Database = require('../../classes/database');
const SQLTemplate = require('../../classes/sqltemplate');
const { QueryConstructionError, QueryExecutionError, EmptyResponseError } = require('../../classes/errors');
const creds = require('../../secrets/dbconnection.json')['test'];

let pipe, db;

beforeAll(() => {
    db = new Database(creds);
    pipe = new Pipeline(db);
});

afterAll(() => {
    db.end();
});

describe('Integration Test 14 - Pipeline.Store', () => {
    test('Class 1: single reading query', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'',
            },
        };
        let order = ['test'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 2: single writing query', () => {
        let queries = {
            test: {
                text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int14c2@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\')',
            },
        };
        let order = ['test'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(0);

            return db.simpleQuery('SELECT userid FROM Account WHERE email = \'int14c2@gmail.com\'');
        }).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid');
        });
    });

    test('Class 3: multiple queries', () => {
        let queries = {
            test1: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'',
            },
            test2: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Ronnie Omelettes\'',
            },
        };
        let order = ['test1', 'test2'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('userid', 3);
        });
    });

    test('Class 4: parameterised query with input object', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = $1',
                values: [
                    {from_input: 'username'},
                ],
            },
        };
        let order = ['test'];
        let formatObject = {username: 'Testy McTestface'};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 5: parameterised query with callable', () => {
        let queries = {
            test1: {
                text: 'SELECT NOW() AS now',
            },
            test2: {
                text: 'SELECT userid FROM Account WHERE fullname = $1',
                values: [
                    (inp, qs) => qs.length === 0 || inp['username'],
                ],
            },
        };
        let order = ['test1', 'test2'];
        let formatObject = {username: 'Testy McTestface'};

        let template = new SQLTemplate(queries, order, {drop_from_results: ['test1']});
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 6: parameterised query with backreference', () => {
        let queries = {
            test1: {
                text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int14c6@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\') RETURNING userid',
            },
            test2: {
                text: 'SELECT fullname FROM Account WHERE userid = $1',
                values: [
                    {from_query: ['test1', 'userid']},
                ],
            },
        };
        let order = ['test1', 'test2'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid');
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('fullname', 'Kevin McTestface');
        });
    });

    test('Class 7: conditional query', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'',
                condition: inp => formatObject['do_things'],
            },
        };
        let order = ['test'];
        let formatObject = {do_things: false};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(0);
        });
    });

    test('Class 8: multiple-execution query', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'',
                times: inp => formatObject['do_things'],
            },
        };
        let order = ['test'];
        let formatObject = {do_things: 5};

        let template = new SQLTemplate(queries, order);
        return pipe.Store(template, formatObject).then(res => {
            expect(res).toHaveLength(5);
            for (let i=0; i<5; i++) {
                expect(res[i]).toHaveLength(1);
                expect(res[i][0]).toHaveProperty('userid', 1);
            }
        });
    });

    test('Class 9: unbuildable query', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = $1',
                values: [
                    () => {throw new Error()},
                ],
            },
        };
        let order = ['test'];
        let formatObject = {somekeys: 'values'};

        let template = new SQLTemplate(queries, order);
        return expect(pipe.Store(template, formatObject)).rejects.toBeInstanceOf(QueryConstructionError);
    });

    test('Class 10: exceptional, simple query', () => {
        let queries = {
            test: {
                text: 'AMRGJBE userid FROM Account WHERE fullname = \'Testy McTestface\'',
            },
        };
        let order = ['test'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return expect(pipe.Store(template, formatObject)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 11: exceptional, complex query', () => {
        let queries = {
            test1: {
                text: 'AMRGJBE userid FROM Account WHERE fullname = \'Testy McTestface\'',
            },
            test2: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'',
            },
        };
        let order = ['test1', 'test2'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order);
        return expect(pipe.Store(template, formatObject)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 12: query with no results, where error_on_empty_response is true', () => {
        let queries = {
            test: {
                text: 'SELECT userid FROM Account WHERE fullname = \'Nobody\'',
            },
        };
        let order = ['test'];
        let formatObject = {};

        let template = new SQLTemplate(queries, order, {error_on_empty_response: true});
        return expect(pipe.Store(template, formatObject)).rejects.toBeInstanceOf(EmptyResponseError);
    });
});

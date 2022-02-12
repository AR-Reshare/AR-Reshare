const Database = require('../../classes/database');
const {Pool} = require('pg');
const { QueryExecutionError, DBClientNotAvailableError, QueryConstructionError } = require('../../classes/errors');

// test values
const mockQueryText = 'MOCK query ON Database';
const mockQueryText2 = 'MOCK anotherQuery ON Database';
const mockQueryText3 = 'MOCK query ON Database WHERE Params=$1';
const mockQueryValues3 = [true];

// mock pg.Client.query
const mockQueryInner = jest.fn();
const mockQueryInner2 = jest.fn();
const mockQuery = jest.fn().mockImplementation((query, values=[]) => {
    return new Promise((resolve, reject) => {
        let q = query.text || query;
        let val;
        if (q == 'BEGIN' || q == 'ROLLBACK' || q == 'COMMIT') {
            resolve({});
            return;
        } else if (q == mockQueryText || q == mockQueryText3) {
            val = mockQueryInner();
        } else if (q == mockQueryText2) {
            val = mockQueryInner2();
        }
        if (val instanceof Error) {
            reject(val);
        } else {
            resolve(val);
        }
    });
});

// mock pg.Client.release
const mockRelease = jest.fn();

// mock pg.Pool.connect
const mockConnectInner = jest.fn().mockImplementation(() => {
    return {
        query: mockQuery,
        release: mockRelease,
    };
});
const mockConnect = jest.fn().mockImplementation(() => {
    return new Promise((resolve, reject) => {
        let val = mockConnectInner();
        if (val instanceof Error) {
            reject(val);
        } else {
            resolve(val);
        }
    });
});

// mock pg
jest.mock('pg', () => {
    return {
        Pool: jest.fn().mockImplementation(() => {
            return {
                connect: mockConnect,
                end: jest.fn(),
            };
        }),
    };
});

let db;

const testObject = {
    rows: [
        {'fullname': 'Ronnie Omelettes', 'email': 'ronnieo@yahoo.com'},
        {'fullname': 'Gary Cheeseman', 'email': 'gary.cheeseman@aol.com'},
    ],
    fields: [
        {'name': 'fullname', 'dataTypeID': 'who cares nobody uses this'},
        {'name': 'email', 'dataTypeID': 'a type'},
    ],
    command: 'SELECT',
    rowCount: 2,
};
const testObject2 = {
    rows: [
        {'userid': 12345},
    ],
    fields: [
        {'name': 'userid', 'dataTypeID': 'int'},
    ],
    command: 'INSERT',
    rowCount: 1,
};

beforeAll(() => {
    db = new Database({});
});

afterAll(() => {
    db.end();
});

beforeEach(() => {
    Pool.mockClear();
    mockConnect.mockClear();
    mockQuery.mockClear();
    mockRelease.mockClear();
});

describe('Unit Test 20 - Database.complexQuery', () => {
    test('Class 1: single, non-paramaterised query', () => {
        // init test values
        let q0 = mockQueryText;
        let cmd0 = {text: q0};
        let cmds = [cmd0];

        // seed mocks
        mockQueryInner.mockImplementation(() => testObject);

        // execute
        return db.complexQuery(cmds).then(res => {

            // assert
            expect(mockQuery).toBeCalledTimes(3);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, 'COMMIT');
            expect(mockRelease).toBeCalledTimes(1);
            expect(res).toHaveLength(1);
            expect(res[0]).toBe(testObject.rows);
        });
    });

    test('Class 2: single, paramaterised query', () => {
        let q0 = mockQueryText3;
        let v0 = mockQueryValues3;
        let cmd0 = {text: q0, values: v0};
        let cmds = [cmd0];
        mockQueryInner.mockImplementation(() => testObject);
        return db.complexQuery(cmds).then(res => {
            expect(mockQuery).toBeCalledTimes(3);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, v0);
            expect(mockQuery).nthCalledWith(3, 'COMMIT');
            expect(mockRelease).toBeCalledTimes(1);
            expect(res).toHaveLength(1);
            expect(res[0]).toBe(testObject.rows);
        });
    });

    test('Class 3: multiple queries', () => {
        let q0 = mockQueryText;
        let q1 = mockQueryText2;
        let cmd0 = {text: q0};
        let cmd1 = {text: q1};
        let cmds = [cmd0, cmd1];
        mockQueryInner.mockImplementation(() => testObject);
        mockQueryInner2.mockImplementation(() => testObject2);
        return db.complexQuery(cmds).then(res => {
            expect(mockQuery).toBeCalledTimes(4);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, q1, []);
            expect(mockQuery).nthCalledWith(4, 'COMMIT');
            expect(mockRelease).toBeCalledTimes(1);
            expect(res).toHaveLength(2);
            expect(res[0]).toBe(testObject.rows);
            expect(res[1]).toBe(testObject2.rows);
        });
    });

    test('Class 4: backreferencing queries', () => {
        let q0 = mockQueryText;
        let q1 = mockQueryText3;
        let v1 = [
            res => res[0][0]['fullname']
        ];
        let cmd0 = {text: q0};
        let cmd1 = {text: q1, values: v1};
        let cmds = [cmd0, cmd1];
        mockQueryInner.mockImplementation(() => testObject);
        return db.complexQuery(cmds).then(res => {
            expect(mockQuery).toBeCalledTimes(4);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, q1, [testObject.rows[0].fullname]);
            expect(mockQuery).nthCalledWith(4, 'COMMIT');
            expect(mockRelease).toBeCalledTimes(1);
            expect(res).toHaveLength(2);
            expect(res[0]).toBe(testObject.rows);
            expect(res[1]).toBe(testObject.rows);
        });
    });
    
    test('Class 5: invalid backreference', () => {
        let q0 = mockQueryText;
        let q1 = mockQueryText3;
        let v1 = [
            res => res[0][0]['keydoesntexist']
        ];
        let cmd0 = {text: q0};
        let cmd1 = {text: q1, values: v1};
        let cmds = [cmd0, cmd1];
        mockQueryInner.mockImplementation(() => testObject);
        expect.assertions(6);
        return db.complexQuery(cmds).catch(err => {
            expect(mockQuery).toBeCalledTimes(3);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, 'ROLLBACK');
            expect(mockRelease).toBeCalledTimes(1);
            expect(err).toBeInstanceOf(QueryConstructionError);
        });
    });

    test('Class 6: exceptional backreference', () => {
        // this is what Class 5 was originally for, but then I remembered
        // JavaScript doesn't do ReferenceError unless absolutely necessary
        let q0 = mockQueryText;
        let q1 = mockQueryText3;
        let v1 = [
            () => {throw new Error('test error');}
        ];
        let cmd0 = {text: q0};
        let cmd1 = {text: q1, values: v1};
        let cmds = [cmd0, cmd1];
        mockQueryInner.mockImplementation(() => testObject);
        expect.assertions(6);
        return db.complexQuery(cmds).catch(err => {
            expect(mockQuery).toBeCalledTimes(3);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, 'ROLLBACK');
            expect(mockRelease).toBeCalledTimes(1);
            expect(err).toBeInstanceOf(QueryConstructionError);
        });
    });

    test('Class 7: textless query', () => {
        let cmd0 = {};
        let cmds = [cmd0];
        expect.assertions(5);
        return db.complexQuery(cmds).catch(err => {
            expect(mockQuery).toBeCalledTimes(2);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, 'ROLLBACK');
            expect(mockRelease).toBeCalledTimes(1);
            expect(err).toBeInstanceOf(QueryConstructionError);
        });
    });

    test('Class 8: exceptional first query', () => {
        let q0 = mockQueryText;
        let q1 = mockQueryText2;
        let cmd0 = {text: q0};
        let cmd1 = {text: q1};
        let cmds = [cmd0, cmd1];
        let msg = 'Something broked'
        mockQueryInner.mockImplementation(() => new Error(msg));
        mockQueryInner2.mockImplementation(() => testObject);
        expect.assertions(7);
        return db.complexQuery(cmds).catch(err => {
            expect(mockQuery).toBeCalledTimes(3);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, 'ROLLBACK');
            expect(mockRelease).toBeCalledTimes(1);
            expect(err).toBeInstanceOf(QueryExecutionError);
            expect(err).toHaveProperty('message', msg);
        });
    });

    test('Class 9: exceptional last query', () => {
        let q0 = mockQueryText;
        let q1 = mockQueryText2;
        let cmd0 = {text: q0};
        let cmd1 = {text: q1};
        let cmds = [cmd0, cmd1];
        let msg = 'Something broked'
        mockQueryInner.mockImplementation(() => testObject);
        mockQueryInner2.mockImplementation(() => new Error(msg));
        expect.assertions(8);
        return db.complexQuery(cmds).catch(err => {
            expect(mockQuery).toBeCalledTimes(4);
            expect(mockQuery).nthCalledWith(1, 'BEGIN');
            expect(mockQuery).nthCalledWith(2, q0, []);
            expect(mockQuery).nthCalledWith(3, q1, []);
            expect(mockQuery).nthCalledWith(4, 'ROLLBACK');
            expect(mockRelease).toBeCalledTimes(1);
            expect(err).toBeInstanceOf(QueryExecutionError);
            expect(err).toHaveProperty('message', msg);
        });
    });

    test('Class 10: no client available', () => {
        mockConnectInner.mockReturnValueOnce(new DBClientNotAvailableError('No clients available'));
        let q0 = mockQueryText;
        let cmd0 = {text: q0};
        let cmds = [cmd0];
        expect.assertions(2);
        return db.complexQuery(cmds).catch(err => {
            expect(err).toBeInstanceOf(DBClientNotAvailableError);
            expect(mockQuery).toBeCalledTimes(0);
        });
    });
});

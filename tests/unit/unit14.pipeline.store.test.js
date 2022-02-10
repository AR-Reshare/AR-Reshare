const Pipeline = require('../../classes/pipeline');
const SQLTemplate = require('../../classes/sqltemplate');
const Database = require('../../classes/database');

const mockDBInner = jest.fn();
const mockDBPromise = () => {
    return new Promise((res, rej) => {
        let result = mockDBInner();
        if (result instanceof Error) {
            rej(result);
        } else {
            res(result);
        }
    });
};

const mockSQLTemplateBuild = jest.fn();
const mockDatabaseSimple = jest.fn().mockImplementation(mockDBPromise);
const mockDatabaseComplex = jest.fn().mockImplementation(mockDBPromise);

jest.mock('../../classes/sqltemplate', () => {
    return jest.fn().mockImplementation(() => {
        return {
            build: mockSQLTemplateBuild,
        };
    });
});

jest.mock('../../classes/database', () => {
    return jest.fn().mockImplementation(() => {
        return {
            simpleQuery: mockDatabaseSimple,
            complexQuery: mockDatabaseComplex,
        };
    });
});

let pipe, template;

beforeAll(() => {
    let db = new Database();
    pipe = new Pipeline(db);
    template = new SQLTemplate();
});

beforeEach(() => {
    SQLTemplate.mockClear();
    mockSQLTemplateBuild.mockClear();
    Database.mockClear();
    mockDBInner.mockClear();
    mockDatabaseComplex.mockClear();
    mockDatabaseSimple.mockClear();
});

describe('Unit Test 14 - Pipeline.Store', () => {
    test('Class 1: Single, non-parameterised query', () => {
        let built_query = [{
            text: 'SELECT NOW() AS now',
        }];
        let db_response = [{'now': 1234}];

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(db_response);
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        return pipe.Store(template, inputObject, accountID).then(res => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).toBeCalledWith(built_query[0].text);
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(res).toBe(db_response);
        });
    });

    test('Class 2: Single, parameterised query', () => {
        let built_query = [{
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Ronnie Omelettes'],
        }];
        let db_response = [{'userid': 1234}];

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(db_response);
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        return pipe.Store(template, inputObject, accountID).then(res => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).toBeCalledWith(built_query[0].text, built_query[0].values);
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(res).toBe(db_response);
        });
    });

    test('Class 3: Multiple queries', () => {
        let built_query = [{
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Ronnie Omelettes'],
        }, {
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Gary Cheeseman'],
        }];
        let db_response = [[{'userid': 1234}], [{'userid': 4321}]];

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(db_response);
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        return pipe.Store(template, inputObject, accountID).then(res => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).not.toBeCalled();
            expect(mockDatabaseComplex).toBeCalledWith(built_query);
            expect(res).toBe(db_response);
        });
    });

    test('Class 4: Exceptional construction', () => {
        let build_err = new Error('oopsie woopsie');

        mockSQLTemplateBuild.mockImplementation(() => {throw build_err});
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        expect.assertions(4);

        return pipe.Store(template, inputObject, accountID).catch(err => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).not.toBeCalled();
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(err).toBe(build_err);
        });
    });

    test('Class 5: Single, non-parameterised, exceptional query', () => {
        let built_query = [{
            text: 'SELECT NOW() AS now',
        }];
        let exec_err = new Error('oopsie woopsie');
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(exec_err);

        expect.assertions(4);

        return pipe.Store(template, inputObject, accountID).catch(err => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).toBeCalledWith(built_query[0].text);
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(err).toBe(exec_err);
        });
    });

    test('Class 6: Single, parameterised, exceptional query', () => {
        let built_query = [{
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Ronnie Omelettes'],
        }];
        let exec_err = new Error('oopsie woopsie');
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(exec_err);

        expect.assertions(4);

        return pipe.Store(template, inputObject, accountID).catch(err => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).toBeCalledWith(built_query[0].text, built_query[0].values);
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(err).toBe(exec_err);
        });
    });

    test('Class 7: Multiple queries, with exception', () => {
        let built_query = [{
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Ronnie Omelettes'],
        }, {
            text: 'SELECT userid FROM Account WHERE username = $1',
            values: ['Gary Cheeseman'],
        }];
        let exec_err = new Error('oopsie woopsie');
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        mockDBInner.mockReturnValueOnce(exec_err);

        expect.assertions(4);

        return pipe.Store(template, inputObject, accountID).catch(err => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).not.toBeCalled();
            expect(mockDatabaseComplex).toBeCalledWith(built_query);
            expect(err).toBe(exec_err);
        });
    });

    test('Class 8: no queries', () => {
        let built_query = [];
        let inputObject = {
            test: 'test',
        };
        let accountID = 42;

        mockSQLTemplateBuild.mockReturnValueOnce(built_query);
        
        return pipe.Store(template, inputObject, accountID).then(res => {
            expect(mockSQLTemplateBuild).toBeCalledWith(inputObject, accountID);
            expect(mockDatabaseSimple).not.toBeCalled();
            expect(mockDatabaseComplex).not.toBeCalled();
            expect(res).toStrictEqual([]);
        });
    });
});

const { CreateEntityPipeline } = require('../../pipeline');
const Pipeline = require('../../classes/pipeline');
const SecuritySchemaDict = require('../../schemas/security-schemas');
const RequestTemplateDict = require('../../schemas/request-schemas');
const SQLTemplateDict = require('../../schemas/sql-templates');
const ResponseTemplateDict = require('../../schemas/response-schemas');
const PushTemplateDict = require('../../schemas/push-schemas');
const { InvalidTokenError, AbsentArgumentError, QueryExecutionError } = require('../../classes/errors');

const mockSecInner = jest.fn();
const mockDatInner = jest.fn();
const mockStoInner = jest.fn();
const mockAPIInner = jest.fn();
const mockPusInner = jest.fn();

const mockAsync = (inner) => {
    return () => {
        return new Promise((res, rej) => {
            let out = inner();
            if (out instanceof Error) {
                rej(out);
            } else {
                res(out);
            }
        });
    }
}

const mockSecurityValidate = jest.fn().mockImplementation(mockAsync(mockSecInner));
const mockDataValidate = jest.fn().mockImplementation(mockAsync(mockDatInner));
const mockStore = jest.fn().mockImplementation(mockAsync(mockStoInner));
const mockAPIRespond = jest.fn().mockImplementation(mockAsync(mockAPIInner));
const mockPushRespond = jest.fn().mockImplementation(mockAsync(mockPusInner));
const mockDB = {
    dbProperty: 'unique-string-for-mockDB',
};
const mockLogger = {
    logProperty: 'unique-string-for-mockLogger',
};
const mockRes = {
    resProperty: 'unique-string-for-mockRes',
};

// simply mocking the Pipeline class in the first place breaks things so we're doing this instead I guess
const mockifyPipe = (pipe) => {
    pipe.SecurityValidate = mockSecurityValidate;
    pipe.DataValidate = mockDataValidate;
    pipe.Store = mockStore;
    pipe.APIRespond = mockAPIRespond;
    pipe.PushRespond = mockPushRespond;
}

jest.mock('../../schemas/security-schemas', () => {
    return {
        'create-test': {
            name: 'testSecSchema',
        },
    };
});

jest.mock('../../schemas/request-schemas', () => {
    return {
        'create-test': {
            name: 'testReqSchema',
        },
    };
});

jest.mock('../../schemas/sql-templates', () => {
    return {
        'create-test': {
            name: 'testSSQLSchema',
        },
    };
});

jest.mock('../../schemas/response-schemas', () => {
    return {
        'create-test': {
            name: 'testResSchema',
        },
    };
});

jest.mock('../../schemas/push-schemas', () => {
    return {
        'create-test': {
            name: 'testFCMSchema',
        },
    };
});

beforeEach(() => {
    mockSecInner.mockClear();
    mockDatInner.mockClear();
    mockStoInner.mockClear();
    mockAPIInner.mockClear();
    mockPusInner.mockClear();
    mockSecurityValidate.mockClear();
    mockDataValidate.mockClear();
    mockStore.mockClear();
    mockAPIRespond.mockClear();
    mockPushRespond.mockClear();
});

afterEach(() => {
    mockSecInner();
    mockDatInner();
    mockStoInner();
    mockAPIInner();
    mockPusInner();
})

describe('Unit Test 6 - Create Entity Pipeline executor', () => {
    test('Class 1: Successful request, default options', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 2: Successful request, notify self', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);
        mockPusInner.mockReturnValueOnce(null);

        let pipe = new CreateEntityPipeline('test', {notify: 'self'}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).toBeCalledWith(PushTemplateDict['create-test'], [
                [{userid: 54321}],
            ], [12345]);
        });
    });

    test('Class 3: Successful request, notify affected', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);
        mockPusInner.mockReturnValueOnce(null);

        let pipe = new CreateEntityPipeline('test', {notify: 'affected'}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).toBeCalledWith(PushTemplateDict['create-test'], [
                [{userid: 54321}],
            ], [54321]);
        });
    });

    test('Class 4: Successful request, not logged in', () => {
        let req = {
            headers: {},
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(null);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);
        mockPusInner.mockReturnValueOnce(null);

        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], undefined, expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 5: Successful request, data in query', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {
                username: 'Testy McTestface',
            },
            params: {},
            body: {},
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {method: 'query'}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 6: Successful request, data in both query and params', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {
                username: 'Testy McTestface',
            },
            params: {
                email: 'testy@testface.com',
            },
            body: {},
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {method: 'query'}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
                email: 'testy@testface.com',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                email: 'testy@testface.com',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 7: Successful request, no data', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {},
        };
        let res = mockRes;

        let accountID = 12345;
        let validated = {};
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 200,
            outputObject: {
                userid: 54321,
            },
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({}));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {});
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, [
                [{userid: 54321}],
            ], null);
            expect(mockPushRespond).not.toBeCalled();
        });
    });
    
    test('Class 8: Unsuccessful request, failed authentication', () => {
        let req = {
            headers: {
                authorization: 'oops',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let authError = new InvalidTokenError('Token not valid');
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 401,
            outputObject: null,
        };

        mockSecInner.mockReturnValueOnce(authError);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);
        
        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'oops', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).not.toBeCalled();
            expect(mockStore).not.toBeCalledWith();
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, null, authError);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 9: Unsuccessful request, failed validation', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;

        let accountID = 12345;
        let valError = new AbsentArgumentError('Argument missing');
        let dbResponse = [
            [{userid: 54321}],
        ];
        let apiResponse = {
            status: 400,
            outputObject: null,
        };

        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(valError);
        mockStoInner.mockReturnValueOnce(dbResponse);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).not.toBeCalled();
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, null, valError);
            expect(mockPushRespond).not.toBeCalled();
        });
    });

    test('Class 10: Unsuccessful request, failed storage', () => {
        let req = {
            headers: {
                authorization: 'AToken',
            },
            query: {},
            params: {},
            body: {
                username: 'Testy McTestface',
            },
        };
        let res = mockRes;
        
        let accountID = 12345;
        let validated = {
            valid_uname: 'Testy McTestface',
        };
        let dbError = new QueryExecutionError('Database broked, sorry');
        let apiResponse = {
            status: 500,
            outputObject: null,
        };
        
        mockSecInner.mockReturnValueOnce(accountID);
        mockDatInner.mockReturnValueOnce(validated);
        mockStoInner.mockReturnValueOnce(dbError);
        mockAPIInner.mockReturnValueOnce(apiResponse);

        let pipe = new CreateEntityPipeline('test', {}, mockDB, mockLogger);
        mockifyPipe(pipe);

        return pipe.Execute(req, res).then(() => {
            expect(mockSecurityValidate).toBeCalledWith(SecuritySchemaDict['create-test'], 'AToken', expect.objectContaining({
                username: 'Testy McTestface',
            }));
            expect(mockDataValidate).toBeCalledWith(RequestTemplateDict['create-test'], {
                username: 'Testy McTestface',
                accountID: 12345,
            });
            expect(mockStore).toBeCalledWith(SQLTemplateDict['create-test'], {
                valid_uname: 'Testy McTestface',
            });
            expect(mockAPIRespond).toBeCalledWith(ResponseTemplateDict['create-test'], mockRes, null, dbError);
            expect(mockPushRespond).not.toBeCalled();
        });
    });
});

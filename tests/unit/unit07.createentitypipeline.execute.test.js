const { CreateEntityPipeline } = require('../../pipeline');
const Pipeline = require('../../classes/pipeline');

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
const mockDB = {};
const mockLogger = {};

jest.mock('../../classes/pipeline', () => {
    return () => {
        return {
            SecurityValidate: mockSecurityValidate,
            DataValidate: mockDataValidate,
            Store: mockStore,
            APIRespond: mockAPIRespond,
            PushRespond: mockPushRespond,
            db: mockDB,
            logger: mockLogger,
        };
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

describe('Unit Test 6 - Create Entity Pipeline executor', () => {
    test('Not implemented', () => {
        // pass
    });
});

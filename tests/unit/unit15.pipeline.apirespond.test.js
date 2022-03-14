const { QueryExecutionError } = require('../../classes/errors'); // used as an example
const Pipeline = require('../../classes/pipeline');

const mockGetStatus = jest.fn();
const mockGetResponse = jest.fn();
const mockStatus = jest.fn();
const mockSend = jest.fn();

let schema, res, pipe;

beforeAll(() => {
    schema = MockResponseTemplate = {
        getStatus: mockGetStatus,
        getResponse: mockGetResponse,
    };
    res = MockResponseHandle = {
        status: mockStatus,
        send: mockSend,
    };
    pipe = new Pipeline();
});

beforeEach(() => {
    mockGetStatus.mockClear();
    mockGetResponse.mockClear();
    mockStatus.mockClear();
    mockSend.mockClear();
});

describe('Unit Test 15 - Pipeline.APIRespond', () => {
    test('Class 1: no error', () => {
        let inputArray = [[{userid: 12345}]];
        let status = 200;
        let processed = {userid: 54321};

        mockGetStatus.mockReturnValueOnce(status);
        mockGetResponse.mockReturnValueOnce(processed);
        
        return pipe.APIRespond(schema, res, inputArray).then(out => {
            expect(mockGetStatus).toBeCalledWith(null);
            expect(mockGetResponse).toBeCalledWith(inputArray);
            expect(mockStatus).toBeCalledWith(status);
            expect(mockSend).toBeCalledWith(processed);

            expect(out).toHaveProperty('status', status);
            expect(out).toHaveProperty('result', processed);
        });
    });

    test('Class 2: null error', () => {
        let inputArray = [[{userid: 12345}]];
        let err = null;
        let status = 200;
        let processed = {userid: 54321};

        mockGetStatus.mockReturnValueOnce(status);
        mockGetResponse.mockReturnValueOnce(processed);
        
        return pipe.APIRespond(schema, res, inputArray, err).then(out => {
            expect(mockGetStatus).toBeCalledWith(null);
            expect(mockGetResponse).toBeCalledWith(inputArray);
            expect(mockStatus).toBeCalledWith(status);
            expect(mockSend).toBeCalledWith(processed);

            expect(out).toHaveProperty('status', status);
            expect(out).toHaveProperty('result', processed);
        });
    });

    test('Class 3: error, null input array', () => {
        let inputArray = null;
        let err = new QueryExecutionError('Some message');
        let status = 404;

        mockGetStatus.mockReturnValueOnce(status);
        
        return pipe.APIRespond(schema, res, inputArray, err).then(out => {
            expect(mockGetStatus).toBeCalledWith(err);
            expect(mockGetResponse).not.toBeCalled();
            expect(mockStatus).toBeCalledWith(status);
            expect(mockSend).toBeCalledWith({error: 'Some message'});

            expect(out).toHaveProperty('status', status);
            expect(out).toHaveProperty('result', {error: 'Some message'});
        });
    });

    test('Class 4: error, non-null input array', () => {
        let inputArray = [[{userid: 12345}]];
        let err = new QueryExecutionError('Some message');
        let status = 404;

        mockGetStatus.mockReturnValueOnce(status);
        
        return pipe.APIRespond(schema, res, inputArray, err).then(out => {
            expect(mockGetStatus).toBeCalledWith(err);
            expect(mockGetResponse).not.toBeCalled();
            expect(mockStatus).toBeCalledWith(status);
            expect(mockSend).toBeCalledWith({error: 'Some message'});

            expect(out).toHaveProperty('status', status);
            expect(out).toHaveProperty('result', {error: 'Some message'});
        });
    });

    test('Class 5: null error, null input array', () => {
        let inputArray = null;
        let err = null;
        let status = 200;

        mockGetStatus.mockReturnValueOnce(status);

        return pipe.APIRespond(schema, res, inputArray, err).then(out => {
            expect(mockGetStatus).toBeCalledWith(err);
            expect(mockGetResponse).not.toBeCalled();
            expect(mockStatus).toBeCalledWith(status);
            expect(mockSend).toBeCalledWith({success: true});

            expect(out).toHaveProperty('status', status);
            expect(out).toHaveProperty('result', {success: true});
        });
    });
});

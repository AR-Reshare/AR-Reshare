const { CreateEntityPipeline } = require('../../pipeline');
const { PipelineInitialisationError } = require('../../classes/errors');
const Pipeline = require('../../classes/pipeline');
const RequestTemplateDict = require('../../schemas/request-schemas');
const SQLTemplateDict = require('../../schemas/sql-templates');
const ResponseTemplateDict = require('../../schemas/response-schemas');
const PushTemplateDict = require('../../schemas/push-schemas');

jest.mock('../../classes/pipeline', () => {
    return jest.fn().mockImplementation(() => {
        return {}
    });
});

jest.mock('../../schemas/request-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        }
    };
});

jest.mock('../../schemas/sql-templates', () => {
    return {
        'create-test': {
            property: 'some-object',
        }
    };
});

jest.mock('../../schemas/response-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        }
    };
});

jest.mock('../../schemas/push-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        }
    };
});

beforeEach(() => {
    Pipeline.mockClear();
});

describe('Unit Test 1 - Create Entity Pipeline constructor', () => {
    test('Class 1: valid initialisation with no options', () => {
        let entityType = 'test';
        let options = {};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', false);
        expect(pipe).toHaveProperty('authMode', 'logged_in');
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', null);
    });

    // Class 2: invalid initialisation: entity type empty

    // Class 3: invalid initialisation: entity type not string

    // Class 4a: init with notify: affected
    
    // Class 4b: init with notify: self

    // Class 4c: init with notify: false

    // Class 4d: init with notify: invalid

    // Class 5a: init with auth_mode: logged_in

    // Class 5b: init with auth_mode: optional

    // Class 5c: init with auth_mode: logged_out

    // Class 5d: init with auth_mode: invalid

    // Class 6a: init with method: query

    // Class 6b: init with method: body

    // Class 6c: init with method: invalid

    // Class 7: init with no request template

    // Class 8: init with no SQL template

    // Class 9: init with no response template

    // Class 10: init with no push template
});

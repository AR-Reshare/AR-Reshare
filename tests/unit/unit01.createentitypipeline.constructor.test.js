const { CreateEntityPipeline } = require('../../pipeline');
const { PipelineInitialisationError, MissingTemplateError } = require('../../classes/errors');
const Pipeline = require('../../classes/pipeline');
const SecuritySchemaDict = require('../../schemas/security-schemas');
const RequestTemplateDict = require('../../schemas/request-schemas');
const SQLTemplateDict = require('../../schemas/sql-templates');
const ResponseTemplateDict = require('../../schemas/response-schemas');
const PushTemplateDict = require('../../schemas/push-schemas');

jest.mock('../../classes/pipeline', () => {
    return jest.fn().mockImplementation(function () {
        return this;
    });
});

jest.mock('../../schemas/security-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        },
        'create-': {},
        'create-5': {},
        'create-norequest': {
            property: 'some-object',
        },
        'create-nosql': {
            property: 'some-object',
        },
        'create-noresponse': {
            property: 'some-object',
        },
        'create-nopush': {
            property: 'some-object',
        },
    };
});

jest.mock('../../schemas/request-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        },
        'create-': {}, // make sure empty entityType is throwing for the right reason
        'create-5': {},
        'create-nosecurity': {
            property: 'some-object',
        },
        'create-nosql': {
            property: 'some-object',
        },
        'create-noresponse': {
            property: 'some-object',
        },
        'create-nopush': {
            property: 'some-object',
        },
    };
});

jest.mock('../../schemas/sql-templates', () => {
    return {
        'create-test': {
            property: 'some-object',
        },
        'create-': {},
        'create-5': {},
        'create-nosecurity': {
            property: 'some-object',
        },
        'create-norequest': {
            property: 'some-object',
        },
        'create-noresponse': {
            property: 'some-object',
        },
        'create-nopush': {
            property: 'some-object',
        },
    };
});

jest.mock('../../schemas/response-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        },
        'create-': {},
        'create-5': {},
        'create-nosecurity': {
            property: 'some-object',
        },
        'create-norequest': {
            property: 'some-object',
        },
        'create-nosql': {
            property: 'some-object',
        },
        'create-nopush': {
            property: 'some-object',
        },
    };
});

jest.mock('../../schemas/push-schemas', () => {
    return {
        'create-test': {
            property: 'some-object',
        },
        'create-': {},
        'create-5': {},
        'create-nosecurity': {
            property: 'some-object',
        },
        'create-norequest': {
            property: 'some-object',
        },
        'create-nosql': {
            property: 'some-object',
        },
        'create-noresponse': {
            property: 'some-object',
        },
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
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', null);
    });

    test('Class 2: invalid initialisation: entity type empty', () => {
        let entityType = '';
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(PipelineInitialisationError);
    });

    test('Class 3: invalid initialisation: entity type not string', () => {
        let entityType = 5;
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(PipelineInitialisationError);
    });

    test('Class 4a: init with notify: affected', () => {
        let entityType = 'test';
        let options = {notify: 'affected'};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', 'affected');
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', PushTemplateDict['create-test']);
    });
    
    test('Class 4b: init with notify: self', () => {
        let entityType = 'test';
        let options = {notify: 'self'};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', 'self');
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', PushTemplateDict['create-test']);
    });

    test('Class 4c: init with notify: false', () => {
        let entityType = 'test';
        let options = {notify: false};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', false);
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', null);
    });

    test('Class 4d: init with notify: invalid', () => {
        let entityType = 'test';
        let options = {notify: 'invalid'};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(PipelineInitialisationError);
    });

    test('Class 5a: init with method: query', () => {
        let entityType = 'test';
        let options = {method: 'query'};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', false);
        expect(pipe).toHaveProperty('method', 'query');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', null);
    });

    test('Class 5b: init with method: body', () => {
        let entityType = 'test';
        let options = {method: 'body'};

        let pipe = new CreateEntityPipeline(entityType, options);
        expect(pipe).toHaveProperty('actionType', 'create-test');
        expect(pipe).toHaveProperty('notify', false);
        expect(pipe).toHaveProperty('method', 'body');
        expect(pipe).toHaveProperty('securitySchema', SecuritySchemaDict['create-test']);
        expect(pipe).toHaveProperty('requestTemplate', RequestTemplateDict['create-test']);
        expect(pipe).toHaveProperty('sqlTemplate', SQLTemplateDict['create-test']);
        expect(pipe).toHaveProperty('responseTemplate', ResponseTemplateDict['create-test']);
        expect(pipe).toHaveProperty('pushTemplate', null);
    });

    test('Class 5c: init with method: invalid', () => {
        let entityType = 'test';
        let options = {method: 'invalid'};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(PipelineInitialisationError);
    });

    test('Class 6: init with no security schema', () => {
        let entityType = 'nosecurity';
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(MissingTemplateError);
    })

    test('Class 7: init with no request template', () => {
        let entityType = 'norequest';
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(MissingTemplateError);
    });

    test('Class 8: init with no SQL template', () => {
        let entityType = 'nosql';
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(MissingTemplateError);
    });

    test('Class 9: init with no response template', () => {
        let entityType = 'noresponse';
        let options = {};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(MissingTemplateError);
    });

    test('Class 10: init with no push template', () => {
        let entityType = 'nopush';
        let options = {notify: 'self'};

        expect(() => new CreateEntityPipeline(entityType, options)).toThrow(MissingTemplateError);
    });
});

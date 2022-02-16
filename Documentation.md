## Router (app.js)

## Pipelines (pipeline.js)

## Pipeline Base (classes/pipeline.js)

### SecurityValidate

### DataValidate
Takes two inputs, `requestSchema` and `inputObject`. `inputObject` is the object to validate, `requestSchema` must be an instance of `RequestTemplate`, as defined in classes/requesttemplate.js

The `RequestTemplate` object must be initialised ahead of time. Its constructor takes a list of objects representing parameters to select from the input object - these parameter objects must have properties as follows:

| key | type | description |
|-----|------|-------------|
| `in_name` | string, required | The name (key) of the parameter in the input object |
| `out_name` | string, optional | The name (key) in the output object to write the value into. Defaults to the same as `in_name` |
| `required` | boolean, optional | How to handle the parameter not being present in the input object. If true, throws an `AbsentArgumentError`, and if false skips to the next parameter. Defaults to false. |
| `conditions` | array of callables, optional | Callables that will be passed the value from the input object as the first argument, and the input object as the second. If all of these return true/truthy, the parameter is considered valid. If at least one returns false/falsy, throws an `InvalidArgumentError`. Defaults to an empty array. |
| `sanitise` | callable, optional | Callable that will be passed the value from the input object as its only argument, and is expected to return a sanitised version of it for writing to the output object. Defaults to the identity function |

If initialisation fails (e.g. by one of those properties having the wrong type) then the constructor will throw a `TemplateError`.

The output will be a promise object, which resolves with a validated object according to those rules. If any extra keys are included in the input object, which are not referenced by the request template, they will be discarded.

If the promise rejects, it will do so with one of the following errors:

| error | description |
|-------|-------------|
| AbsentArgumentError | A required parameter was not present in the input object |
| InvalidArgumentError | At least one of the `condition` functions returned false |
| UnprocessableArgumentError | One of the `condition` functions threw an error |
| DirtyArgumentError | The `sanitise` function threw an error |

### Store

### APIResond

### PushRespond

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
Takes two inputs, `sqlTemplate` and `formatObject`. `sqlTemplate` must be an instance of `SQLTemplate`, as per classes/sqltemplate.js, while `formatObject` should be a validated object containing values from which the queries will be built.

The `SQLTemplate` object must be initialised ahead of time. It's constructor takes three parameters, `queryDict` - a dictionary containing query objects, `order` - an array of keys into `queryDict` which defines the order the queries will be executed in, and finally an optional `options` object.

The query objects must have properties as follows:

| key | type | description |
|-----|------|-------------|
| text | string, required | The text of the SQL query to execute. May be parameterised using $1, $2, etc. |
| values | array, optional | Required if the query is parameterised. Contains value objects (see below) which define the values to substitute into the query's text, in order |
| times | callable, optional | Will be passed the format object, and is expected to return a positive integer which defines how many times this query will be executed |
| condition | callable, optional | Will be passed the format object, and is expected to return a boolean. The query will only execute if the callable returns true |

The value objects passed to values must either be callable or objects containing exactly one of `from_input` or `from_query` as keys.

If the value is callable, then it will be passed the format object and an array of keys of queries that will be executed before this one, in order and accounting for `condition` and `times`, and it is expected to produce the value directly which will then be passed into the query's parameters.

If the value contains `from_input`, then the value at that key must be a key in the format object, and the value in the format object at that key will be passed into the query's parameters. If the value is an array, and this query is executed more than once, then the array will be indexed into (i.e. the first iteration of this query will use the first value in the array, and so on).

If the value contains `from_query`, then the value at that key must be an array of two elements, the first of which is a key into `queryDict` and the second of which is a field that that query is expected to return. The value returned from that query will then be passed into this query's parameters. If both queries are executed more than once, then the values will be paired up (i.e. the first iteration of this query will use the value from the first iteration of the other query, and so on).

The options object may have properties as follows:

| key | type | description |
|-----|------|-------------|
| error_on_empty_transaction | boolean | Whether to throw an error if the built transaction contains no queries. |
| drop_from_results | array of string | Array of keys into `queryDict`. Results of these queries will be treated as intermediary results and removed from the output. |
| error_on_empty_response | boolean | Whether to throw an error if the response from the database is empty. This is processed after drop_from_results. |

If initialisation fails, a `QueryTemplateError` is thrown.

The output will be a promise object, which resolves to an array of arrays representing the results of the transaction. Each 'inner' array contains objects, each representing a single row returned from the database, with keys corresponding to the field names.

If the promise rejects, it will do so with one of the following errors:

| error | description |
|-------|-------------|
| QueryConstructionError | The query could not be constructed, most likely because the format object was invalid |
| EmptyQueryError | The transaction contained no queries and `error_on_empty_transaction` is true |
| DBClientNotAvailableError | No database clients were available to service the request |
| QueryExecutionError | The query threw an error at the database |
| BackreferenceError | A backreference (a value with `from_query`) threw an error or otherwise did not return a value |
| EmptyResponseError | The result of the transactions was empty and `error_on_empty_response` is true |

### APIResond
Takes four inputs, `responseSchema`, `res`, `inputArray`, and `err`. The `responseSchema` must be an instance of `ResponseTemplate`, as per classes/responsetemplate.js. `res` should be the response handler object created by the express router. `inputArray` should be null, or a 2-d array of objects as per the return value of Store. `err` should be null or an error object representing the reason the pipeline could not complete the request.

The `responseSchema` object should be initialised ahead of time. Its constructor takes two parameters: `params`, a list of parameter objects with properties as described in the table below, and an optional `errorMap`, an object containing keys which are the names of specific error classes and values which are the integer status codes to return in the event of that error. The `errorMap` may contain the key `null`, which should map to a success code (usually 200 or 201).

| key | type | description |
|-----|------|-------------|
| out_name | string | The key of the output object in which to store this value |
| field† | string, optional | The name of a field in one of the objects in the input array. That field's value will be placed in the output object. If the field occurs multiple times, then the first occurance is used. If the field appears zero times then this key is omitted in the output object |
| rows_with_fields† | string or string[], optional | The name, or array of names, of fields to search for in the input array. Every object that contains all of those names as keys will be selected, packaged into a 1-dimensional array, and inserted into the output object. If no matching object is found then this key is omitted in the output object |
| one_row_with_fields† | string or string[], optional | As with rows_with_fields, except only the first matching object is used |

†properties are mutually exclusive, exactly one of them must be present

The method will look up the appropriate status code based on the `err` argument and the `responseSchema`'s `errorMap` (coupled with a default error mapping for unspecified errors). If the code represents a success (i.e. 2XX) then it will compose an output object based on the `inputArray` and the `responseSchema`'s `params`. Both the status code and the output object will then be transmitted using the `res`.

The method returns a promise object which should always resolve. When it does so, it will resolve with an object containing properties `statusCode` and `outputObject`, which contain the status and object, respectively, which were transmitted. If `outputObject` is null, then no object was transmitted.

### PushRespond

## Database (classes/database.js)
The Database class can be used to interact with the database by passing queries. It is recommended that these queries be built first by an SQLTemplate, but that is not necessary.

### Connection
When an instance of Database is initialised, it should be passed a credentials object. This object must specify the user, password, hostname, and database. Calling `.testConnection()` is recommended - it will resolve if the connection is successful and reject if it failed.

### Issuing queries
There are two methods for querying the database, `simpleQuery` and `complexQuery`. The former takes two arguments, the SQL statement and an optional array of values to substitute into it. The latter takes one argument, a list of objects representing queries which must each have a text property (the SQL statement) and an optional values property (the values to substitute in). The values may be callables, in which case they are called with the current results of the queries and the return value is used as the parameter.

These functions will usually resolve with an array of arrays corresponding to the results of the queries, as per `Pipeline.Store`. If they reject, they will reject with one of the following:

| error | description |
|-------|-------------|
| QueryConstructionError | One of the query objects does not contain a text property |
| DBClientNotAvailableError | No database clients were available to service the request |
| QueryExecutionError | The query threw an error at the database |
| BackreferenceError | A callable value threw an error or did not return a value |

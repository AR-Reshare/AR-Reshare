## Router (app.js)
Exports a class representing the application. The constructor takes four arguments: `db`, the Database object representing the database to use; `logger`, the object to use for logging requests; `emailTransporter`, the object representing the email service; and `mediaHandler`, the object representing the media upload service. The class contains several pipeline objects which are bound to endpoints as per the API specification.

The class has a single method, `listen`, which takes a port number and callback function. It binds the app service to the given port, and then executes the callback.

## Pipelines (pipeline.js)
Exports a collection of pipeline classes. Most pipelines inherit from `GenericPipe`, a child of `Pipeline` (see below), which takes in its constructor the following arguments:

| argument | type | description |
|----------|------|-------------|
| operation | string | The operation type to perform, such as `"create"` or `"search"` |
| defaultMethod | string | The location that the request parameters can be found by default. Either `"query"` or `"body"` |
| entityType | string | The type of entity to perform the operation on, such as `"account"` or `"listing"`. Can also be a pseudo-entity, such as `"accountListing"` |
| options | object | Options to apply to the pipeline, including `"notify"` (who to send push notifications to, either `false`, `"self"`, or `"affected"`) and `"method"` (to override the `defaultMethod` of the pipeline) |
| ...args | objects | Objects to pass to the base `Pipeline` class' constructor |

The method then fetches schemas for its components at the dictionary keys `` `${operation}-${entityType}` ``.

The class has all of the class methods of `Pipeline`, plus an `Execute` method which takes Request and Response objects and performs the pipeline's operations on them.

The `CreateEntityPipeline`, `ModifyEntityPipeline`, `CloseEntityPipeline`, `ViewEntityPipeline`, and `SearchEntityPipeline` classes extend this class, providing values for `operation` and `defaultMethod` so that only `entityType` and onwards need to be supplied to their constructors.

`LoginPipeline` is also exported, but does not inherit from `GenericPipe`. It's constructor takes only the arguments needed for the `Pipeline` base constructor. It also includes an `Execute` method as described above.

`NotImplementedPipeline` and `UnknownEndpointPipeline` also inherit directly from `Pipeline`. These discard the request and respond immediately with status codes 501 (Not Implemented) and 404 (Not Found), respectively.

## Pipeline Base (classes/pipeline.js)
Exports a `Pipeline` class, which takes in its constructor the arguments: `db`, a Database object representing the postgres database instance to connect to; `logger` (default `console`), which represents the object to log messages to; `emailTransporter` (default `null`), an object representing the external email service; and `mediaHandler` (default `null`), an object representing the external media handling service.

### Pipeline.SecurityValidate
Takes three inputs, `securitySchema`, `token` and `query`. `token` is the token to validate, and `query` is the object, possibly containing a password, that goes with it. `securitySchema` must be an instance of `SecuritySchema`, as defined in classes/securityvalidation.js

The `securitySchema` object must be initialised ahead of time. The constructor should receive a single string called `authMode`, which must be one of the following:

| authMode | description |
|----------|-------------|
| `NA` | No authentication necessary |
| `AA_TO` | Authorise and authenticate, using only the token |
| `AA_TAP` | Authorise and authenticate, using both the token and a password retrieved from `query` |

If construction fails, a `TemplateError` will be raised.

The constructed instance of `SecuritySchema` can then be used to validate requests. This is done by calling the async function `securitySchema.process` with the arguments:

| arg | type | description |
|-----|------|-------------|
| `db` | Database, optional | The Database object (see below) that should be used for queries. It is optional depending on the authMode. |
| `token` | string, optional | The JWT token that has been provided with the request. It is optional depending on the authMode (e.g. `NA` doesn't require this, but `AA_TAP` and `AA_TO` do) |
| `query` | object, optional | Contains attributes that correspond to key/values in the request.body and request.query e.g. `password`, `email`|

If the user provided the neccessary and valid credentials to be authenticated (`AA_TO`, `AA_TAP`), then the promise resolves with the user's ID. If no authentication (`NA`) was required (and optionally if a valid token was provided), the promise resolves with `null`. If the promise rejects, it will do so with one of the following errors:

| error | description |
|-------|-------------|
| UnauthenticatedUserError | The token provided with the request is not valid |
| InvalidCredentialsError | The password provided with the token for a `AA_TAP` auth type request was not valid |
| QueryExecutionError | The database query for a single user returned multiple results |
| BadArgumentError | The query object is not of the expected type/format |
| ServerException | For some unexpected reason, any unhandled logical paths (that are currently not known) should raise this exception |
| TamperedTokenError | The token provided with the request was tampered with |
| ExpiredTokenError | The token provided with the request has expired |
| NotBeforeError | The token provided with the request has not realized its NotBefore time yet |
| InvalidTokenError | Encompasses all other `JsonWebTokenError` (from jsonwebtoken npm module) exceptions as the default |
| PrivateKeyReadError | The privatekey file was unable to be read successfully |


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

The method returns a promise object which should always resolve. When it does so, it will resolve with an object containing properties `statusCode` and `result`, which contain the status and object, respectively, which were transmitted. If `result` is null, then no object was transmitted.

### PushRespond (Under Development)
Takes a single input `templateType` to instantiate, which must be a string of of one of the operations that the EmailRespond component supports - currently the supported operations are `Message-Create`, `Message-Send`, `Message-Close`.

| parameter | type | 
| ----------|------|
| `templateType` | string enum [`Message-Create`, `Message-Send`, `Message-Close`], required | If an unsupported or null template type is provided then a `TemplateError` is thrown. |

With the insantiated PushRespond object, the object's main method is called `process(...)` which takes the following list of parameters:

| parameter | type | description |
|-----------|------|-------------|
| `fcmApp` | FCM App Object, required | A successfully configured object that authenticates push notification requests via its interface |
| `userID` | string, required | A userID string |
| `inputObject` | object[string, string], required | An object with key:value such that the key is a placeholder to be replaced in the push notification template, and the value is the value that replaces the placeholder. The acceptable keys and values is dependent on static definitions in the `EmailTemplateDefinition`. |

| error | description |
|-------|-------------|
| `InvalidArgumentError` | One of the arguments or one of the attributes of the `inputObject` is of an invalid type / unsupported value |
| `AbsentArgumentError` | One of the arguments or one of the attributes of the `inputObject` that is required is absent |
| `PushDeliveryError` | The push message was not delivered successfully to the FCM backend service |

NOTE: `PushDeliveryError` is not yet implemented as this component is currently under development

### EmailRespond
Takes a single input `templateType` to instantiate, which must be a string of of one of the operations that the EmailRespond component supports - currently the supported operations are `Account-Modify`, `Account-Create`, `Password-Reset`.

| parameter | type | description |
|-----------|------|-------------|
| `templateType` | string enum [`Account-Modify`, `Account-Create`, `Password-Reset`], required | If an unsupported or null template type is provided then a `TemplateError` is thrown. |

With the insantiated EmailRespond object, the object's main method is called `process(...)` which takes the following list of parameters:

| parameter | type | description |
|-----------|------|-------------|
| `emailTransporter` | nodemailer SMTP Transport, required |  A successfully configured emailTransport that should be retreived from pipeline attributes |
| `email` | string, required | The email address of the target user |
| `inputObject` | object[string, string], required | An object with key:value such that the key is a placeholder to be replaced in the email template, and the value is the value that replaces the placeholder. The acceptable keys and values is dependent on static definitions in the `EmailTemplateDefinition`. |

There are certain errors that may be thrown while calling the object's method `process(...)`

| error | description |
|-------|-------------|
| `InvalidArgumentError` | One of the arguments or one of the attributes of the `inputObject` is of an invalid type / unsupported value |
| `AbsentArgumentError` | One of the arguments or one of the attributes of the `inputObject` that is required is absent |
| `EmailDeliveryError` | The email was not delivered successfully to the SMTP Service setup |

NOTE: `EmailDeliveryError` will be implemented, as it is currently a TODO to implement additionaly error handling

### MediaHandle
Takes a single input `mediaObjects` which contains a list of strings, where each string represents a piece of media in the form:
```
data:<mime type>/<mime subtype>;base64,<base64-encoded file data>
```
e.g.
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACFCAYAAACXBiBFAAAAAXNSR0IArs4c6Q...
```
The media handler takes all of the strings, which are assumed to have been validated, and uploads them to the external media handling solution through their API. Currently, this media handling solution is Cloudinary, and their API documentation is available [here](https://cloudinary.com/documentation/node_image_and_video_upload#server_side_upload).

The method returns a Promise. In the event that any upload fails, it immediately aborts and rejects with a `FailedUploadError`. If all uploads succeed, it resolves with a list of objects, containing for each piece of media the mimetype, index (in the original list), and url (that it was uploaded to).

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

## Miscellaneous Functions

### AuthenticationHandler
The authenticationHandler class provides a set of asynchronous static methods to perform token creation `TR`, and token regeneration `TR` auth type requests. There are two main functions `AuthenticationHandler.accountLogin()` for accountLogin requests, and `AuthenticationHandler.regenerateToken()` to regenerate a new token from a current one that is about to expire.

The `AuthenticationHandler.accountLogin()` has the following arguments:

| key | type | description |
|-----|------|-------------|
| `db` | Database, required | The Database object that allows the securitySchema object to make database queries |
| `query` | object, optional | Contains attributes that correspond to key/values in the request.body and request.head e.g. `query.password`, `query.email`|
| `inputToken` | string, optional | This is an optional argument to the function, but if it is not null, then an `InvalidTokenError` should be raised |

After awaiting for the function, if unsuccessful, one of the following errors should be thrown:

| error | description |
|-------|-------------|
| InvalidTokenError | A token was provided in the request eventhough this is a Token Creation `TR` type request |
| AbsentArgumentError | This is thrown if the query object is absent, or the attributes `query.password` or `query.email` are absent |
| DirtyArgumentError | This is thrown if the query attributes were found to have validation errors |
| InvalidCredentialsError | The credentials provided with the token for the `TC` type request was not valid |
| QueryExecutionError | The database query for a single user returned multiple results |
| PrivateKeyReadError | The privatekey file was unable to be read successfully |

Otherwise, it returns a `${JWT_Token}`

The `AuthenticationHandler.regenerateToken()` has the following arguments:

| key | type | description |
|-----|------|-------------|
| `token` | string, required | This is required in order to regenerate a new token |

After awaiting for the function, if unsuccessful, on of the following errors should be thrown:

| error | description |
|-------|-------------|
| AbsentArgumentError | A token wasn't provided with the request | 
| TamperedTokenError | The token provided with the request was tampered with |
| ExpiredTokenError | The token provided with the request has expired |
| NotBeforeError | The token provided with the request has not realized its NotBefore time yet |
| InvalidTokenError | Encompasses all other `JsonWebTokenError` (from jsonwebtoken npm module) exceptions as the default |
| PrivateKeyReadError | The privatekey file was unable to be read successfully |

Otherwise, it returns a `${JWT_Token}`

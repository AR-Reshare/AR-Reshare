/* This will define the pipeline functions - SecurityValidate, DataValidate, Store, APIRespond, PushRespond
 * and also the pipelines themselves - EntityCreate, EntityModify, EntityDelete, EntitySearch, EntityView
*/

class Pipeline {
    constructor() {} // constructor is deliberately empty

    SecurityValidate(authenticationType, token, rejectIfBanned) {
        // authType: a string from the following set:
        //      'admin' - the user must be logged in as an administrator
        //      an action (e.g. 'create-listing') - the user must be logged in, and must not have a sanction against the specified action
        //      'optional' - the user does not need to be logged in, but retrieve their user info if they are
        //      'logged-out' - the user should not be logged in
        // token: a JWT token for the function to validate against
        // rejectIfBanned: boolean value. If true, and authType is an action, reject when the user has a general OR specific sanction

        return new Promise((resolve, reject) => {
            // if the validation is satisfied then
                resolve(accountID);
                // accountID: primary key of the account in the database
            // otherwise
                reject(err);
                // err: an Error object representing the type of error, most likely 401 or 403
        });
    }

    DataValidate(requestSchema, inputObject) {
        // requestSchema: an object detailing which properties to validate, whether to include them in the output, and so on
        //      (see schemas/request-schemas.js)
        // inputObject: an object to validate. In most cases, this will be either request.body or request.query,
        //      with an accountID property added (the result of SecurityValidate)

        return new Promise((resolve, reject) => {
            // if the validation is successful
                resolve(outputObject);
                // outputObject: an object containing the validated and possibly transformed parameters specified in the requestSchema
            // otherwise
                reject(err);
                // err: an Error object representing the type of error, most likely 400 or 404
        });
    }

    Store(sqlTemplate, formatObject) {
        // sqlTemplate: the template SQL string, as in schemas/sql-templates.js
        // formatObject: an object containing values which can be passed into the template string. Can be the output of DataValidate

        return new Promise((resolve, reject) => {
            // if the operation is successful, and was a SELECT query (i.e. something that returns data)
                resolve(dbResponse);
                // dbResponse: an object containing the response from the database
            // if the operation is successful, and was an INSERT, UPDATE, or other non-data-returning query
                resolve(rowPK);
                // rowPK: the primary key of the row that was inserted/changed.
                //      If multiple rows were changed, rowPK will be an array of them
            // otherwise
                reject(err);
                // err: an Error object representing the type of error, most likely 404
        });
    }

    APIRespond(responseSchema, res, inputObject, err) {
        // responseSchema: an object detailing which values to include in the response, as per schemas/response-schemas.js
        // res: the response object provided by Express, for the response to be sent to
        // inputObject: the object containing values to put into the response. Can be the dbResponse from Store
        // err: an Error object representing the type of error, if an error occurred

        return new Promise((resolve, reject) => {
            // once the response is formulated
                // send status code and output object to res

                resolve(statusCode, outputObject);
                // statusCode: the status code responded with (e.g. 200, 400, 404)
                // outputObject: the object that is sent to the user
                // this is returned here as well mainly so that wrappers around the pipeline can check the success status
        });
    }

    PushRespond(pushSchema, inputObject, targetAccounts) {
        // pushSchema: an object detailing which values to include in the notification, as per schemas/push-schemas.js
        // inputObject: the object containing values to put into the notification. Can be the dbResponse from Store
        // targetAccounts: an array containing account IDs to send notifications to. Can be empty, can be of length 1

        return new Promise((resolve, reject) => {
            // a notification should be sent to each of the target accounts and
            resolve();
        });
    }
}

class CreateEntityPipeline extends Pipeline {
    // this is an example of a general-purpose pipeline, this one for Entity Creation
    // can be used in app.js as:
    
    // const CreateMessage = new CreateEntityPipeline('message', false, 'affected');
    // app.post('/conversation/message', CreateMessage.Execute);
    
    // for 'misc' pipelines, the same syntax is used generally but there's no need for a constructor,
    // and there'll probably only be one instance of it i.e.

    // const Login = new LoginPipeline();
    // app.post('/account/login', Login.Execute);

    constructor(entityType, isAdmin, notify) {
        // entityType: string describing the type of entity e.g. 'listing' or 'account'
        // isAdmin: boolean indicating whether this action is being performed by an administrator
        // notify: an optional string with one of the following values:
        //      'affected' - push notifications will be sent to other users who are connected to the new entity,
        //                   or to entities connected to the new entity
        //      'self' - push notifications will be sent to any other device the user who made the request is logged in to

        this.actionType = `create-${entityType}`;
        this.isAdmin = isAdmin;
        this.notify = notify;
    }

    Execute(req, res) {
        // req: the request object as per Express
        // res: the response object as per Express

        // a chain of then/catch statements including the various pipeline functions
        // req and res should be passed in as appropriate
        // should also include tests of this.notify
    }
}

module.exports({
    CreateEntityPipeline,
    // ...
    // add other pipeline types here as they are defined
});

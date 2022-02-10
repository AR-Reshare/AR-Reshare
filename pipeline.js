/* This will define the pipelines themselves - EntityCreate, EntityModify, EntityDelete, EntitySearch, EntityView
*/

const Pipeline = require('./classes/pipeline');

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

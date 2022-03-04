class Pipeline {
    constructor(db, emailTransporter, logger=console) {
        this.db = db; // expected to implement simpleQuery and complexQuery7
        this.emailTransporter = emailTransporter;
        this.logger = logger; // expected to implement .log, .error, and .warn

        this.SecurityValidate = this.SecurityValidate.bind(this);
        this.DataValidate = this.DataValidate.bind(this);
        this.Store = this.Store.bind(this);
        this.APIRespond = this.APIRespond.bind(this);
        this.PushRespond = this.PushRespond.bind(this);
    }

    /**
     * Validates an input object against a security schema
     * @param {SecurityValidate} SecuritySchema An instance of a validation object for a given resource
     * @param {string} token A string that should be a valid JWT token instance
     * @param {object} query An object, most likely request.body or request.query, to validate
     * @returns {Promise<object>} Once resolved, this should return the userID
     */
    SecurityValidate(securitySchema, token, query) {
        return new Promise((resolve, reject) => {
            let userID;
            try {
                userID = securitySchema.process(this.db, token, query);
                // console.log(userID);
                resolve(userID);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Validates an input object against a request schema
     * @param {RequestTemplate} requestSchema An instance of RequestTemplate to validate against
     * @param {object} inputObject An object, most likely request.body or request.query, to validate
     * @returns {Promise<object>} Key/value pairs selected from inputObject by requestSchema and sanitised
     */
    DataValidate(requestSchema, inputObject) {
        return new Promise((resolve, reject) => {
            let outputObject;

            try {
                outputObject = requestSchema.process(inputObject);
                resolve(outputObject);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Creates and executes a transaction on the database
     * @param {SQLTemplate} sqlTemplate Template of the SQL transaction, from the SQLTemplate class
     * @param {object} formatObject Object whose values to insert into the transaction
     * @returns 
     */
    Store(sqlTemplate, formatObject) {
        return new Promise((resolve, reject) => {
            
            let names, transaction;
            // build transaction
            try {
                let built = sqlTemplate.build(formatObject);
                names = built[0];
                transaction = built[1];
            } catch (err) {
                reject(err); // 400
            }
            
            let prepAndResolve = (result) => {
                let out;
                try {
                    out = sqlTemplate.prepareResults(names, result);
                    resolve(out);
                } catch (err) {
                    reject(err);
                }
            };

            // execute transaction
            if (transaction.length === 0) {
                resolve([]); // no queries, so don't do anything
            } else if (transaction.length === 1) {
                if ('values' in transaction[0]) {
                    this.db.simpleQuery(transaction[0].text, transaction[0].values).then(prepAndResolve, reject);
                } else {
                    this.db.simpleQuery(transaction[0].text).then(prepAndResolve, reject);
                }
            } else {
                this.db.complexQuery(transaction).then(prepAndResolve, reject);
            }
        });
    }

    /**
     * Creates and executes a transaction on the database
     * @param {emailTemplate} emailTemplate Template of the email transaction, from the emailTemplate class
     * @param {object} inputObject Object whose values to insert into the email transaction
     * @returns 
     */
    EmailRespond(emailTemplate, email, argsReplaceObject) {
        return new Promise((resolve, reject) => {
            let out;
            try {
                out = emailTemplate.process(this.emailTransporter, email, argsReplaceObject);
                resolve(out);
            } catch (err){
                reject(err);
            }
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

module.exports = Pipeline;

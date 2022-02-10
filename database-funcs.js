/**
 * This file creates the database connection and implements some low-level functions for accessing the database.
 * Pipeline.Store, and whatever other functions end up accessing the database, should do so by calling something in this file.
 */

const {Pool} = require('pg');
const isCallable = require('is-callable');

class QueryError extends Error {
    // Represents an error in constructing or executing a query
    constructor(message) {
        super(message);
        this.name = "QueryError";
    }
}

class DatabaseConnectionError extends Error {
    // Represents an error in establishing connection to the database
    constructor(message) {
        super(message);
        this.name = "DatabaseConnectionError";
    }
}

class DBClientNotAvailableError extends Error {
    // Represents an error in accessing a postgres client
    constructor(message) {
        super(message);
        this.name = "DBClientNotAvailableError";
    }
}

class QueryConstructionError extends QueryError {
    // Represents an error in constructing a query
    // i.e. Node-side
    constructor(message) {
        super(message);
        this.name = "QueryConstructionError";
    }
}

class QueryExecutionError extends QueryError {
    // Represents an error in executing a query
    // i.e. PostgreSQL-side
    constructor(message) {
        super(message);
        this.name = "QueryExecutionError";
    }
}

const nextQueryHandler = (client, queries, result=[]) => {
    // treats queries as a queue, pops the first one and executes, then recurses
    return new Promise((resolve, reject) => {
        let nextquery = queries.shift();

        let text, values = [];

        // get query text
        if ('text' in nextquery) {
            text = nextquery.text;
        } else {
            reject(new QueryConstructionError('No query text provided'));
            return;
        }

        // get query values
        if ('values' in nextquery) {
            for (let elem of nextquery.values) {
                let temp = elem;
                if (isCallable(elem)) {
                    // execute backreference
                    try {
                        temp = elem(result);
                    } catch (e) {
                        reject(new QueryConstructionError('Error in Backreference'));
                        return;
                    }

                    if (temp === undefined) {
                        throw new QueryConstructionError('Backreference did not resolve to a value');
                    }
                }

                values.push(temp);
            }
        }

        client.query(text, values).then(res => {
            // the query executed successfully
            result.push(res.rows);

            if (queries.length == 0) {
                // base case
                return client.query('COMMIT');
            } else {
                // recursive case
                return nextQueryHandler(client, queries, result);
            }
        }).then(() => resolve(result), reject); // propogate resolve or reject back to top level
    });
};

class Database {
    /**
     * Create a new Database object for querying
     * @param {Object} db_credentials The credentials to use to access the database (e.g. connection.json).
     */
    constructor (db_credentials) {
        try {
            this.pool = new Pool(db_credentials);
        } catch (e) {
            throw new DatabaseConnectionError('Unable to connect to Postgres instance');
        }
    }

    /**
     * Executes a query on the database
     * @async
     * @param {string} queryTemplate - The query to execute, which may be parameterised 
     * @param {string[]} [values=[]] - (Optional, Array) The values to substitute into the parameterised query
     * @returns {Promise<Object[]>} Promise object which resolves with an array of results from the query. Each object in the array corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
     */
    simpleQuery = (queryTemplate, values=[]) => {
        return new Promise((resolve, reject) => {
            this.pool.query(queryTemplate, values).then(res => {
                // query executed correctly
                resolve(res.rows);
            }).catch(err => {
                // query failed
                reject(new QueryExecutionError(err.message));
            });
        });
    }

    /**
     * Executes a set of queries in order as a single transaction. If there is only one query, use simpleQuery instead.
     * @async
     * @param {Object[]} queries - An array of query objects to be executed. Can be either strings, with no parameters, or objects with:
     * queries.text - The query to execute, which may be parameterised;
     * queries.values - (Optional, Array) The values to substitute into the parameterised query. If a value is a function, it is called on the existing set of results at the time.
     * @returns {Promise<Object[][]>} Promise object which resolves with an array of arrays containing the results from each query. Subarrays correspond to queries i.e. results of the 3rd query will be in the 3rd position of the array. Each object in a subarray corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
     */
    complexQuery = (queries) => {
        return new Promise((resolve, reject) => {
            this.pool.connect().then(client => {
                // a client was available to service the request

                let finish;

                client.query('BEGIN').then(() => {
                    // recurse on the queries
                    return nextQueryHandler(client, queries);
                }).then(result => {
                    // all queries executed non-exceptionally
                    finish = () => resolve(result);
                    return;
                }).catch(err => {
                    // a query failed
                    if (!(err instanceof QueryError)) {
                        // cast non-QueryErrors to QueryExecutionError
                        err = new QueryExecutionError(err.message);
                    }
                    finish = () => reject(err);
                    return client.query('ROLLBACK');
                }).finally(() => {
                    // release the client and resolve/reject
                    client.release();
                    finish();
                });
            }).catch(err => {
                // no client was available, reject and exit
                reject(new DBClientNotAvailableError(err.message));
            });
        });
    }

    end() {
        this.pool.end();
    }
}

module.exports = Database;

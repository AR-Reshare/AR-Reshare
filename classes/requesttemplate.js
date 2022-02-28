const isCallable = require("is-callable");
const { TemplateError, AbsentArgumentError, UnprocessableArgumentError, InvalidArgumentError, DirtyArgumentError } = require("./errors");

class RequestTemplate {

    /**
     * Constructs a RequestTemplate and validates it
     * @param {Array<object>} params An array of parameter objects. Each must contain a string in_name, plus optional string out_name, boolean required, Array<callable> conditions, and callable sanitise.
     */
    constructor(params) {
        this.params = params.map(parameter => {
            let out = {};

            // in_name
            if (!('in_name' in parameter)) {
                throw new TemplateError('in_name not provided');
            } else if (!(typeof parameter['in_name'] === 'string' || parameter['in_name'] instanceof String)) {
                throw new TemplateError('in_name not a string');
            } else if (parameter['in_name'].length === 0) {
                throw new TemplateError('in_name empty');
            } else {
                out.in_name = parameter['in_name'];
            }

            // out_name
            if (!('out_name' in parameter)) {
                out.out_name = out.in_name;
            } else if (!(typeof parameter['out_name'] === 'string' || parameter['out_name'] instanceof String )) {
                throw new TemplateError('out_name not a string');
            } else if (parameter['out_name'].length === 0) {
                throw new TemplateError('out_name empty');
            } else {
                out.out_name = parameter['out_name'];
            }

            // required
            if (!('required' in parameter)) {
                out.required = false;
            } else if (!(parameter['required'] === true || parameter['required'] === false)) {
                throw new TemplateError('required is not a boolean');
            } else {
                out.required = parameter['required'];
            }

            // conditions
            if (!('conditions' in parameter)) {
                out.conditions = [];
            } else if (!Array.isArray(parameter['conditions'])) {
                throw new TemplateError('conditions is not array');
            } else if (parameter['conditions'].some(c => !isCallable(c))) {
                throw new TemplateError('one or more conditions is not callable');
            } else {
                out.conditions = parameter['conditions'];
            }

            // sanitise
            if (!('sanitise' in parameter)) {
                out.sanitise = a=>a;
            } else if (!isCallable(parameter['sanitise'])) {
                throw new TemplateError('sanitise is not callable');
            } else {
                out.sanitise = parameter['sanitise'];
            }

            return out;
        });
    }

    /**
     * Validates and sanitises the input object
     * @param {object} inputObject The object to validate
     * @returns {object} A sanitised version of the object, possibly with keys removed and/or renamed
     */
    process(inputObject) {
        let outputObject = {};

        this.params.forEach(parameter => {
            if (!(parameter.in_name in inputObject)) {
                // check for presence in input
                if (parameter.required) {
                    throw new AbsentArgumentError(`${parameter.in_name} is required and not provided`);
                }
            } else if (!parameter.conditions.every(c => {
                    try{
                        return c(inputObject[parameter.in_name], inputObject);
                    } catch (err) {
                        throw new UnprocessableArgumentError(`${parameter.in_name} could not be processed`);
                    }
                })) {
                // validate
                throw new InvalidArgumentError(`${parameter.in_name} is not valid`);
            } else {
                // transform
                let clean;
                try {
                    clean = parameter.sanitise(inputObject[parameter.in_name]);
                    outputObject[parameter.out_name] = clean;
                } catch (err) {
                    throw new DirtyArgumentError(`Unable to sanitise ${parameter.in_name}`);
                }
            }
        });

        return outputObject;
    }
}

module.exports = RequestTemplate;

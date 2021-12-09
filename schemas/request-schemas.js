/* This file will contain Request Parameter Validation Schemas, in this format:

requestValidationSchema['create-listing'] = [
    {
        name: "some_parameter", // the name of the parameter in the request object

        required: true, // whether to reject automatically if this parameter isn't present

        validationFunctions: [
            (val)=>{return val <= 20;},
            (val)=>{return DoesExist(...conditions)},
        ], // list of functions to run on the parameter, valid if all functions return true

        includeInResult: true, // whether to include this parameter in the formatted output

        transform: SomeParameterToResultFunction // the result of this function will be included in the formatted output, if it is specified and includeInResult is set to true. If undefined, the parameter is passed through directly
    }
]

*/
// This ApiError class is a custom error class in JavaScript that extends the built-in Error class. It is designed to standardize API error handling by including additional properties such as statusCode, errors, and success
class API_Error extends Error{
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)     //❌ Error: Must call super before using 'this' in derived class constructor, and super keyword is essential in inheritance
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;      
        this.data = null;
        this.success = false;
        // stack trace 
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {API_Error}
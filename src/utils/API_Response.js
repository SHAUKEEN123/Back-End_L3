// Why Use ApiResponse in Production?
// API responses
class API_Response{
    constructor(statusCode, data, message= "Success"){
        this.statusCode =statusCode;
        this.data = data;
        this.message =message;
        this.success = statusCode < 400   //Automatically sets success to true if the status code is below 400 (indicating a successful response). Otherwise, it's false (indicating an error).
        
    }
}

export {API_Response}
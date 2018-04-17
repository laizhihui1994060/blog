let getErrorInfo = require('./getErrorInfo')

module.exports = class ErrorApi extends Error{
    constructor(errorName){
        super();
        let error_info = getErrorInfo(errorName);

        this.code = error_info.code;
        this.msg = error_info.msg;
        this.name = error_info.name;
    }
}

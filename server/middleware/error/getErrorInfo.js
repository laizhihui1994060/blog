const errorApi = require('../../errorApi');

module.exports =  (error_name) => {
    
    let error_info;

    if (errorApi[error_name])error_info = errorApi[error_name];

    if (!error_info)error_info = errorApi['UNKNOW_ERROR'];

    return error_info;
}
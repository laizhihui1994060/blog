const ModuleDB = require('./ModuleDB');

class User extends ModuleDB{
    get table (){
        return 'user_tbl';
    }

    get primary(){
        return 'user_id';
    }

    get fields(){
        return ['user_id','user_name','user_pass','user_email','user_phone'];
    }
}

module.exports = User;
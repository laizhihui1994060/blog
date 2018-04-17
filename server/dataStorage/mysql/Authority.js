const ModuleDB = require('./ModuleDB');

class Authority extends ModuleDB{
    get table (){
        return 'user_authority_tbl';
    }

    get primary(){
        return 'user_authority_id';
    }

    get fields(){
        return ['user_authority_id','params'];
    }
}

module.exports = Authority;
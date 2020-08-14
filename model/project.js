
const sql = require('./db.js')
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var datetime = require('node-datetime');
const Project = function (project) {
    var dt = datetime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    this.name = project.name,
    this.created_on = formatted
}
Project.addProject = async (newProject, result) => {
    var dt = datetime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    let value = {
        name:  newProject.name,
        created_on:formatted,
        updated_on: formatted,
        status: 1
    }
    try {
        let sql_project = "SELECT * FROM tb_project where name ="+"'"+value.name+"'"
        const check_project = await query(sql_project)
        if(check_project.length >0){
            result(null,{ status_code: 404,Message: "name is Duplicate"})
        }
        else{
            let sql_syntax = "INSERT INTO tb_project SET ?"
            const res = await query(sql_syntax,value)
            result(null, { id: res.insertId, ...newProject })
        }
    }catch (error) {
    result(error, null)
  }
}
Project.getAll = async result => {
 
  
    try {
      const row = await query( 'SELECT * FROM tb_project where status=1' );

      console.log("res",row)
      result(null, row)
    } catch (error) {
      console.error(error)
      result(error, null)
    }
  }
module.exports = Project
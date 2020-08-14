
const sql = require('./db.js')
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var datetime = require('node-datetime');
const Event = function (project) {
    var dt = datetime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    this.title_th = project.title_th,
    this.title_en = project.title_en,
    this.detail_en = project.detail_en,
    this.detail_th = project.detail_th,
    this.start_date = project.start_date,
    this.end_date = project.end_date,
    this.project_id = project.project_id,
    this.created_on = formatted,
    this.updated_on = formatted
}
Event.register = async (newEvent, result) => {
    let dt = datetime.create();
    let formatted = dt.format('Y-m-d H:M:S');
    let value = {
        title_th:  newEvent.title_th,
        title_en:  newEvent.title_en,
        detail_en:  newEvent.detail_en,
        detail_th:  newEvent.detail_th,
        start_date: newEvent.start_date,
        end_date:   newEvent.end_date,
        project_id: newEvent.project_id,
        created_on:formatted,
        updated_on: formatted,

    }
    try {
        let sql_project = "SELECT * FROM tb_project where id ="+"'"+value.project_id+"'"
        const check_project = await query(sql_project)
        if(check_project.length <= 0){
            result(null,{ status_code: 404,Message: "Project Id is not found"})
        }
        else{
            let sql_syntax = "INSERT INTO tb_event SET ?"
            const res = await query(sql_syntax,value)
            result(null, { id: res.insertId, ...newEvent })
        }
    }catch (error) {
    result(error, null)
  }
}
// Project.getAll = async result => {
//     try {
//       const row = await query( 'SELECT * FROM tb_project where status=1' );

//       console.log("res",row)
//       result(null, row)
//     } catch (error) {
//       console.error(error)
//       result(error, null)
//     }
// }
module.exports = Event;
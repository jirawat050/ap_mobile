const Event = require('../model/event.js')
const { Validator } = require('node-input-validator');
exports.register = (req, res) => {
    if (!req.body) {
        res.status(400).send({
          message: 'Content can not be empty!'
        })
    }
    const event = new Event({
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        title_th: req.body.title_th,
        title_en: req.body.title_en,
        detail_th: req.body.detail_th,
        detail_en: req.body.detail_en,
        project_id: req.body.project_id
    })
    const v = new Validator (event, {
        start_date:'required|dateFormat:YYYY-MM-DD',
        end_date: 'required|dateFormat:YYYY-MM-DD',
        title_th: 'required',
        title_en: 'required',
        project_id: 'required|integer',
        detail_th: 'required',
        detail_en: 'required',
   
    });
    v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      });
        Event.register(event, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
                err.message || 'Some error occurred while register the Event.'
          })
        } else res.send(data)
    })
}
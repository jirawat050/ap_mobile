const Project = require('../model/project.js')
const { Validator } = require('node-input-validator');
exports.addProject = (req, res) => {
    if (!req.body) {
        res.status(400).send({
          message: 'Content can not be empty!'
        })
    }
    const project = new Project({
        name: req.body.name,

    })
    const v = new Validator (project, {
        name: 'required',
    });
    v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      });
      Project.addProject(project, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
                err.message || 'Some error occurred while register the User.'
          })
        } else res.send(data)
    })
}
exports.getAll = (req, res) => {
    Project.getAll((err, data) => {
        console.log("data",data)
        if (err) {
            res.status(404).json({
                status: 404,
                "text": "PAGE NOT FOUND"
        });
        } else     res.status(404).json({
            status: 404,
            "text": data
          });
      })
}
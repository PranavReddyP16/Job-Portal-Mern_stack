const router = require('express').Router();

const Job = require('../models/Job');

//Get all active Jobs

router.route("/").get(function(req, res) {
    Job.find(function(err, jobs) {
        if (err)
            console.log(err);
        else {
            console.log(jobs);
            res.json(jobs);
        }
    });
});

module.exports = router;

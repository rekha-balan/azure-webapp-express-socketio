// Chris Joakim, Microsoft, 2018/10/08

const express = require('express');
const router  = express.Router();
const m26     = require("m26-js");

router.get('/calc', function(req, res) {
    res.json({error: "Invoke this endpoint via HTTP POST, not GET"});
});

router.post('/calc', function(req, res) {
    try {
        console.log(req.body);
        var date1 = req.body.date1;
        var date2 = req.body.date2;
        var age   = m26.AgeCalculator.calculate(date1, date2);
        var result = {};
        result['date1'] = date1;
        result['date2'] = date2;
        result['age']   = age.val();
        res.json(result);
    }
    catch (err) {
        res.status(400);
        res.send('error');
    }
});

// curl -d '{"date1": "2000-08-04", "date2": "2017-12-28"}' -H "Content-Type: application/json" -X POST http://localhost:3000/age/calc

module.exports = router;

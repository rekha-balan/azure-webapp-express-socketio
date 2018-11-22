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
        var run_hhmmss  = req.body.run_hhmmss;
        var run_ppm     = req.body.run_ppm;
        var walk_hhmmss = req.body.walk_hhmmss;
        var walk_ppm    = req.body.walk_ppm;
        var miles       = Number(req.body.miles);

        var result = {};
        result['run_hhmmss'] = run_hhmmss;
        result['run_ppm']  = run_ppm;
        result['walk_hhmmss'] = walk_hhmmss;
        result['walk_ppm'] = walk_ppm;
        result['miles'] = miles;

        var calc = m26.RunWalkCalculator.calculate(run_hhmmss, run_ppm, walk_hhmmss, walk_ppm, miles)

        result['avg_mph']   = calc.avg_mph;
        result['avg_ppm']   = calc.avg_ppm;
        result['proj_time'] = calc.proj_time;
        res.json(result);
    }
    catch (err) {
        res.status(400);
        res.send('error');
    }
});

// curl -d '{"run_hhmmss": "9:15", "run_ppm": "9:00", "walk_hhmmss": "0:45", "walk_ppm": "18:00", "miles": 26.2}' -H "Content-Type: application/json" -X POST http://localhost:3000/runwalk/calc

module.exports = router;

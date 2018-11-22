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
        var dist  = Number(req.body.dist);
        var uom   = req.body.uom;
        var time  = req.body.time;
        var dist2 = Number(req.body.dist2);

        var d = new m26.Distance(dist, uom);
        var t = new m26.ElapsedTime(time);
        var s = new m26.Speed(d, t);
        
        var result = {};
        result['dist'] = dist;
        result['uom']  = uom;
        result['time'] = time;
        result['dist2'] = dist2;
        result['pace_per_mile'] = s.pace_per_mile();
        result['seconds_per_mile'] = s.seconds_per_mile();
        result['mph'] = s.mph();
        result['kph'] = s.kph();
        result['yph'] = s.yph();

        if ((dist2 != null) && (dist2 > 0)) {
            var d2 = new m26.Distance(dist2, uom);
            result['dist2_projected_time'] = s.projected_time(d2);
        }
        else {
            result['dist2_projected_time'] = null;
        }
        res.json(result);
    }
    catch (err) {
        res.status(400);
        res.send('error');
    }
});

// curl -d '{"uom": "m", "dist": 26.2, "time": "03:47:30", "dist2": 20.0}' -H "Content-Type: application/json" -X POST http://localhost:3000/pace/calc
// curl -d '{"uom": "m", "dist": 26.2, "time": "03:47:30"}' -H "Content-Type: application/json" -X POST http://localhost:3000/pace/calc

module.exports = router;

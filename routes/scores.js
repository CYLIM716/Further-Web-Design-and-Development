const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/scores", function(req, res){
    if (!req.session.username) {
        return res.redirect("/login");
    }

    const username = req.session.username;

    const playerSql = 'SELECT PlayerID FROM players WHERE Username = ?';

    db.query (playerSql, [username], function(err, playerResults) {
        if (err) {
            console.log(err);
            return res.send("Database error");
        }

        if (playerResults.length === 0) {
            return res.send("Player not found");
        }

        const playerID = playerResults[0].PlayerID;

        const scoreSql = 'SELECT SUM(Score) AS totalScore FROM user_progress WHERE PlayerID = ?';
        db.query (scoreSql, [playerID], function(err, scoreResults) {
            if (err) {
                console.log(err);
                return res.send("Database error");
            }

            const totalScore = scoreResults[0].totalScore || 0;


            res.render("scores", {
                username: username,
                score: totalScore
            });
        })
    })
});

module.exports = router;
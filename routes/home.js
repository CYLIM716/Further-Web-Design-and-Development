const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/home", function (req, res) {
    if (!req.session.username) {
        req.session.returnTo = req.originalUrl;
        return res.redirect("/login");
    }

    const playerID = req.session.playerId;

    const progressSql = `
        SELECT q.SegmentID,
               COUNT(*) AS total,
               COUNT(up.QuestionID) AS done
        FROM questions q
        LEFT JOIN user_progress up
               ON up.QuestionID = q.QuestionID AND up.PlayerID = ?
        GROUP BY q.SegmentID
        ORDER BY q.SegmentID
    `;

    const boardSql = `
        SELECT p.Username, SUM(up.Score) AS total
        FROM user_progress up
        JOIN players p ON p.PlayerID = up.PlayerID
        GROUP BY p.PlayerID, p.Username
        ORDER BY total DESC
        LIMIT 5
    `;

    db.query(progressSql, [playerID], function (err, progressRows) {
        if (err) { console.log(err); return res.send("Database error"); }

        db.query(boardSql, function (err, boardRows) {
            if (err) { console.log(err); return res.send("Database error"); }

            const progress = progressRows.map(r => ({
                segmentID: r.SegmentID,
                done: Number(r.done),
                total: Number(r.total),
                percent: Math.round(Number(r.done) / Number(r.total) * 100)
            }));

            res.render("home", {
                username: req.session.username,
                progress: progress,
                leaderboard: boardRows
            });
        });
    });
});

module.exports = router;
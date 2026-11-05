const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/quiz/segment/:segmentID", function (req, res) {

    if (!req.session.username) {
        req.session.returnTo = req.originalUrl;
        return res.redirect("/login");
    }

    const segmentID = req.params.segmentID;
    const username = req.session.username;

    const playerSql = "SELECT PlayerID FROM players WHERE Username = ?";

    db.query(playerSql, [username], function (err, playerResults) {

        if (err) {
            console.log(err);
            return res.send("Database error");
        }

        if (playerResults.length === 0) {
            return res.send("Player not found");
        }

        const playerID = playerResults[0].PlayerID;


        const scoreSql = `
            SELECT SUM(Score) AS totalScore
            FROM user_progress
            WHERE PlayerID = ?
        `;

        db.query(scoreSql, [playerID], function (err, scoreResults) {

            if (err) {
                console.log(err);
                return res.send("Database error");
            }

            const totalScore = scoreResults[0].totalScore || 0;


            // Find a question that the player has NOT completed
            const questionSql = `
                SELECT *
                FROM questions
                WHERE SegmentID = ?
                AND QuestionID NOT IN (
                    SELECT QuestionID
                    FROM user_progress
                    WHERE PlayerID = ?
                )
                LIMIT 1
            `;

            db.query(
                questionSql,
                [segmentID, playerID],
                function (err, results) {

                    if (err) {
                        console.log(err);
                        return res.send("Database error");
                    }

                    if (results.length === 0) {
                        return res.render("quiz", {
                            question: null,
                            finished: true,
                            segmentID: Number(segmentID), 
                            score: totalScore,
                            result: "",
                            username: req.session.username
                        });
                    }

                    const row = results[0];
                    const isFill = !row.OptionA;

                    const question = {
                        id: row.QuestionID,
                        segmentID: row.SegmentID,
                        text: row.QuestionText,
                        type: isFill ? "fill" : "mcq",
                        options: [
                            { id: 1, text: row.OptionA },
                            { id: 2, text: row.OptionB },
                            { id: 3, text: row.OptionC },
                            { id: 4, text: row.OptionD }
                        ]
                    };

                    const result = req.session.result || "";
                    req.session.result = "";
                    
                    res.render("quiz", {
                        question: question,
                        score: totalScore,
                        result: result,
                        username: req.session.username
                    });

                }
            );
        });
    });
});

router.post("/quiz/submit", function (req, res) {

    if (!req.session.username) {
        return res.redirect("/login");
    }

    const userAnswer = req.body.answer;
    const questionID = req.body.questionID;
    const segmentID = req.body.segmentID;
    const username = req.session.username;


    const playerSql = "SELECT PlayerID FROM players WHERE Username = ?";

    db.query(playerSql, [username], function (err, playerResults) {

        if (err) {
            console.log(err);
            return res.send("Database error");
        }

        if (playerResults.length === 0) {
            return res.send("Player not found");
        }

        const playerID = playerResults[0].PlayerID;


        const questionSql = `
            SELECT CorrectAnswer
            FROM questions
            WHERE QuestionID = ?
        `;

        db.query(questionSql, [questionID], function (err, results) {

            if (err) {
                console.log(err);
                return res.send("Database error");
            }

            if (results.length === 0) {
                return res.send("Question not found");
            }

            const correctAnswer = results[0].CorrectAnswer;
            const accepted = String(correctAnswer).split("|").map(s => s.trim().toLowerCase());
            const given = String(userAnswer).trim().toLowerCase();

            if (accepted.includes(given)) {

                req.session.result = "Correct Answer";


                const progressSql = `
                    INSERT INTO user_progress
                    (PlayerID, SegmentID, QuestionID, Completed, Score, CompletedAt)
                    VALUES (?, ?, ?, TRUE, 1, NOW())
                `;

                db.query(
                    progressSql,
                    [playerID, segmentID, questionID],
                    function (err, result) {

                        if (err) {
                            console.log(err);
                            return res.send("Database error");
                        }

                        res.redirect("/quiz/segment/" + segmentID);
                    }
                );

            }
            else {

                req.session.result = "Incorrect Answer";

                res.redirect("/quiz/segment/" + segmentID);
            }

        });
    });
});


module.exports = router;
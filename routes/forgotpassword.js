const express = require('express');
const router = express.Router();
const db = require("../db");

router.get('/forgotpassword', function(req, res){
    res.render('forgotpassword', { errorMessage: null });
});

router.post('/forgotpassword', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password !== confirmpassword) {
        return res.render('forgotpassword', { errorMessage: "Password not consistent" });
    }

    db.query(
        "SELECT * FROM players WHERE Username = ?",
        [username],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Server error");
            }

            if (results.length === 0) {
                return res.render('forgotpassword', { errorMessage: "User not exist" });
            }

            db.query(
                "UPDATE players SET Password = ? WHERE Username = ?",
                [password, username],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Server error");
                    }
                    res.redirect("/login");
                }
            );
        }
    );
});

module.exports = router;
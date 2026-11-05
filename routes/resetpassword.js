const express = require('express');
const router = express.Router();
const db = require("../db");

router.get('/resetpassword', function(req, res){
    if (!req.session.username) {
        return res.redirect("login");
    }

    res.render('resetpassword', {
        username: req.session.username,
        playerId: req.session.playerId,
    });
});

router.post('/resetpassword', function(req, res){
    if (!req.session.username) {
        return res.redirect("/login");
    }

    const username = req.session.username;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password !== confirmpassword){
        return res.render('resetpassword', {errorMessage: "The password is not consistent"});
    }

    db.query(
        "SELECT * FROM players WHERE Username = ?", 
        [username],
        (err, results) => {
            if (err){
                console.error(err);
                return res.status(500).send("Server error");
            }

            if (results.length === 0) {
                return res.render('resetpassword', {errorMessage: "Incorrect Username"});
            }

            db.query(
                "UPDATE players SET Password = ? WHERE Username = ?",
                [password, username],
                (err) => {
                    if (err){
                        console.error(err);
                        return res.status(500).send("Server error");
                    }
                    res.redirect('/profile');
                }
            )
        }
    );
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require("../db");

router.get("/signup", function(req, res){
    res.render('signup', {errorMessage: null});
});

router.post('/signup', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password !== confirmpassword){
        return res.render('signup', {errorMessage: "The password is not consistent"})
    }

    db.query(
        "SELECT * FROM players WHERE Username = ?", 
        [username],
        (err, results) => {
            if (err){
                console.error(err);
                return res.status(500).send("Server error");
            }

            if (results.length > 0){
                return res.render('signup', {errorMessage: "The username is exist"});
            }

            db.query(
                "INSERT INTO players (Username, Password) VALUES (?, ?)",
                [username, password],
                (err) => {
                    if (err){
                        console.error(err);
                        return res.status(500).send("Server error");
                    }
                    res.redirect("/login");
                }
            ) 
        }
    )
});

module.exports = router;
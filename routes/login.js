const express = require('express'); 
const router = express.Router(); 
const db = require("../db");

router.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "SELECT * FROM players WHERE Username = ? AND Password = ?", 
        [username, password],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Server error");
            }

            if (results.length > 0 ){
                req.session.username = results[0].Username;
                req.session.playerId = results[0].PlayerID;

                const redirectTo = req.session.returnTo || "/home";
                delete req.session.returnTo; 
                res.redirect(redirectTo);
            } else{
                res.redirect("/login?error=1");
            }
        }
    )
});

module.exports = router;

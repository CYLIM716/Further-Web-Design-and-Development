const express = require('express');
const router = express.Router();

router.get('/profile', function(req, res){
    if (!req.session.username) {
        return res.redirect("/login");
    }

    res.render("profile", {
        username: req.session.username
    });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
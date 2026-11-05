// 1. Import Dependencies:
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const mysql = require("mysql2");
const db = require("./db");
const session = require('express-session');

//2. Initialize the App:
const app = express();

//3. Set Up Middleware:
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'usernamesave',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);
const quizRoutes = require('./routes/quiz');
app.use('/', quizRoutes);
const profileRoutes = require('./routes/profile');
app.use('/', profileRoutes);
const scoresRoutes = require('./routes/scores');
app.use('/', scoresRoutes);
const resetpswRoutes = require('./routes/resetpassword');
app.use('/', resetpswRoutes)
const signupRoutes = require('./routes/signup');
app.use('/', signupRoutes);
const forgotpasswordRoutes = require('./routes/forgotpassword');
app.use('/', forgotpasswordRoutes);
const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

//4. Set Up View Engine:
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//5. Define Routes:
app.get("/login", function (req, res) {
    const errorMessage = req.query.error ? "Incorrect username, playerID or password!" : null;
    res.render("login", { errorMessage: errorMessage });
});

//6. Start the Server:
app.listen(1000, function () {
    console.log("Example app listening on port 1000!");
});

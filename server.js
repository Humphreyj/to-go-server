const express = require('express');
const session = require('express-session');
const Ddos = require('ddos');
const ddos = new Ddos({burst: 10, limit: 15});
const logger = require('log4js')
    .configure( {
        appenders: {errors: {type:"file", filename:'errors.log'}},
        categories: {default: {appenders: ['errors'], level: 'error'}},
    })
    .getLogger('errors');
const passport = require('passport');
const cors = require('cors');

const app = express();

//security
app.use(require("helmet")());
app.use(ddos.express);

const whiteList = [
    "http://localhost:3000",
	"http://localhost:3001",
	process.env.CLIENT_URL,
]
app.use(require('cors')({
    preflightContinue: true,
    credentials: true,
    origin: function(origin, cb){
        if (whiteList.includes(origin) || !origin) {
            cb(null, true)
        }else {
            cb( new Error('Not allowed by CORS'))
        }
    }
}))
app.use(express.json());
app.use(require('cookie-parser')(process.env.SESSION_SECRET));

//passport middleware
app.use(passport.initialize());

//sessions
const Knex = require('knex');
const knexfile = require('./knexfile');
const knex = require('./data/db_config');
const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({
    knex: knex,
    tablename: 'auth_sessions',
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            path: '/',
            secure: false,
            httpOnly: false,
            expires:  1800000,
            maxAge: 1000000000,
        },
        store: store,
    })
);

app.use(passport.session());

//Routes 
app.use('/api', require("./routes/router-index"));

//Error Handling
let errors = 0;
app.use((error, req, res, next) => {
    logger.error(error);
    errors ++;
    console.log(`There are ${erros} server errors.`);
    console.log(error.message);
    return res.status(500).json("There was a dang server error.")
});
module.exports = app;
module.exports.store = store;


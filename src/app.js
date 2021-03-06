require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');
const bookmarkRouter = require('./bookmark-router');
const app = express();

const morganOption = (NODE_ENV === 'production')? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req,res,next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        // console.log(authToken.split(' ')[1], 'AUTH', apiToken, 'API')
        return res.status(401).json({error: 'Unathorized request'})
    };
    // console.log(authToken.split(' ')[1], 'AUTH', apiToken, 'API')
    next();
})


app.use(bookmarkRouter);

app.get('/api', (req, res) => {
    res.send('Hello from bookmarks!')
});

app.use(function errorHandler(error, req, res, next) { 
    let response;
    if(NODE_ENV === 'production') {
        response = { error: { message: 'server error'} }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app;


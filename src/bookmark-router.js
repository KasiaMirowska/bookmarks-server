const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const { bookmarks } = require('./store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.status(200).json(bookmarks)
    });

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id)

        if(!bookmark) {
            logger.error(`bookmark with id ${id} not found`);
            res.status(404).send('bookmark not found')
        }
        res.json(bookmark);
    })

module.exports = bookmarkRouter;
const express = require('express');
const logger = require('./logger');
const validUrl = require('valid-url');
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const BookmarksServices = require('./bookmarks-services');
const app = require('./app');
const xss = require('xss');
const path = require('path');


const serializeBookmark = (bookmark) => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    description: xss(bookmark.description),
    url: bookmark.url,
    rating: Number(bookmark.rating),
})
bookmarkRouter
    .route('/api/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksServices.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { title, url, description = '', rating } = req.body;
        const newBookmark = { title, url, description, rating }
       
        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                logger.error(`${key} is required`)
                return res.status(400).json({ error: { message: `Missing ${key}` } })
            }
        }
        if (!validUrl.isUri(url)) {
            logger.error('not a valid URL');
            return res.status(400).json('Not a valid URL')
        }
        if (typeof rating !== 'number') {
            logger.error('rating must be a number');
            return res.status(400).json('Invalid data')
        }
        if (rating < 1 || rating > 5) {
            logger.error('rating must be a number between 1 and 5');
            return res.status(400).json('Rating must be a number between 1 and 5')
        }

        BookmarksServices.insertNewBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                console.log("HEREHEREEHRERERERERE")
                logger.info(`bookmark with id ${bookmark.id} created`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl+ `/${bookmark.id}`))
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
         
    })


bookmarkRouter
    .route('/api/bookmarks/:id')
    .all((req,res,next) => {
        const knexInstance = req.app.get('db');
        const { id } = req.params;
        BookmarksServices.getById(knexInstance, id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`bookmark with id ${id} not found`);
                    return res.status(404).send({ error: { message: `Bookmark ${id} doesn't exist` } });
                }
                res.bookmark = bookmark;
                next()
            })
            .catch(next)
    })
    .get((req,res,next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { id } = req.params;
        
        BookmarksServices.deleteBookmark(knexInstance, id)
            .then(() => {
                logger.info(`Bookmark with ${id} deleted`)
                res.status(204).end()
            })
            .catch(next)
     })
            

module.exports = bookmarkRouter;
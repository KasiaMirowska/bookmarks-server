const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
let { bookmarks } = require('./store');
const validUrl = require('valid-url');
const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.status(200).json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description='', rating } = req.body;
        if(!title) {
            logger.error('Title is required')
            return res.json('Invalid data')
        }
        if(!url){
            logger.error('url is required')
            return res.json('Invalid data');
        }
        if(!rating) {
            logger.error('rating is required')
            return res.json('Invalid data');
        }
        
        if(!validUrl.isUri(url)){
           logger.error('not a valid URL');
           return res.json('Not a valid URL')
        }
        if(typeof rating !== 'number') {
            logger.error('rating must be a number');
            return res.json('Invalid data')
        }
        if(rating < 1 || rating > 5) {
            logger.error('rating must be a number between 1 and 5');
            return res.json('Rating must be a number between 1 and 5')
        } 
        
        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            description,
            rating,
        }
        bookmarks.push(bookmark);
        logger.info(`bookmark with id ${id} created`)
        res
            .status(201)
            .location(`'http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
     })


bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id)

        if(!bookmark) {
            logger.error(`bookmark with id ${id} not found`);
            res.status(404).json('Not found')
        }
        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
        let deletedItem = bookmarks.find(b => b.id == Number(id));
       
        if(!deletedItem) {
            logger.error(`bookmark with id ${id} not found`)
            res.status(404).json('not found')
        }
        
        shorterList = bookmarks.filter(b => {
            return b.id !== Number(id)
        })
        console.log(shorterList);
        bookmarks = shorterList;
        logger.info(`bookmark with id ${id} deleted`);
        res.status(204).end();
    })

module.exports = bookmarkRouter;
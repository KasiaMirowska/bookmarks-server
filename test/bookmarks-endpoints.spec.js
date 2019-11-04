const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { CreateTestData } = require('./testBookmarks');


describe('Bookmarks endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db, db');
    })

    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db('bookmarks_t').truncate());
    afterEach('cleanup', () => db('bookmarks_t').truncate());

    describe('GET bookmarks', () => {
        context('Given there are bookmarks in db', () => {
            const testBookmarks = CreateTestData();
    
            beforeEach('insert data', () => {
                return db
                    .into('bookmarks_t')
                    .insert(testBookmarks)
            })
            it('responds with 200 and all the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, testBookmarks)
            })
        })
        context('Given htere are no bookmarks', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, [])
            })
        })
        
    })

    describe('GET//bookmarks/:id', () => {
        context('Given there are bookmarks in db', () => {
            const testBookmarks = CreateTestData();
    
            beforeEach('insert data', () => {
                return db
                    .into('bookmarks_t')
                    .insert(testBookmarks)
            })
            it('responds with 200 and specific bookmark', () => {
                const chosenId = 2;
                const expectedBookmark = testBookmarks[chosenId -1]
                return supertest(app)
                    .get(`/bookmarks/:${chosenId}`)
                    .expect(200, expectedBookmark)
            })
        })
        
    })
    
    
})
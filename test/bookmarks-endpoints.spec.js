const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { CreateTestData, makeMaliciousBookmark } = require('./testBookmarks');


describe('Bookmarks endpoints', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db('bookmarks_t').truncate());
    afterEach('cleanup', () => db('bookmarks_t').truncate());

    describe('GET bookmarks', () => {
        context('Given there are no bookmarks', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            });
        });

        context('Given there are bookmarks in db', () => {
            const testBookmarks = CreateTestData();

            beforeEach('insert data', () => {
                return db
                    .into('bookmarks_t')
                    .insert(testBookmarks)
            });
            it('responds with 200 and all the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            });
        });
        context('Given an XSS attack bookmark', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            beforeEach('insert bug', () => {
                return db
                    .into('bookmarks_t')
                    .insert(maliciousBookmark)
            });
            it('removes corrupted bookmark', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedBookmark.title)
                        expect(res.body[0].description).to.eql(expectedBookmark.description)
                    })
            })
        })

    })

    describe('GET/bookmarks/:id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const chosenId = 2;
                return supertest(app)
                    .get(`/bookmarks/${chosenId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: "Bookmark doesn't exist" } })
            })
        })

        context('Given there are bookmarks in db', () => {
            const testBookmarks = CreateTestData();

            beforeEach('insert data', () => {
                return db
                    .into('bookmarks_t')
                    .insert(testBookmarks)
            })
            it('responds with 200 and specific bookmark', () => {
                const chosenId = 2;
                const expectedBookmark = testBookmarks[chosenId - 1]
                return supertest(app)
                    .get(`/bookmarks/${chosenId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })
        context('Given XSS attack', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            beforeEach('onsert attack script', () => {
                return db
                    .into('bookmarks_t')
                    .insert(maliciousBookmark)
            });
            it('removes corrupted bookmark', () => {
                return supertest(app)
                    .get(`/bookmarks/${maliciousBookmark.id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedBookmark.title)
                        expect(res.body.description).to.eql(expectedBookmark.description)
                    })

            })
        })
    })

    describe('POST/bookmarks', () => {
        it('creates a bookmark responding with 201 and a new bookmark', () => {
            const newBookmark = {
                title: 'New bookmark',
                url: 'https://www.yogajournal.com/',
                description: 'new bookmark',
                rating: 3
            }
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
                })
                .then(res => {
                    supertest(app)
                        .get(`/bookmarks/${res.body.id}`)
                        .expect(res.body)
                });
        })
        const requiredFileds = ['title', 'url', 'rating'];
        requiredFileds.forEach(field => {
            const newBookmark = {
                title: 'test',
                url: 'https://www.yogajournal.com',
                description: 'dxfgchvjb',
                rating: 4
            }
            it('responds with 400 and an error if field missing', () => {
                delete newBookmark[field]
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing ${field}` }
                    })
            })
        })

        it('removes XSS attack content from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                })
        })
    })

    describe('DELETE the bookmark', () => {
        context('Given bookmarks in the db', () => {
            const testBookmarks = CreateTestData();
            before('insert bookmarks', () => {
                return db
                    .into('bookmarks_t')
                    .insert(testBookmarks)
            })
            it('removes specified bookmark by id', () => {
                const { idToRemove } = query.params;
                const expectedBookmarks = testBookmarks.filter(b => b.id !== idToRemove)
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/bookmarks')
                            .expect(expectedBookmarks)
                    })
            })
        })
        context('Given no bookmarks', () => {
            it('returns 404 error',() => {
                const { idToRemove } = query.params;
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {error: {message: `Bookmark ${idToRemove} doesn't exist`}})
            })
        })
    })
})
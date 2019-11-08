
const app = require('../src/app');

describe('app', () => {
    it('GET / responds with 200 containing "Hello from bookmarks!"', () => {
        return supertest(app)
            .get('/api/')
            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
            .expect(200, "Hello from bookmarks!")
    })
})
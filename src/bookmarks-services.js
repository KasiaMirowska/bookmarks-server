const BookmarksServices = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_t')
    },
    getById(knex, chosenId) {
        return knex.from('bookmarks_t').select('*').where({'id' : id}).first()
    }
}
module.exports = BookmarksServices;
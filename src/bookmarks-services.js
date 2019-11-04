const BookmarksServices = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_t')
    }
}
module.exports = BookmarksServices;
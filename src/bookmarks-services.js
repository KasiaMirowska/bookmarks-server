const BookmarksServices = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_t')
    },
    getById(knex, chosenId) {
        return knex.from('bookmarks_t').select('*').where({'id' : chosenId}).first()
    },
    insertNewBookmark(knex, newBookmark) {
        return knex
            .insert(newBookmark)
            .into('bookmarks_t')
            .returning('*')
            .then(rows => {
                return ({
                    ...rows[0],
                    rating: Number(rows[0].rating)
                })
            })
    },
    deleteBookmark(knex, idToRemove) {
        return knex('bookmarks_t').where({id: idToRemove}).delete()
    },
    updatedBookmark(knex, idToUpdate, updatedFields) {
        return knex('bookmarks_t').where({id: idToUpdate}).update(updatedFields)
    }
}
module.exports = BookmarksServices;
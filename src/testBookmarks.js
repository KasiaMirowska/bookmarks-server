function CreateTestData() {
    return [
        {
            id: 1,
            title: 'test1',
            url: 'http://www.alomoves.com',
            description: "the best yoga website",
            rating: 5
        },
        {
            id: 2,
            title: 'test2',
            url: 'http://www.facebook.com',
            description: "adictive waste of time",
            rating: 1
        },
        {
            id: 3,
            title: 'test3',
            url: 'https://overview.thinkful.com/programs/web-development-flexible',
            description: 'programming guru',
            rating: 5
        }
    ]
}
module.exports = { CreateTestData };
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
function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 3,
        title: 'malicious one <script>alert("xss");</script>',
        url: 'https://overview.thinkful.com/programs/web-development-flexible',
        description: 'bad <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">.',
        rating: 5 
    }
    const expectedBookmark = {
        ...maliciousBookmark,
        title: `malicious one &lt;script&gt;alert("xss");&lt;/script&gt;`,
        description: 'bad <img src="https://url.to.file.which/does-not.exist">.'
      }

    return {
        maliciousBookmark,
        expectedBookmark,
    }
}
module.exports = { CreateTestData, makeMaliciousBookmark };
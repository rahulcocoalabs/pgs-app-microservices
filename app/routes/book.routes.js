const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const books = require('../controllers/books.controller');
    app.get('/books',auth,books.listAllBooks);
    app.get('/books/detail/:id',auth, books.getBookDetail);
    app.get('/books/summary',auth, books.getSummary);
    app.get('/books/summary/v2',auth, books.getSummaryForWeb);
    app.get('/books/authors',auth, books.listAllAuthors);
    app.get('/books/authors/:id',auth, books.getBookAuthorDetail);
    app.get('/books/categories',auth, books.listAllCategories);
    app.get('/books/categories/:id',auth, books.getBookCategoryDetail);
    app.get('/books/publishers',auth, books.listAllPublishers);
    app.get('/books/publishers/:id',auth, books.getBookPublisherDetail);
    //rakesh
    app.patch('/books/download/:id',auth, books.didClickDownloadButton);
}



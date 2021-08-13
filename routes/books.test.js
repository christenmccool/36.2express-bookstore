process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');


let testBook;

beforeEach(async() => {
    const results = await db.query(`
                    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
                    VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017)
                    RETURNING *`);

    testBook = results.rows[0];
})

afterEach(async () => {
    await db.query("DELETE FROM books");

})

afterAll(async () => {
    await db.end();
})

describe("GET /books", () => {
    test("Get a list of all books", async () => {
        const results = await request(app).get("/books");
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({books: [testBook]});
    })
})

describe("GET /books/:isbn", () => {
    test("Get a single book", async () => {
        const results = await request(app).get(`/books/${testBook.isbn}`);
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({book: testBook});
    })
    test("Respond with 404 for invalid book isbn", async () => {
        const results = await request(app).get(`/books/0`);
        expect(results.statusCode).toBe(404);
    })
})

describe("POST /books", () => {
    test("Post a new book", async () => {
        const newBook = {
            "isbn": "0691161520",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          }
        const results = await request(app).post(`/books/`).send(newBook);
        expect(results.statusCode).toBe(201);
        expect(results.body).toEqual({book: newBook});
    })
})

describe("DELETE /books/:isbn", () => {
    test("Delete a book", async () => {
        const results = await request(app).delete(`/books/${testBook.isbn}`);
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual({message: 'Book deleted'});
    })
    test("Respond with 404 for invalid book isbn", async () => {
        const results = await request(app).delete(`/books/0`);
        expect(results.statusCode).toBe(404);
    })
})
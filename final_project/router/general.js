const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  try {
    // Get username and password from request body
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Check if username already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
});

const fetchBooks = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(books), 100); // Simulate delay
  });
};

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  fetchBooks()
    .then(data => {
      const formattedBooks = JSON.stringify(data, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(formattedBooks);
    })
    .catch(error => {
      res.status(500).json({
        message: "Error retrieving book list",
        error: error.message
      });
    });
});



// Get book details based on ISBN

const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found for the given ISBN"));
      }
    }, 100); // Simulate delay
  });
};

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  fetchBookByISBN(isbn)
    .then(book => {
      const formattedBook = JSON.stringify(book, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(formattedBook);
    })
    .catch(error => {
      if (error.message === "Book not found for the given ISBN") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({
          message: "Error retrieving book details",
          error: error.message
        });
      }
    });
});


// Fetch books by author using Promise
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const matchingBooks = bookKeys
      .map(key => books[key])
      .filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error("No books found for the given author"));
    }
  });
};

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  fetchBooksByAuthor(author)
    .then(matchingBooks => {
      const formattedBooks = JSON.stringify(matchingBooks, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(formattedBooks);
    })
    .catch(error => {
      if (error.message === "No books found for the given author") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({
          message: "Error retrieving books by author",
          error: error.message
        });
      }
    });
});


// Fetch books by title using Promise
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const matchingBooks = bookKeys
      .map(key => books[key])
      .filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error("No books found for the given title"));
    }
  });
};

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  fetchBooksByTitle(title)
    .then(matchingBooks => {
      const formattedBooks = JSON.stringify(matchingBooks, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(formattedBooks);
    })
    .catch(error => {
      if (error.message === "No books found for the given title") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({
          message: "Error retrieving books by title",
          error: error.message
        });
      }
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

  try {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      const formattedReviews = JSON.stringify(book.reviews, null, 2);
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(formattedReviews);
    } else {
      return res.status(404).json({
        message: "Book not found for the given ISBN"
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving book reviews",
      error: error.message
    });
  }

});

module.exports.general = public_users;
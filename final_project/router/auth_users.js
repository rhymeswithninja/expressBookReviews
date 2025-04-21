const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username is non-empty and unique
  return username && username.length > 0 && !users.some(u => u.username === username);
};


const authenticatedUser = (username, password) => {
  // Check if credentials match
  return users.some(u => u.username === username && u.password === password);
};



//only registered users can login
regd_users.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
    req.session.token = token;
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const review = req.query.review; // Review from query parameter
    const username = req.user.username; // From JWT via index.js middleware

    // Validate review input
    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }

    // Check if book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify review
    books[isbn].reviews[username] = review; // Overwrites if user already reviewed, adds if new
    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews
    });
  } catch (error) {
    return res.status(500).json({ message: "Error adding review", error: error.message });
  }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const username = req.user.username;

    // Check if book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user has a review to delete
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user on this book" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting review", error: error.message });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
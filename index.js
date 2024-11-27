const express = require("express");
const app = express();
const { getRandomJoke } = require("one-liner-joke");
const fs = require("fs");

// Generate jokes
const jokes = [];
for (let i = 0; i < 40; i++) {
  const joke = getRandomJoke();
  joke.id = i + 1; // Assign unique IDs to jokes
  jokes.push(joke);
}

// Middleware for logging requests
app.use((req, res, next) => {
  const ip = req.ip;
  const method = req.method;
  const timestamp = new Date().toISOString();
  const logEntry = `\nIP: ${ip}\nTimestamp: ${timestamp}\nMethod: ${method}\n`;

  fs.appendFileSync("log.txt", logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });

  next();
});

// Endpoint to fetch all jokes or paginated jokes
app.get("/all", (req, res) => {
  const { page, limit } = req.query;

  if (!page && !limit) {
    return res.status(200).json({
      status: "success",
      results: jokes,
    });
  }

  const pageNo = parseInt(page, 10) || 1;
  const size = parseInt(limit, 10) || jokes.length;
  const start = (pageNo - 1) * size;
  const end = start + size;

  const data = jokes.slice(start, end);

  res.status(200).json({
    status: "success",
    page: pageNo,
    limit: size,
    totalPages: Math.ceil(jokes.length / size),
    totalResults: jokes.length,
    results: data,
  });
});

// Endpoint to fetch a random joke
app.get("/", (req, res) => {
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  res.status(200).json({
    status: "success",
    result: randomJoke,
  });
});

// Endpoint to fetch a joke by ID
app.get("/joke/:id", (req, res) => {
  const { id } = req.params;
  const joke = jokes.find((j) => j.id == id);

  if (!joke) {
    return res.status(404).json({
      status: "fail",
      message: `Joke with ID ${id} not found.`,
    });
  }

  res.status(200).json({
    status: "success",
    result: joke,
  });
});

// Catch-all for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found.",
  });
});

// Start the server
app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

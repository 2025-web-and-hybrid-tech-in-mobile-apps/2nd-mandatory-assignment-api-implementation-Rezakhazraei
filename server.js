const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// Data Body
let userHandle = "";
let password = "";
const secret = "MYSECRETKEY";
let highScores = [];

// POST: register a new user
app.post('/signup', (req,res) => {
  const userHandle = req.body.userHandle;
  const password = req.body.password;
  if (userHandle === undefined || password === undefined) {
    return res.status(400).send('Invalid request');
  } else if (userHandle.length >= 6 && password.length >= 6) {
    return res.status(201).send('User created');
  } else {
    return res.status(400).send('Invalid request');
  }
})
// POST: login with username and password to receive JWT token
app.post('/login', (req,res) => {
  const userHandleLogin = req.body.userHandle;
  const passwordLogin = req.body.password;
  // console.log(userHandle)
  // console.log(password)
  const expectedFields = new Set(['userHandle', 'password']);
  const extraFields = Object.keys(req.body).filter(key => !expectedFields.has(key));
  if (!req.body.userHandle || !req.body.password) {
    return res.status(400).send('Bad request');
  }
  if (extraFields.length > 0) {
    return res.status(400).send('Bad request');
  }
  // Login with incorrect data type
  if (typeof userHandleLogin !== 'string' || typeof passwordLogin !== 'string') {
    return res.status(400).send('Invalid request body');
  }
  // Login with empty userHandle or password
  if (userHandleLogin === "" || passwordLogin === "") {
    return res.status(400).send('password or userHandle cannot be empty');
  }
  // 
  if (userHandleLogin === undefined || passwordLogin === undefined) {
    return res.status(404).send('Bad request');
  }
  // Login with correct username and password
   else if (userHandleLogin === userHandle && passwordLogin === password) {
    jsonWebToken = jwt.sign({ userHandle: userHandleLogin, password: passwordLogin }, secret);
    return res.status(200).send({ jsonWebToken: jsonWebToken });
  }
  // Login with incorrect username and password
  else if (userHandleLogin !== userHandle || passwordLogin !== password) {
    return res.status(401).send('Unauthorized, Invalid username or password');
  }
})

// POST: post a high score for a specific level (protected with JWT auth)
app.post('/high-scores', (req,res) => {
  // Check if the token is valid
  if (!req.header('authorization')) {
    return res.status(401).send('Unauthorized, no token provided');
  }
  const jsonWebTokenAuth = req.get('authorization').split(' ')[1];
  // Verify user can post high score
  if (!jsonWebTokenAuth) {
    return res.status(401).send('Unauthorized, no token provided');
  }
  // if the token is invalid
  try {
    jwt.verify(jsonWebTokenAuth, secret);
  } catch (error) {
    return res.status(401).send('Unauthorized, invalid token');
  }
  if (req.body.score === undefined || req.body.level === undefined || req.body.userHandle === undefined || req.body.timestamp === undefined) {
    return res.status(400).send('Invalid request body');
  } else if (jwt.verify(jsonWebTokenAuth, secret)) {
    let scoreinformation = req.body;
    highscores.push(scoreinformation);
    return res.status(201).send('High score posted successfully');
  }
})

// GET: get the high scores
// Get high scores with pagination support. High scores should be ordered from biggest to smallest.
// If no page param is provided then first 20 high scores will be returned.
app.get('/high-scores', (req, res) => {
  // Extract the query parameters
  const { page = 1, level } = req.query;
  const pageSize = 20; // Default page is size
  // Filter the high scores by level
  const highscoresLevel = highScores
  .filter(score => score.level === level)
  .sort((a, b) => b.score - a.score); // Sort the high scores by score in descending order
  // If no high scores are found for the level, return an empty array
  if (highscoresLevel.length === 0) {
    return res.status(200).json([]);
  }
  // Paginate the high scores
  const startIndex = (page - 1) * pageSize;
  const highscoresPage = highscoresLevel.slice(startIndex, startIndex + pageSize);
  // Return the paginated high scores
  return res.status(200).json(highscoresPage);
});


//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
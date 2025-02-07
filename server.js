const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

  
let userHandle = "";
let password = "";
const secretkey = "mysecretkey"
let highscores = [];


app.post("/signup", (req, res) => {
   


   userHandle = req.body.userHandle;
   password = req.body.password;

  if(userHandle === undefined || password === undefined) {
    return  res.status(400).send("Invalid request body / Undefined fields");
  }
  else if(userHandle.length >= 6 && password.length>= 6) {
    return res.status(201).send("User registered successfully");
  }
  else {
    return res.status(400).send("Invalid request body with fields less than 6 characters");
  }
});

app.post("/login", (req, res) => {
  
 const userHandleLogin = req.body.userHandle;
 const passwordLogin = req.body.password;

  const expectedFields = new Set(["userHandle", "password"]);

  const extraFields = Object.keys(req.body).filter(key => !expectedFields.has(key));

  if (!req.body.userHandle || !req.body.password) {
    return res.status(400).send("Bad Request") 
  }
  if (extraFields.length > 0) {
    return res.status(400).send("Bad Request");
  }

  //login with incorect data type--to fix!!!
  if (typeof userHandleLogin != "string" || typeof passwordLogin != "string") {
    return res.status(400).send("Invalid request body");
  }
  
  //login with empty fields
  if(userHandleLogin === "" || passwordLogin === "") {
    return res.status(400).send("password or userHandle cannot be empty");
  }
  //
  if (userHandleLogin === undefined || passwordLogin === undefined ) {
  return  res.status(404).send("Bad Request");
  }
 //login with correct paassword and userHandle
  else if(userHandleLogin === userHandle && passwordLogin === password) {
   jsonWebToken = jwt.sign({ userHandle: userHandleLogin, password :  passwordLogin }, secretkey);
   return  res.status(200).send({ jsonWebToken:  jsonWebToken });
   
  } 
 //login with incorecct password and userHandle
  else if (userHandleLogin !== userHandle || passwordLogin !== password) {
    return res.status(401).send("Unauthorized, incorrect username or password");
  }
});

app.post("/high-scores", (req, res) => {
  //checks for authorization header field
  if (!req.header("authorization")) {
    return res.status(401).send("Unatharized, no token field provided")
  }
  const jsonWebTokenauth = req.get("authorization").split(" ")[1];
  //verify user can post the high-score
  if (!jsonWebTokenauth) {
    return res.status(401).send("Unauthorized , no token provided");
  }
  //if token is invalid
  try {
    jwt.verify(jsonWebTokenauth, secretkey);
  } catch (error) {
    return res.status(401).send("Unauthorized, invalid token");
  }
  if  (req.body.score === undefined || req.body.level === undefined ||req.body.userHandle === undefined || req.body.timestamp === undefined) {
    return res.status(400).send("Invalid request body")
  }
  else if (jwt.verify(jsonWebTokenauth, secretkey)) {
    let scoreinformation = req.body;
    highscores.push(scoreinformation);
    return res.status(201).send("High score posted successfully");
  }
  



});
app.get("/high-scores", (req, res) => {
  // Extract query parameters
  const { page = 1, level } = req.query;
  const pageSize = 20; // Default page size is 20

  // Filter highscores by level
  const highscoresLevel = highscores
    .filter(score => score.level === level)
    .sort((a, b) => b.score - a.score); // Sort scores in descending order


  // If no highscores are found for the level, return an empty array
  if (highscoresLevel.length === 0) {
    return res.status(200).json([]);
  }

  // Paginate the results
  const startIndex = (page - 1) * pageSize;
  const highscoresPage = highscoresLevel.slice(startIndex, startIndex + pageSize);

  // Return the paginated highscores
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
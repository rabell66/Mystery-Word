const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const app = express();
const port = process.env.PORT || 8000;
const fs = require("file-system");
var wordPopulation;
var isInWord;
var usedLetters = [];
var msg;
var words = [];
var symbols = [];
var loser;
var arrayLength;
var numberOfTries = 8;

//functions\\
function wordReveal() {
  for (let i = 0; i < words.length; i++) {
    if (symbols[i] == "-") {
      symbols.splice(i, 1, words[i]);
    }
  }
}

function wordGenerator(difficulty) {
  var userDifficulty = difficulty;
  symbols = [];
  wordPopulation = fs
    .readFileSync("/usr/share/dict/words", "utf-8")
    .toLowerCase()
    .split("\n");
  words = wordPopulation[getRandomInt()].split("");
  if (userDifficulty === "easy") {
    do {
      words = wordPopulation[getRandomInt()].split("");
      console.log(words);
     
    } while (words.length > 8);
  }
  else if (userDifficulty === "normal"){
    do{words = wordPopulation[getRandomInt()].split("");
      console.log(words);    
    } while (words.length <= 8 && words.length >= 12)
  }
  else if (userDifficulty === "hard"){
    do {words = wordPopulation[getRandomInt()].split("");
      console.log(words);    
    } while (words.length < 12 )
  }
  
  
   for (let i = 0; i < words.length; i++) {symbols.push("-");
}
  console.log(symbols) 
  return
  
}

function getRandomInt() {
  return Math.floor(Math.random() * (wordPopulation.length - 0 + 1));
}

//Set View Engine
app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

//Middleware
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);

//routes

app.get("/", function(req, res) {
  req.session.destroy();
   usedLetters = [];
  loser = "";
  msg = "Good Luck";
  numberOfTries = 8;
  words = [];
  symbols = [];
  res.render("index");
});
app.get("/index", function(req, res) {
  usedLetters = [];
  loser = "";
  msg = "Good Luck";
  numberOfTries = 8;
  words = [];
  symbols = [];
  res.render("game", {
    symbols: symbols,
    usedLetters: usedLetters,
    number: numberOfTries,
    msg: msg,
    loser: loser
  });
});
app.post("/index", function(req, res) {
  
  var difficulty = req.body.difficulty;
  console.log(difficulty)
  if (difficulty == undefined){res.redirect("/")}
  wordGenerator(difficulty);
  arrayLength = words.length;
  res.redirect("/game");
});
app.get("/game", function(req, res) {
  if (loser == "Try Again?") {
    wordReveal();
  }

  res.render("game", {
    symbols: symbols,
    usedLetters: usedLetters,
    number: numberOfTries,
    msg: msg,
    loser: loser
  });
});
app.get("/letter", function(req, res) {
  res.render("game");
});

app.post("/letter", function(req, res) {
  var playerChoice = req.body.userChoice.toLowerCase();

  for (let j = 0; j < words.length; j++) {
    if (playerChoice == usedLetters[j]) {
      msg = "You've already used that Letter";
      return res.redirect("game");
    }

    if (words[j] === playerChoice) {
      symbols.splice(j, 1, words[j]);
      isInWord = "yes";

      arrayLength--;
      console.log(arrayLength)
    if (arrayLength == 0) {
      return res.redirect("winner");}
    } else if (j == words.length - 1 && isInWord == "yes") {
      isInWord = "";
      usedLetters.push(playerChoice);
      msg = "Great Guess!!!";
      return res.redirect("game");
    }
  }

  numberOfTries--;
  usedLetters.push(playerChoice);
  if (numberOfTries == 0) {
    loser = "Try Again?";
    msg = "You Lose";
    numberOfTries = "0";
    return res.redirect("game");
  } else {
    msg = "Try Again!";
    return res.redirect("game");
  }
});
app.get("/replay", function(req, res) {
  res.render("/");
});
app.post("/replay", function(req, res) {
  res.redirect("/");
});
app.get("/winner", function(req, res) {
  res.render("Winner");
});

app.listen(port, function() {
  console.log("Server is running on port", port);
});
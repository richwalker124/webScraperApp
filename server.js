//~~~~~~~~~~~~~~~~~~~~~~~~~~SETUP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Require routes
var express = require("express");

//require mongoose
var mongoose = require("mongoose");

//Require scraping stuff (fun fun fun)
var axios = require("axios");
var cheerio = require("cheerio");

//Grab models
var db = require("./models/article");

//set up express
var app = express();
//var dbConnection = process.env.MONGODB_URI || "mongodb://localhost/webScraper";
var dbConnection = "mongodb://localhost/webScraper";
// // Use morgan logger for logging requests
// app.use(logger("dev"));

//Set up express for data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Static directory
app.use(express.static("app/public"));

//Express Handlebars Stuff
var exphb = require("express-handlebars");

//Tells express to use handlebars
app.engine("handlebars", exphb({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static folder
app.use(express.static("public"));

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~End set up~~~~~~~~~~~~~~~~~~~~~~~~~~
// Connect to the Mongo DB
mongoose.connect(dbConnection, {
  useNewUrlParser: true
});

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://thehardtimes.net/harddrive/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("p")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

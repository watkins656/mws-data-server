// require('newrelic');
var express = require("express");
let dotenv = require('dotenv').config({ path: __dirname + '/.env' })



var PORT = process.env.PORT || 8060;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




// I've changed this from engine to exphbs,
// so there is no confusion with the express engine object that we use later.
// var exphbs = require('express-handlebars');

// Create an instance of the express-handlebars
// If you want to pass any option offered by express-handlebar module
// do it inside the create() in the handlebars.js file
// var handlebars = require('./helpers/handlebars.js')(exphbs);

// The handlebars variable now has an object called engine.
// Use that to define your app.engine
// As said before, you don't need to define any options here.
// Everything is defined in the create() in handlebars.js
// app.engine('handlebars', handlebars.engine);

// If you are using a different extension, you can change hbs to whatever you are using. 
// app.set('view engine', 'hbs');




// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// Import routes and give the server access to them.
// var routes = require("./controllers/customerOrdersController.js");

// app.use(routes);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});


let connection = require('./config/connection')
// let orders = require("./MWS/ordersForInterval");
// let orderItems = require("./MWS/orderItems");
// let pendingOrderUpdater = require("./MWS/pendingOrderUpdater");
// let inventory = require("./MWS/inventory");
let listCurrentSkus = require("./MWS/listCurrentSkus");


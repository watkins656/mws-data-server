// require('newrelic');
const express = require("express");
let dotenv = require('dotenv').config({ path: __dirname + '/.env' })



const PORT = process.env.PORT || 8060;

const app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




// I've changed this from engine to exphbs,
// so there is no confusion with the express engine object that we use later.
// const exphbs = require('express-handlebars');

// Create an instance of the express-handlebars
// If you want to pass any option offered by express-handlebar module
// do it inside the create() in the handlebars.js file
// const handlebars = require('./helpers/handlebars.js')(exphbs);

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
const routes = require('./routes');
const db = require("./models");


app.use(routes);

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    // console.log("Server listening on: http://localhost:" + PORT);
  });
});

//runs all the data services
require('./MWS/main') 

// //gets new orders
// let orders = require("./MWS/ordersForInterval");

// //gets the items from the orders
// let orderItems = require("./MWS/orderItems");

// //checks pending items and updates them to 'shipped'
// let pendingOrderUpdater = require("./MWS/pendingOrderUpdater");

// //updates current inventory
// let inventory = require("./MWS/inventory");

// //function that outputs sales for a given sku
// let listCurrentSkus = require("./MWS/listCurrentSkus");

// //function that outputs sales by Day/Week/Month for a given sku
// let salesVelocity = require("./MWS/salesVelocity");

//returns the necessary Sales Velocity needed to avoid expiration of products 
// let overstock = require("./MWS/overstock");
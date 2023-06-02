const express = require("express");
const morgan = require('morgan');
const methodoverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoute = require('./routes/mainRoute');
const tradeRoute = require('./routes/tradeRoute');
const userRoutes = require('./routes/userRoute');


const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodoverride('_method'));

//connect to the database
mongoose.connect('mongodb://127.0.0.1:27017/posters',
   { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      //start the server
      app.listen(port, host, () => {
         console.log('The server is running at port', port);
      });
   })
   .catch(err => console.log(err.message));

//mount middlware
app.use(
   session({
      secret: "sdhjba4a56i70usdhiuhiuw",
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongoUrl: 'mongodb://localhost:27017/demos' }),
      cookie: { maxAge: 60 * 60 * 1000 }
   })
);
app.use(flash());

app.use((req, res, next) => {
   res.locals.user = req.session.user || null;
   res.locals.errorMessages = req.flash('error');
   res.locals.successMessages = req.flash('success');
   next();
});

// set up routes
app.use('/', mainRoute);
app.use('/trades', tradeRoute);
app.use('/users', userRoutes);

app.use((req, res, next) => {
   let err = new Error("The server cannot locate " + req.url);
   err.status = 404;
   next(err);
});

app.use((err, req, res, next) => {
   console.log(err.stack);
   if (!err.status) {
      err.status = 500;
      err.message = "Internal server error";
   }
   res.status(err.status);
   res.render("error", { error: err });
});

app.set('etag', false);

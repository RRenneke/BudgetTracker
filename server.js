const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
// import the compression package
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

// enable compression middleware
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/MongoDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// routes
app.use(require("./routes/apiroute.js"));
require('./routes/htmlroute.js')(app);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
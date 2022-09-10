const mongoose = require("mongoose");

module.exports = () => {
  const mongodb_user = process.env.MONGODB_USER;
  const mongodb_password = process.env.MONGODB_PASSWORD;
  const mongodb_db = process.env.MONGODB_DATABASE || "";
  const mongodb_host = process.env.MONGODB_SERVICE_HOST || "localhost";
  const mongodb_port = process.env.MONGODB_SERVICE_PORT || "27017";
  const db_service = process.env.MONGODB_SERVICE_NAME || "mongodb";
  const auth_db = process.env.MONGODB_AUTH_DB;

  let identifiers = "",
    auth = "";

  if (mongodb_password && mongodb_user) {
    identifiers = `${mongodb_user}:${mongodb_password}@`;
  }

  if (auth_db) {
    auth = `?authSource=${auth_db}`;
  }

  const mongoDb = `${db_service}://${identifiers}${mongodb_host}:${mongodb_port}/${mongodb_db}${auth}`;

  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  mongoose
    .connect(mongoDb, options)
    .then(() => console.log("DB connection successful!😊✔"));
};

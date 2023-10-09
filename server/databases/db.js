const mongoose = require("mongoose");
const dbURI = process.env.MONGO_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((con) => {
    console.log(`\n Connected to Database!: ${con.connection.host} \n `);
  })
  .catch((err) => console.log(err));

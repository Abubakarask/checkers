const http = require("http");
// using chalk library for highlight the logs in console, we can have different color of everything
const chalk = require("chalk");
const app = require("./app");
const initiateSocketio = require("./socketio");

let server = http.createServer(app);
const port = process.env.PORT || 3000;

// create a server and initiate socketio
initiateSocketio(server);

// used chalk to highlight the log in green
server.listen(port, () =>
  console.log(chalk.green.inverse("Server connected on port:", port))
);

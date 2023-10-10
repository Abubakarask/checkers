const socketio = require("socket.io");
const Filter = require("bad-words");
const generateMessage = require("./utils/messages");
const {
  addPlayerToLobby,
  removePlayerFromLobby,
  addPlayerToPlayersInGameSession,
  removePlayerFromGameSessions,
  updatePlayerInGameSessionList,
  getPlayerFromPlayersInLobbyList,
  getPlayerFromGameSessionList,
  getPlayersInLobbyList,
  getPlayersInGameSessionList,
} = require("./utils/players");
const chalk = require("chalk");

// Function to initiate Socket.io
const initiateSocketio = (server) => {
  // Initialize Socket.io with the provided server
  const io = socketio(server);

  io.on("connection", (socket) => {
    // Handle when a user joins the lobby
    socket.on("joinLobby", (user, callback) => {
      // Join the 'lobby' room
      socket.join("lobby");
      console.log(chalk.blue("A user joined the lobby."));
      // Add player in lobby so that user will be visible in Lobby Section
      const player = addPlayerToLobby({
        id: socket.id,
        ...user,
        room: "lobby",
      });
      callback(player);

      // Broadcast a message to all clients about the new user joining
      socket.broadcast.emit(
        "message",
        generateMessage("Checkers App", `${user.username} joined!`)
      );

      // Update the player list in the lobby for all clients
      io.emit("playerList", getPlayersInLobbyList());

      // Handle sending game invitations
      socket.on("sendInvite", ({ sender, reciver }, callback) => {
        io.to(reciver.id).emit("reciveInvite", sender);
        callback();
      });

      // Handle game invitation replies
      socket.on("inviteReply", ({ player1, player2 }, callback) => {
        // Generate a random value to determine the player who plays as 'white'
        const randomNumber = () => {
          return Math.floor(Math.random() * Math.floor(1)) === 1;
        };

        callback();
        const isWhite = randomNumber ? player1.username : player2.username;
        const room = `${player1.id}-${player2.id}`;

        // Add players to the game session
        addPlayerToPlayersInGameSession({
          username: player1.username,
          room,
        });
        addPlayerToPlayersInGameSession({
          username: player2.username,
          room,
        });

        // Redirect players to the game session
        io.to(player1.id).emit("redirectToGame", {
          player1,
          player2,
          isWhite,
          room,
        });
        io.to(player2.id).emit("redirectToGame", {
          player1,
          player2,
          isWhite,
          room,
        });

        // Broadcast a message to all clients that a game has started
        io.emit(
          "message",
          generateMessage(
            "Checkers App",
            `${player1.username} and ${player2.username} started a game!`
          )
        );

        // Update the player list in the lobby for all clients
        io.emit("playerList", getPlayersInLobbyList());
      });

      // Hande users' sent messages and filtering chat messages
      socket.on("sendMessage", (message, callback) => {
        // using library for observing bad language in the chat
        const filter = new Filter();
        if (filter.isProfane(message))
          return callback(generateMessage("Profanity is not allowed!"));

        // Emit the message to all clients/players in the room, sent by the user
        io.emit("message", generateMessage(user.username, message));
        callback();
      });
    });

    // Handle when a user joins a game session
    socket.on("joinGame", ({ playerData, isWhite, room }, callback) => {
      // Function to check if a player is in the correct room
      const checkIfPlayerInTheCorrectRoom = (username) => {
        const player = getPlayerFromGameSessionList(undefined, username);
        if (player === undefined) return callback("error");
        if (player.room !== room) return callback("error");
      };

      if (!playerData || !isWhite || !room) return callback("error");
      checkIfPlayerInTheCorrectRoom(playerData.username);

      socket.join(room);
      const player = updatePlayerInGameSessionList(
        playerData.username,
        socket.id
      );
      console.log(
        chalk.greenBright(`${playerData.username} joined room:`, room)
      );
      callback(undefined, player);

      if (isWhite === playerData.username) {
        socket.emit("startGame");
      }

      // Handle sending and receiving game data updates
      socket.on("sendUpdatedGameData", (data, callback) => {
        socket.broadcast.to(room).emit("updateGameData", data);
        callback();
      });

      // Handle changing player turns
      socket.on("changePlayerTurn", () => {
        socket.broadcast.to(room).emit("playerTurnChange");
      });

      // Handle returning to the lobby
      socket.on("lobby", (callback) => {
        callback();
        io.to(room).emit("backToLobby");
      });

      // Handle draw requests
      socket.on("drawRequest", (room) => {
        socket.broadcast.to(room).emit("recieveDrawRequest");
        callback();
      });

      // Handle draw responses
      socket.on("drawResponse", (response, callback) => {
        if (!response) {
          socket.broadcast.to(room).emit("noDraw");
          return callback();
        }
        io.to(room).emit("draw");
      });

      // Handle player resignations
      socket.on("resign", (resignedPlayer, callback) => {
        callback();
        io.to(room).emit("gameOver", resignedPlayer);
      });

      // Handle rematch requests
      socket.on("rematchRequest", () => {
        socket.broadcast.to(room).emit("recieveRematchRequest");
        callback();
      });

      // Handle rematch responses
      socket.on("rematchResponse", (response, callback) => {
        if (!response) {
          socket.broadcast.to(room).emit("rematchDenied");
          return callback();
        }
        io.to(room).emit("newGame");
      });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      // remove the leaving player from lobby(active)
      const leavingPlayerFromLobby = removePlayerFromLobby(socket.id);

      if (getPlayerFromGameSessionList(socket.id)) {
        const leavingPlayerFromGameSessions = removePlayerFromGameSessions(
          socket.id
        );
        if (leavingPlayerFromGameSessions) {
          socket.leave(leavingPlayerFromGameSessions.room);
          io.to(leavingPlayerFromGameSessions.room).emit(
            "playerLeft",
            leavingPlayerFromGameSessions
          );
        }
      } else {
        socket.leave("lobby");
        io.to("lobby").emit("playerList", getPlayersInLobbyList());
      }
    });
  });
};

module.exports = initiateSocketio;

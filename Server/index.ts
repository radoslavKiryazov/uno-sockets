import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { createGame } from "./Models/Game_model";

import AuthRoute from "./Routes/authRoute";
import UserRoute from "./Routes/userRoute";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let connectedPlayers = [] as any;

//Database Conncetion
mongoose
  .connect(process.env.MONGO_DB as string)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error : ", err);
  });

// Access-Header fro CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Replace this with the actual origin of your client application
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials

  // Respond to preflight requests
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.sendStatus(200);
  } else {
    next();
  }
});
// Running Server on PORT 3000
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT} :)`);
});


io.on("start-game", () => {
  console.log("requested to start game.");
  //create the game
  const game = createGame([], 500);

  io.emit("game-started", {
    game,
  });
});

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("player-joined", ({ username }: { username: string }) => {
    console.log("Player Joined!", username);
    connectedPlayers.push({ id: socket.id, username });
    console.log(connectedPlayers.length);

    io.emit("player-connected", {
      id: socket.id,
      username,
      connectedPlayers,
    });
  });

  socket.on("start-game", () => {
    console.log("requested to start game.");
    //create the game
    const game = createGame(connectedPlayers, 500);
    game.startNewHand();

    const currentHand = game.getCurrentHand();


    if(!currentHand) {return }

    const handsByPlayer = game.players.reduce((acc: any, hand: any, index: number) => {
      const player = connectedPlayers[index];
      if (player) acc[player.id] = hand;
      return acc;
    }, {});

    Object.keys(handsByPlayer).forEach((socketId) => {
      io.to(socketId).emit("your-hand", {
        hand: handsByPlayer[socketId],
      });
    });

    io.emit("game-started", {
      currentHand,
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    const disconnectedPlayer = connectedPlayers.find(
      (player: any) => player.id === socket.id
    );
    connectedPlayers = connectedPlayers.filter(
      (player: any) => player.id !== socket.id
    );

    if (disconnectedPlayer) {
      io.emit("player-disconnected", {
        id: socket.id,
        username: disconnectedPlayer.username,
        connectedPlayers,
      });
    }
  });
});

//Test API
app.get("/test", (req, res) => {
  res.json({
    message: "Hello World !",
  });
});

// Routes in Server
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);

//TODO: Fix any type

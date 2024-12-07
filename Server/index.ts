import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { createGame } from "./Models/Game_model";

import AuthRoute from "./Routes/authRoute";
import UserRoute from "./Routes/userRoute";
import { Player } from "./Models/Player_model";
import { Game } from "./Models/Game_model";

import { type Colour } from "./Models/Card_model";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const mongoDBURI = process.env.MONGO_DB as string;

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
let game: Game | null = null;

//Database Conncetion
mongoose
  .connect(mongoDBURI)
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
  console.log(`Server is running on port ${port} :)`);
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

  socket.on("change-colour", ({ colour }: { colour: Colour }) => {
    if (!game) return;

    const currentHand = game?.getCurrentHand();

    if (!currentHand) return;

    const topCard = currentHand.discardPile[currentHand.discardPile.length - 1];

    if (topCard.type === "WILD" || topCard.type === "WILDDRAWFOUR") {
      topCard.colour = colour;
    }
    console.log("topCard after changing colour", topCard);
    io.emit("update-discard-pile", {
      discardPile: currentHand.discardPile,
    });
  });

  socket.on("start-game", () => {
    console.log("requested to start game.");
    //create the game
    game = createGame(connectedPlayers, 500);
    game.startNewHand();

    const currentHand = game.getCurrentHand();
    if (!currentHand) {
      return;
    }

    connectedPlayers.forEach((player) => {
      const otherPlayers = connectedPlayers.filter(
        (p) => p.id !== player.id // Exclude the current player
      );

      console.log("otherPlayers", otherPlayers);
      const deckSize = currentHand.deck.size();
      const discardPile = currentHand.discardPile;
      const playerAtHand = currentHand.getPlayerAtHand();

      io.to(player.id).emit("game-started", {
        players: otherPlayers,
        deckSize: deckSize,
        discardPile: discardPile,
        currentHand,
        playerAtHand,
      });
    });

    const handsByPlayer = game.players.reduce(
      (acc: any, hand: any, index: number) => {
        const player = connectedPlayers[index];
        if (player) acc[player.id] = hand;
        return acc;
      },
      {}
    );

    Object.keys(handsByPlayer).forEach((socketId) => {
      io.to(socketId).emit("your-hand", {
        hand: handsByPlayer[socketId],
      });
    });
  });

  socket.on("draw-card", ({ playerId }: { playerId: string }) => {
    console.log(`${playerId} requested to draw a card`);

    //send the info of the player who drew the card.

    // Locate the player
    const player = connectedPlayers.find((p) => p.id === playerId);
    const otherPlayers = connectedPlayers.filter((p) => p.id !== playerId);

    console.log("player before drawing", player);
    console.log("game", game);
    const currentHand = game?.getCurrentHand();
    const card = currentHand?.drawCard(player);
    console.log("deck size", currentHand?.deck.size());
    console.log("card drawn", card);

    console.log("player after drawing", player.hand);

    io.to(playerId).emit("update-hand", {
      card: card,
    });

    console.log("connectedPlayers", connectedPlayers[0].hand);

    io.emit("update-player-info", {
      player,
    });

    io.emit("update-deck", {
      deckSize: currentHand?.deck.size(),
    });
  });

  socket.on(
    "play-card",
    ({ playerId, card }: { playerId: string; card: any }) => {
      if (!game) return;

      console.log(`${playerId} requested to play a card`);
      const player = connectedPlayers.find((p) => p.id === playerId);
      const currentHand = game?.getCurrentHand();

      if (!currentHand) return;

      currentHand.playCard(card);
      console.log("card played", card);
      console.log("discard pile", currentHand.discardPile);

      io.emit("update-game", {
        connectedPlayers,
      });

      io.emit("update-discard-pile", {
        discardPile: currentHand?.discardPile,
      });

      io.emit("update-player-at-hand", {
        playerAtHand: currentHand.getPlayerAtHand(),
      });
      io.emit("update-deck", {
        deckSize: currentHand?.deck.size(),
      });

      const handsByPlayer = game.players.reduce(
        (acc: any, hand: any, index: number) => {
          const player = connectedPlayers[index];
          if (player) acc[player.id] = hand;
          return acc;
        },
        {}
      );

      Object.keys(handsByPlayer).forEach((socketId) => {
        io.to(socketId).emit("your-hand", {
          hand: handsByPlayer[socketId],
        });
      });
    }
  );

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    socket.removeAllListeners();

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

// Routes in Server
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);

//TODO: Fix any type

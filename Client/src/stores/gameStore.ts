import { defineStore } from "pinia";
import type { Player } from "../model/Player_model";
import { createPlayer } from "../model/Player_model";
import type { Hand } from "../model/Hand_model";
import { createHand } from "../model/Hand_model";
import { ref, computed } from "vue";
import { canPlayCard } from "../utils/random_utils";
import type { Colour } from "../model/Card_model";
import { createGame, type Game } from "../model/Game_model";
import { pointCalculator } from "../model/Game_model";
import router from "../router";

export const useGameStore = defineStore("model", () => {
  //Popup triggers
  const colourPopupTrigger = ref({
    buttonTrigger: false,
    timeTrigger: false,
  });
  const handOverPopupTrigger = ref(false);
  const gameOverPopupTrigger = ref(false);

  const winnerName = ref("");
  const winnerScore = ref(0);

  const selectedWildColour = ref(null as string | null);
  const directionOfPlay = ref(1); // 1 for clockwise, -1 for counter-clockwise

  const players = ref([] as Player[]);
  const game = ref(null as Game | null);
  const currentHand = ref(null as Hand | null);
  const handsPlayed = ref(0 as number);
  const playerName = ref("" as string);
  const playerAtHandIndex = ref(0 as number);
  const actionMessages = ref<string[]>([]);
  const playerCanInterrupt = ref<boolean>(false);

  // bot settings
  const botForgetRate = 0.75;
  const BOT_ACTION_INTERVAL = 5000;

  const startGame = (playerName: string, numberOfBots: number) => {
    const newPlayers: Player[] = [
      createPlayer(playerName, [], false),
      ...Array.from({ length: numberOfBots }, (_, i) =>
        createPlayer(`Bot ${i + 1}`, [], true)
      ),
    ];
    game.value = createGame(newPlayers, 1);
    players.value = newPlayers;
    currentHand.value = game.value.startNewHand();
    addActionMessage("Game has started!");
  };

  const playCard = (cardIndex: number) => {
    const currentPlayer = players.value[playerAtHandIndex.value];

    if (cardIndex < 0 || cardIndex >= currentPlayer.hand.length) {
      console.error("Invalid card index:", cardIndex);
      return;
    }

    let selectedCard = currentPlayer.hand[cardIndex];
    currentPlayer.hand.splice(cardIndex, 1);

    switch (selectedCard.type) {
      case "NUMBERED": {
        addActionMessage("Numbered card played!");
        playerAtHandIndex.value = currentHand.value!.updatePlayerAtHandIndex(
          playerAtHandIndex.value,
          directionOfPlay.value
        );
        break;
      }
      case "SKIP": {
        playerAtHandIndex.value = currentHand.value!.skipPlayerTurn(
          playerAtHandIndex.value,
          directionOfPlay.value
        );
        break;
      }
      case "REVERSE": {
        if (players.value.length === 2) {
          playerAtHandIndex.value = currentHand.value!.skipPlayerTurn(
            playerAtHandIndex.value,
            directionOfPlay.value
          );
        } else {
          directionOfPlay.value *= -1;
          playerAtHandIndex.value = currentHand.value!.updatePlayerAtHandIndex(
            playerAtHandIndex.value,
            directionOfPlay.value
          );
        }
        break;
      }
      case "DRAWTWO": {
        handleDrawingEffect(2);
        playerAtHandIndex.value = currentHand.value!.skipPlayerTurn(
          playerAtHandIndex.value,
          directionOfPlay.value
        );
        break;
      }
      case "WILD": {
        handleWildCard();
        playerAtHandIndex.value = currentHand.value!.updatePlayerAtHandIndex(
          playerAtHandIndex.value,
          directionOfPlay.value
        );
        break;
      }
      case "WILDDRAWFOUR": {
        handleWildCard();
        handleDrawingEffect(4);
        playerAtHandIndex.value = currentHand.value!.skipPlayerTurn(
          playerAtHandIndex.value,
          directionOfPlay.value
        );
        break;
      }
    }

    //update discard pile
    if (currentHand.value) {
      currentHand.value.discardPile.push(selectedCard);
    }

    if (currentPlayer.hand.length === 1) {
      if (!currentPlayer.isBot) {
        setTimeout(() => {
          if (!currentPlayer.calledUNO) {
            botInterruptUNO(currentPlayer);
          }
        }, 5000); // 5-second window for calling UNO
      } else {
        const called = botCallUno(currentPlayer);
        called && addActionMessage(`${currentPlayer.name} called UNO!`);
        if (!currentPlayer.calledUNO) {
          //bot forgot to call UNO
          botInterruptUNO(currentPlayer); //another bot tries to call UNO to punish
          togglePlayerInterrupt();
        }
      }
    }

    if (isHandOver()) {
      addActionMessage(`${currentPlayer.name} has won this hand!`);
      game.value?.updateScores();
      if (game.value?.isGameOver()) {
        gameOverPopupTrigger.value = true;
        handOverPopupTrigger.value = false;
      } else {
        handOverPopupTrigger.value = true;
      }
      return;
    }

    if (
      !colourPopupTrigger.value.buttonTrigger &&
      players.value[playerAtHandIndex.value].isBot
    ) {
      botPlay();
    }
  };

  const addActionMessage = (message: string) => {
    actionMessages.value.push(message);
  };

  const clearActionMessages = () => {
    actionMessages.value = [];
  };

  const botCallUno = (bot: Player): boolean => {
    const forgotToCallUno = Math.random() > botForgetRate;
    if (!forgotToCallUno) {
      callUNO(bot);
      playerCanInterrupt.value = false;
      return true;
    } else {
      playerCanInterrupt.value = true;
      return false;
    }
  };

  const botInterruptUNO = (currentPlayer: Player) => {
    const bots = players.value.filter(
      (player) => player.isBot && player !== currentPlayer
    );

    const randomBot = bots[Math.floor(Math.random() * bots.length)];
    const called = botCallUno(randomBot);

    if (called) {
      drawPenalty(currentPlayer);
      addActionMessage(
        `${randomBot.name} called UNO before ${currentPlayer.name}!, DRAW 2 CARDS`
      );
    }
  };

  const interruptUNO = (bot: Player | undefined) => {
    if (!bot) {
      return;
    }
    drawPenalty(bot);
    addActionMessage(
      `${players.value[0].name} called UNO before ${bot.name}!, DRAW 2 CARDS`
    );
    playerCanInterrupt.value = false;
  };

  const togglePlayerInterrupt = () => {
    playerCanInterrupt.value = true;
    setTimeout(() => {
      playerCanInterrupt.value = false;
    }, 3000);
  };

  const drawCard = (playerIndex: number) => {
    const currentPlayer = players.value[playerIndex];
    if (!currentHand.value) {
      return;
    }

    currentHand.value.drawCard(currentPlayer);
    currentHand.value.deck = { ...currentHand.value.deck };

    if (players.value[playerAtHandIndex.value].isBot) {
      botPlay();
    }
  };

  const callUNO = (currentPlayer: Player) => {
    currentPlayer.calledUNO = true;
    playerCanInterrupt.value = true;
  };

  const drawPenalty = (currentPlayer: Player) => {
    currentHand.value?.drawCard(currentPlayer, 2);
    currentPlayer.calledUNO = false;
  };

  const handleDrawingEffect = (numberOfCards: number) => {
    const nextPlayerIndex =
      (playerAtHandIndex.value + directionOfPlay.value) % players.value.length;

    const nextPlayer = players.value[nextPlayerIndex];
    if (!currentHand.value || !currentHand.value.deck.size()) {
      return;
    }

    currentHand.value.drawCard(nextPlayer, numberOfCards);
  };

  const handleWildCard = () => {
    const currentPlayer = players.value[playerAtHandIndex.value];

    if (currentPlayer.isBot) {
      const colours = currentPlayer.hand
        .map((card) => card.colour)
        .filter((color) => color !== "None");

      const colorFrequencies = colours.reduce(
        (acc: { [key: string]: number }, color: string) => {
          acc[color] = (acc[color] || 0) + 1;
          return acc;
        },
        {}
      );

      const mostFrequentColour = Object.keys(colorFrequencies).reduce((a, b) =>
        colorFrequencies[a] > colorFrequencies[b] ? a : b
      );

      selectedWildColour.value = mostFrequentColour as Colour;
      changeTopCardColor(mostFrequentColour as Colour);
    } else {
      colourPopupTrigger.value.buttonTrigger = true;
    }
  };

  // const updatePlayerAtHandIndex = () => {
  //   playerAtHandIndex.value =
  //     (playerAtHandIndex.value + directionOfPlay.value + players.value.length) %
  //     players.value.length;
  //   resetUno(playerAtHandIndex.value);
  // };
  // MOVED TO HAND_MODEL

  // const skipPlayerTurn = () => {
  //   playerAtHandIndex.value =
  //     (playerAtHandIndex.value +
  //       directionOfPlay.value * 2 +
  //       players.value.length) %
  //     players.value.length;
  //   resetUno(playerAtHandIndex.value);
  // };
  // MOVED TO HAND_MODEL

  const onColourSelection = (colour: Colour) => {
    selectedWildColour.value = colour;
    colourPopupTrigger.value.buttonTrigger = false;
    changeTopCardColor(colour);
    if (players.value[playerAtHandIndex.value].isBot) {
      botPlay();
    }
  };

  const changeTopCardColor = (color: Colour) => {
    if (discardPile && discardPile.value && discardPile.value.length > 0) {
      const topCard = discardPile.value[discardPile.value.length - 1];
      if (topCard.type === "WILD" || topCard.type === "WILDDRAWFOUR") {
        topCard.colour = color;
      }
    }
  };

  const isHandOver = (): boolean => {
    const winner = players.value.find((player) => player.hand.length === 0);
    if (winner) {
      winnerName.value = winner.name;
      winnerScore.value = pointCalculator(players.value, winner);
      handOverPopupTrigger.value = true;
      return true;
    }
    return false;
  };

  const botPlay = () => {
    const botIndex = playerAtHandIndex.value; // Store the index at the start of the function
    const bot = players.value[botIndex];

    const playableCardIndex = bot.hand.findIndex((card) =>
      canPlayCard(card, topDiscardCard.value)
    );

    if (playableCardIndex !== -1) {
      setTimeout(() => {
        playCard(playableCardIndex);
      }, BOT_ACTION_INTERVAL);
    } else {
      setTimeout(() => drawCard(botIndex), BOT_ACTION_INTERVAL);
    }
  };

  const startNewHand = () => {
    if (!game.value) {
      return;
    }
    const newHand = createHand(players.value);
    game.value.addHand(newHand);
    currentHand.value = newHand;
    playerAtHandIndex.value = 0;
    clearActionMessages();
    handOverPopupTrigger.value = false;
  };

  const playAgain = () => {
    router.push("/");
    gameOverPopupTrigger.value = false;
    game.value = null;
    clearActionMessages();
  };

  const getPlayerHand = computed(() =>
    players.value.length > 0 ? players.value[0].hand : []
  );

  const isThereAPlayableCard = computed(() =>
    players.value[0].hand.some((card) =>
      canPlayCard(card, topDiscardCard.value)
    )
  );
  const getCurrentHand = computed(() => currentHand.value);
  const discardPile = computed(() => currentHand.value?.discardPile);
  const deck = computed(() => currentHand.value?.deck);
  const topDiscardCard = computed(() => {
    return discardPile.value?.[discardPile.value.length - 1];
  });

  return {
    startGame,
    players,
    currentHand,
    handsPlayed,
    playerName,
    getPlayerHand,
    discardPile,
    getCurrentHand,
    deck,
    playCard,
    topDiscardCard,
    isThereAPlayableCard,
    drawCard,
    playerAtHandIndex,
    colourPopupTrigger,
    onColourSelection,
    callUNO,
    addActionMessage,
    actionMessages,
    playerCanInterrupt,
    interruptUNO,
    handOverPopupTrigger,
    startNewHand,
    winnerName,
    winnerScore,
    gameOverPopupTrigger,
    game,
    playAgain,
  };
});

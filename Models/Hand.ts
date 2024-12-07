import { cardPrinter } from "./Card";
import type { Card, Colour } from "./Card";

import { createDeck } from "./Deck";
import type { Deck } from "./Deck";
import type { Player } from "./Player";

export interface Hand {
  /** The discard pile of played cards */
  discardPile: Card[];

  /** Index of the current player's turn */
  readonly currentTurnIndex: number;

  /** Allows the current player to play a card by its index */
  playCard: (selectedCard: Card) => void;

  /** Allows a player to draw a specified number of cards */
  drawCards: (player: Player, numberOfCards: number) => void;

  /** Ends the current hand*/
  endHand: () => void;

  /** Determines if the hand is over*/
  isHandOver: () => boolean;

  /** The deck of cards */
  deck: Deck;

  skipPlayerTurn: (
    playerAtHandIndex: number,
    directionOfPlay: number
  ) => number;

  updatePlayerAtHandIndex: (
    playerAtHandIndex: number,
    directionOfPlay: number
  ) => number;

  drawCard: (currentPlayer: Player) => Card;
  getPlayerAtHand(): Player;
}
/**
 * Creates and initializes a new hand with the given players.
 */
export const createHand = (players: Player[]): Hand => {
  const deck = createDeck();
  deck.shuffle();

  let discardPile: Card[] = [];
  let currentTopCard: Card;

  do {
    currentTopCard = deck.deal(1)[0];
    discardPile.push(currentTopCard);
  } while (currentTopCard.type !== "NUMBERED");

  console.log("Dealing 7 cards to each player...\n");
  players.forEach((player) => {
    player.hand = deck.deal(7);
  });

  let currentTurnIndex: number = 0;

  const playDrawTwoCard = (currentPlayer: Player, cardIndex: number) => {};

  const playCard = (selectedCard: Card) => {
    const player = players[currentTurnIndex]; // get the current player
    const { hand } = player;

    console.log("Selected card:", selectedCard);
    console.log("Current player hand:", player.hand);

    if (canPlayCard(selectedCard)) {
      const index = hand.findIndex(
        (card) =>
          card.type === selectedCard.type && card.colour === selectedCard.colour
      );
      hand.splice(index, 1)[0];

      switch (selectedCard.type) {
        case "NUMBERED": {
          console.log("Card that was played:", cardPrinter(selectedCard));
          currentTurnIndex = (currentTurnIndex + 1) % players.length;
          break;
        }
        case "SKIP": {
          console.log(`${player.username} played a Skip!`);
          currentTurnIndex = (currentTurnIndex + 2) % players.length;
        }
        case "REVERSE": {
          players.reverse();
          console.log("Order of play has been reversed!");
          currentTurnIndex = (currentTurnIndex + 1) % players.length;
          break;
        }
        case "DRAWTWO": {
          console.log(`${player.username} played a Draw Two!`);

          const nextPlayer = players[(currentTurnIndex + 1) % players.length];
          currentTurnIndex = (currentTurnIndex + 2) % players.length;

          console.log(`${nextPlayer.username} must draw two cards!`);
          console.log("draw before", nextPlayer.hand);
          for (let i = 0; i < 2; i++) {
            drawCard(nextPlayer);
          }
          console.log(`
            ${nextPlayer.username} has drawn two cards and their turn is skipped!
          `);
          console.log("draw after", nextPlayer.hand);
          break;
        }
        case "WILD": {
          const newColour: Colour = "Blue";
          console.log(`You selected ${newColour}!`);

          selectedCard = { ...selectedCard, colour: newColour };
          currentTurnIndex = (currentTurnIndex + 1) % players.length;
          break;
        }
        case "WILDDRAWFOUR": {
          const newColour: Colour = "Blue";
          console.log(`You selected ${newColour}!`);

          const nextPlayer = players[(currentTurnIndex + 1) % players.length];
          console.log(`${nextPlayer.username} must draw four cards!`);
          for (let i = 0; i < 4; i++) {
            drawCard(nextPlayer);
          }

          console.log(`${nextPlayer.username}'s turn is skipped!`);
          selectedCard = { ...selectedCard, colour: newColour };
          currentTurnIndex = (currentTurnIndex + 2) % players.length;
          break;
        }
      }
      discardPile.push(selectedCard);

      console.log("Current player hand after play:", player.hand);

      if (isHandOver()) {
        endHand();
        return;
      }
    }
  };

  const getPlayerAtHand = () => {
    return players[currentTurnIndex];
  };

  const drawCards = (player: Player, numberOfCards: number) => {
    for (let i = 0; i < numberOfCards; i++) {
      if (deck.size() === 0) {
        const topCard = discardPile.pop();
        deck.addCards(discardPile);

        discardPile.length = 0;
        if (topCard) discardPile.push(topCard);
        deck.shuffle();

        const card = deck.deal(1)[0];
        if (card) {
          player.hand.push(card);
        }
      }
    }
    console.log(`${player.username} drew ${numberOfCards} card(s)`);
    console.log(player.hand);
  };

  const drawCard = (currentPlayer: Player): Card => {
    const drawnCards = deck.deal(1);

    currentPlayer.hand.push(...drawnCards);
    const cardToReturn = drawnCards[0];
    return cardToReturn;

    // currentHand.value.deck = { ...currentHand.value.deck };

    // if (players.value[playerAtHandIndex.value].isBot) {
    //   botPlay();
    // }
  };

  const canPlayCard = (card: Card): boolean => {
    const topCardFromDiscardPile = discardPile[discardPile.length - 1];

    return (
      // match by color
      card.colour === topCardFromDiscardPile.colour ||
      // match by number
      (card.type === "NUMBERED" &&
        topCardFromDiscardPile.type === "NUMBERED" &&
        card.value === topCardFromDiscardPile.value) ||
      // match by action/symbol
      (["REVERSE", "SKIP", "DRAWTWO"].includes(card.type) &&
        card.type === topCardFromDiscardPile.type) ||
      // wild and wild draw four can be played anytime
      card.type === "WILD" ||
      card.type === "WILDDRAWFOUR"
    );
  };

  const endHand = () => {
    const winner = players.find((player) => player.hand.length === 0) || null;
    if (winner) {
      console.log(`${winner.username} won the hand!`);
    }
  };
  const isHandOver = (): boolean => {
    return players.some((player) => player.hand.length === 0);
  };

  const skipPlayerTurn = (
    playerAtHandIndex: number,
    directionOfPlay: number
  ) => {
    resetUno(playerAtHandIndex);
    return (playerAtHandIndex =
      (playerAtHandIndex + directionOfPlay * 2 + players.length) %
      players.length);
  };

  const resetUno = (playerIndex: number) => {
    if (players[playerIndex].hand.length > 1)
      players[playerIndex].calledUNO = false;
  };

  const updatePlayerAtHandIndex = (
    playerAtHandIndex: number,
    directionOfPlay: number
  ) => {
    return (playerAtHandIndex =
      (playerAtHandIndex + directionOfPlay + players.length) % players.length);
  };

  return {
    playCard,
    drawCards,
    discardPile,
    currentTurnIndex,
    endHand,
    isHandOver,
    deck,
    skipPlayerTurn,
    updatePlayerAtHandIndex,
    drawCard,
    getPlayerAtHand,
  };
};

//todo: fix the deck so that it doesn't run out of cards

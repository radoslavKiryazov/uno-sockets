import { cardPrinter } from "./Card_model";
import type { Card, Colour } from "./Card_model";

import { createDeck } from "./Deck_model";
import type { Deck } from "./Deck_model";
import type { Player } from "./Player_model";

export interface Hand {
  /** The discard pile of played cards */
  discardPile: Card[];

  /** Index of the current player's turn */
  readonly currentTurnIndex: number;

  /** Allows the current player to play a card by its index */
  playCard: (selectedCardIndex: number) => void;

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

  drawCard: (currentPlayer: Player, numberOfCards?: number) => void;
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

  const playCard = (selectedCardIndex: number) => {
    const player = players[currentTurnIndex]; // get the current player
    const { hand } = player;
    let selectedCard = hand[selectedCardIndex - 1]; // -1 because the index is 1 based

    if (canPlayCard(selectedCard)) {
      player.hand =
        hand.findIndex((c) => c === selectedCard) !== -1
          ? hand.filter((c) => c !== selectedCard)
          : hand;

      switch (selectedCard.type) {
        case "NUMBERED": {
          console.log("Card that was played:", cardPrinter(selectedCard));
          currentTurnIndex = (currentTurnIndex + 1) % players.length;
          break;
        }
        case "SKIP": {
          console.log(`${player.name} played a Skip!`);
          currentTurnIndex = (currentTurnIndex + 2) % players.length;
        }
        case "REVERSE": {
          players.reverse();
          console.log("Order of play has been reversed!");
          currentTurnIndex = (currentTurnIndex + 1) % players.length;
          break;
        }
        case "DRAWTWO": {
          console.log(`${player.name} played a Draw Two!`);

          const nextPlayer = players[(currentTurnIndex + 1) % players.length];
          currentTurnIndex = (currentTurnIndex + 2) % players.length;

          console.log(`${nextPlayer.name} must draw two cards!`);
          drawCards(nextPlayer, 2);
          console.log(`
            ${nextPlayer.name} has drawn two cards and their turn is skipped!
          `);
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
          console.log(`${nextPlayer.name} must draw four cards!`);
          drawCards(nextPlayer, 4);

          console.log(`${nextPlayer.name}'s turn is skipped!`);
          selectedCard = { ...selectedCard, colour: newColour };
          currentTurnIndex = (currentTurnIndex + 2) % players.length;
          break;
        }
      }
      discardPile.push(selectedCard);

      if (isHandOver()) {
        endHand();
        return;
      }
    }
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
    console.log(`${player.name} drew ${numberOfCards} card(s)`);
    console.log(player.hand);
  };

  const drawCard = (currentPlayer: Player, numberOfCards: number = 1) => {
    const drawnCards = deck.deal(numberOfCards);

    currentPlayer.hand.push(...drawnCards);

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
      console.log(`${winner.name} won the hand!`);
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
  };
};

//todo: fix the deck so that it doesn't run out of cards

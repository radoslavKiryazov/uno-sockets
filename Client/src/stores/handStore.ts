import { defineStore } from "pinia";
import { reactive } from "vue";

import { type Card } from "../../../Models/Card";
import { usePopUpStore } from "./popUpStore";

export const useHandStore = defineStore("handStore", () => {
  const popUpStore = usePopUpStore();
  const { showColourPopUp, hideColourPopUp } = popUpStore;

  const state = reactive({
    hand: [] as Array<Card>,
    deckSize: 0,
    discardPile: [] as Array<Card>,
    playerAtHand: "",
  });

  // Method to set the entire hand
  const setHand = (newHand: any[]) => {
    console.log("Updating hand:", newHand);
    state.hand = newHand; // This replaces the array reference, ensuring reactivity
  };

  // Method to add a card to the hand
  const addCard = (card: any) => {
    console.log("Adding card to hand:", card);
    console.log("Current hand:", state.hand);
    state.hand.hand.push(card); // Push to array, which Vue tracks reactively
  };

  const updateDeckSize = (deckSize: number) => {
    console.log("Updating deck size:", deckSize);
    state.deckSize = deckSize;
  };

  const setDiscardPile = (discardPile: Card[]) => {
    console.log("Updating discard pile:", discardPile);
    state.discardPile = discardPile;
  };

  const removeCard = (card: Card) => {
    state.hand.hand = state.hand.hand.filter((c) => c !== card);
    console.log("Removing card from hand:", card);
    console.log("Current hand:", state.hand);
  };

  const addCardToDiscardPile = (card: Card) => {
    state.discardPile.push(card);
  };

  const updateDiscardPile = (discardPile: Card[]) => {
    state.discardPile = [...discardPile];
  };

  const updatePlayerAtHand = (playerAtHand: string) => {
    state.playerAtHand = playerAtHand;
  };

  const handleWildCard = (card: Card) => {
    showColourPopUp();
  };

  return {
    state,
    setHand,
    addCard,
    updateDeckSize,
    setDiscardPile,
    addCardToDiscardPile,
    removeCard,
    updateDiscardPile,
    updatePlayerAtHand,
    handleWildCard,
  };
});

//utill

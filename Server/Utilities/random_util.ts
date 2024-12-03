// A function that returns a (possibly) random number from 0 to bound - 1
// Define a randomizer function type
export const standardRandomizer = (n: any) => Math.floor(Math.random() * n);

// A function that shuffles the given array
// Define a shuffler function type
export const standardShuffler = (cards: any) => {
  for (let i = 0; i < cards.length - 1; i++) {
    const j = Math.floor(Math.random() * (cards.length - i) + i);
    const temp = cards[j];
    cards[j] = cards[i];
    cards[i] = temp;
  }
};

export const canPlayCard = (card: any, topCardFromDiscardPile: any) => {
  if (!topCardFromDiscardPile) {
    return true;
  }
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

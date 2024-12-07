import type { Card } from "./Card";

export interface Player {
  readonly username: string;
  hand: Card[];
  score: number;
  isBot?: boolean;
  calledUNO?: boolean;
  unoCalledOut?: boolean;
}

export const createPlayer = (
  username: string,
  hand: Card[],
  isBot = false,
  calledUNO = false,
  unoCalledOut = false
) => {
  return { name, hand, score: 0, isBot, calledUNO, unoCalledOut };
};

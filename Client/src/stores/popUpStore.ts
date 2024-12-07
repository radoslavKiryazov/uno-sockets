import { defineStore } from "pinia";
import { ref } from "vue";

import { getSocket } from "../services/socketService";

import { type Colour } from "../model/Card_model";

export const usePopUpStore = defineStore("popUpStore", () => {
  const socket = getSocket();

  const colourPopupTrigger = ref({
    buttonTrigger: false,
    timeTrigger: false,
  });

  const showColourPopUp = () => {
    colourPopupTrigger.value.buttonTrigger = true;
  };

  const hideColourPopUp = () => {
    colourPopupTrigger.value.buttonTrigger = false;
  };

  return {
    showColourPopUp,
    hideColourPopUp,
    colourPopupTrigger,
  };
});

//play card
//triger pop up
//wait for user to choose color.
//then proceed.

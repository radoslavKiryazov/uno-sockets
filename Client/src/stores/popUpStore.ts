import { defineStore } from "pinia";
import { ref } from "vue";

export const usePopUpStore = defineStore("popUpStore", () => {
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

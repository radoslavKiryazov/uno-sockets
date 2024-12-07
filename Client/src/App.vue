<script setup lang="ts">
import { useUserStore } from "./stores/userStore";
import ColourSelectionPopup from "./components/popups/ColourSelectionPopup.vue";
import HandEndPopup from "./components/popups/HandEndPopup.vue";
import GameOverPopup from "./components/popups/GameOverPopup.vue";
import { useHandStore } from "./stores/handStore";
import { usePopUpStore } from "./stores/popUpStore";

const popUpStore = usePopUpStore();

const { colourPopupTrigger } = popUpStore;
</script>

<template>
  <ColourSelectionPopup v-if="colourPopupTrigger.buttonTrigger" />
  <!-- <HandEndPopup v-if="gameStore.handOverPopupTrigger" />
  <GameOverPopup v-if="gameStore.gameOverPopupTrigger" /> -->

  <router-view />
</template>

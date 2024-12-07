<template>
  <Popup>
    <div class="flex flex-col justify-center items-center gap-3">
      <h1>Pick a color</h1>
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="colour in colours"
          :key="colour"
          :style="{ backgroundColor: colour }"
          class="w-10 h-10 rounded-full"
          @click="selectColour(colour)"
        ></button>
      </div>
    </div>
  </Popup>
</template>
<script setup lang="ts">
import Popup from "./Popup.vue";
import type { Colour } from "../../../Models/Card";
import { getSocket } from "../../services/socketService";
import { usePopUpStore } from "../../stores/popUpStore";

const colours: Colour[] = ["Blue", "Green", "Red", "Yellow"] as const;

const socket = getSocket();
const popUpStore = usePopUpStore();
const selectColour = (colour: Colour) => {
  if (socket) {
    console.log("emit colourSelected", colour);

    popUpStore.hideColourPopUp();

    socket.emit("change-colour", { colour });
  }
};
</script>

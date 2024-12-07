<template>
  <div class="h-screen w-screen bg-gray-500">
    <div class="flex flex-row h-1/3 justify-center py-5">
      <Oponent
        v-if="userStore.connectedPlayers[1]"
        :player="userStore.connectedPlayers[1]"
        :playerIndex="1"
      />
      <Placeholder v-else />
    </div>
    <div class="flex flex-row h-1/3 justify-between items-center px-10">
      <div>
        <Oponent
          v-if="userStore.connectedPlayers[2]"
          :player="userStore.connectedPlayers[2]"
          :playerIndex="2"
        />
        <Placeholder v-else />
      </div>
      <Overview />
      <div>
        <Oponent
          v-if="userStore.connectedPlayers[0]"
          :player="userStore.connectedPlayers[0]"
          :playerIndex="0"
        />
        <Placeholder v-else />
      </div>
    </div>
    <div class="flex flex-row h-1/3 justify-center items-center overflow-auto">
      <MainPlayer />
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/gameStore";
import {useUserStore} from "../stores/userStore";
import MainPlayer from "./MainPlayer.vue";
import Oponent from "./Oponent.vue";
import Overview from "./Overview.vue";
import Placeholder from "./Placeholder.vue";

const store = useGameStore();
const userStore = useUserStore();

console.log('userStore', userStore.store)
</script>

<template>
  <h1>
    Currently playing:
    <span class="font-bold underline">{{ state.playerAtHand }} </span>
  </h1>
</template>

<script setup>
import { useHandStore } from "../stores/handStore";

const handStore = useHandStore();

const { state } = handStore;
</script>

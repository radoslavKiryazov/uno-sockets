import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { type Player } from "../../../Models/Player";

export const useUserStore = defineStore("player", () => {
  const user = ref({ id: "", username: "" });
  const connectedPlayers = ref<Player[]>([]);

  const setUserName = (username: string) => {
    console.log("Setting username", username);
    user.value.username = username;
  };

  const setUserId = (id: string) => {
    user.value.id = id;
  };

  const clearUser = () => {
    user.value = null;
  };

  const updatePlayerInfo = (player: Player) => {
    const playerIndex = connectedPlayers.value.findIndex(
      (p) => p.username === player.username
    );

    if (playerIndex === -1) return;
    console.log("player to update", connectedPlayers.value[playerIndex]);
    connectedPlayers.value[playerIndex] = player;
  };

  const setConnectedPlayers = (players: Player[]) => {
    connectedPlayers.value = players;
    console.log("connectedPlayers", connectedPlayers.value);
  };

  const addPlayer = (player: Player) => {
    connectedPlayers.value.push(player);
  };

  const removePlayer = (player) => {
    connectedPlayers.value = connectedPlayers.value.filter(
      (p) => p.name !== player.username
    );
  };

  return {
    user,
    setUserName,
    setUserId,
    clearUser,
    connectedPlayers,
    setConnectedPlayers,
    updatePlayerInfo,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type User } from "../model/User";

export const useUserStore = defineStore("player", () => {
  const user = ref<User | null>(null);
  const connectedPlayers = ref<User[]>([]);

  const setUser = (username: string) => {
    const userData = { username };
    user.value = userData;
    console.log("User set to: ", user.value);
  };

  const clearUser = () => {
    user.value = null;
  };

  const setConnectedPlayers = (players: User[]) => {
    connectedPlayers.value = players;
  };

  const addPlayer = (player: User) => {
    connectedPlayers.value.push(player);
  };

  const removePlayer = (player: User) => {
    connectedPlayers.value = connectedPlayers.value.filter(
      (p) => p.username !== player.username
    );
  };

  const userName = computed;

  return { user, setUser, clearUser, connectedPlayers, setConnectedPlayers };
});

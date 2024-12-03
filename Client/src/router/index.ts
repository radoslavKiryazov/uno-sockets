// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import GameBoard from "../components/GameBoard.vue";
import Login from "../pages/Login.vue";
import SignUp from "../pages/SignUp.vue";
import WaitingRoom from "../components/WaitingRoom.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/play",
    name: "GameBoard",
    component: GameBoard,
  },
  {
    path: "/waitingroom",
    name: "WaitingRoom",
    component: WaitingRoom,
  },
  {
    path: "/signup",
    name: "signup",
    component: SignUp,
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

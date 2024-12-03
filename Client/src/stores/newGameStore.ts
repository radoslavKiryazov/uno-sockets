import { defineStore } from "pinia";
import { reactive, computed } from "vue";


export const useGameStore = defineStore("gameStore", () => {
    const state = reactive({
        hand: {
            currentTurnIndex: 0,
            deck: [],
            discardPile: [],
        }
    });

    console.log('Store initialized:', state); // Should log the `state` object


    return {
        state,
    };
    
 
});

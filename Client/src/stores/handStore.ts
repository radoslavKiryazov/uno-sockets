import { defineStore } from "pinia";
import { reactive, computed } from "vue";


export const useHandStore = defineStore("handStore", () => {
    const state = reactive({
        hand: []
    });

    console.log('HandStore initialized:', state); // Should log the `state` object

    return {
        state,
    };
    
 
});

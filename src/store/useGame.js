import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export default create(subscribeWithSelector((set) => {
    return {
      blocksCount: 10,
      blocksSeed: 0,


      startTime:0,
      endTime:0,

      // Phases
      phase: "ready",

      start: () => {
        set((state) => {
        //   console.log(state);
          if (state.phase === "ready") { //to fix erro in previous vid, change to this
            return { phase: "playing", startTime: Date.now() };
          }

          return {};
        });
      },

      restart: () => {
        set((state) => {
        //   console.log(state);
          if (state.phase === "playing" || state.phase === "ended") { //to fix erro in previous vid, change to this
            return { phase: "ready", blocksSeed: Math.random() };
          }

          return {};
        });
      },

      end: () => {
        set((state) => {
        //   console.log(state);
          if (state.phase === "playing") { //to fix erro in previous vid, change to this
            return { phase: "ended", endTime: Date.now() };
          }

          return {};
        });
      },
    };
  })
);

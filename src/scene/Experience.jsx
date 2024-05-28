import React from "react";
import Lights from "../components/Lights";
import { Physics } from "@react-three/rapier";
import Level from "../components/Level";
import Player from "../components/Player";
import useGame from "../store/useGame";

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount); //solution change to this to fix the refreshing problem when call the start function
  const blocksSeed = useGame((state) => state.blocksSeed); 
  return (
    <>
      <color args={[ '#bdedfc']} attach="background"/>
      <Physics>
        <Lights />
        <Level count={blocksCount} seed={blocksSeed} />
        <Player />
      </Physics>
    </>
  );
}

import React, { useEffect, useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import useGame from "../store/useGame";
import { log } from "three/examples/jsm/nodes/Nodes.js";

export default function Player() {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const smoothedCameraPosition = new THREE.Vector3(10, 10, 10);
  const smoothedCameraTarget = new THREE.Vector3();

  const start  = useGame((state) => state.start);
  const end  = useGame((state) => state.end);
  const restart  = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount)

  const jump = () => {
    console.log("yes, jump");

    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    // toi - time of impact
    if (hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  const reset = () => {
    body.current.setTranslation({x: 0, y: 1, z: 0})
    body.current.setLinvel({x: 0, y: 0, z: 0})
    body.current.setAngvel({x: 0, y: 0, z: 0})
  }

  useEffect(() => {

    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if(value === "ready"){
          reset()
        }
      }
    )


    const unsubscribeJump = subscribeKeys(
      //selector
      (state) => {
        return state.jump;
      },

      (value) => {
        // console.log('jump', value);
        if (value) {
          jump();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(
      () => {
        return start()
      }
    );

    return () => {
      unsubscribeJump();
      unsubscribeAny();
      unsubscribeReset();
    };
  }, []);

  useFrame((state, delta) => {
    /** CONTROLS */

    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (leftward) {
      impulse.x -= impulseStrength;
      torque.x += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    /** CAMERA */
    const bodyPosition = body.current.translation();

    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    // PHASES to know if the palyer is at the end of the game
    if(bodyPosition.z < - (blocksCount * 4 +2)){
      // console.log('game end')
      end()
    }

    if(bodyPosition.y < - 4){
      // console.log('Ahhhhhh!!')
      restart()
    }

  });

  return (
    <>
      <RigidBody
        ref={body}
        colliders="ball"
        position={[0, 1, 0]}
        restitution={0.2}
        friction={1}
        canSleep={false}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
      </RigidBody>
    </>
  );
}

"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function ThreeCanvas() {
  return (
    <Canvas
      // className="!h-full"
      camera={{ fov: 30, position: [0, 0, 20] }} // 调整相机位置
      shadows
      style={{ background: "black" }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight color="#cc7b32" position={[5, 5, 5]} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="#cc7b32" />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Group } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export default function ThreeCanvas() {
  const { modelManager } = useGenerationManager();
  const boxSize = modelManager.boundingBoxSize;
  const [fbxModel, setFbxModel] = useState<Group | null>(null);
  const currentModel = modelManager.model;

  useEffect(() => {
    if (currentModel) {
      const loadModel = async () => {
        try {
          const loader = new FBXLoader();
          const loadedModel = await loader.loadAsync(`/models/${currentModel}`);
          setFbxModel(loadedModel);
        } catch (error) {
          console.error("Error loading model:", error);
        }
      };
      loadModel();
    } else {
      setFbxModel(null); // 如果 model 不存在，确保 fbxModel 为 null
    }
  }, [currentModel]);

  return (
    <Canvas
      camera={{ fov: 30, position: [0, 0, 20] }}
      shadows
      style={{ background: "black" }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight color="#cc7b32" position={[5, 5, 5]} />
      {fbxModel ? (
        <primitive object={fbxModel} />
      ) : (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[boxSize.length, boxSize.height, boxSize.width]} />
          <meshStandardMaterial color="#cc7b32" />
        </mesh>
      )}
      <OrbitControls />
    </Canvas>
  );
}

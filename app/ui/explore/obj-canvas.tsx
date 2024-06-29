"use client";
import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Group, Mesh, MeshStandardMaterial, DoubleSide } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default function ThreeCanvas() {
  const { modelManager } = useGenerationManager();
  const boxSize = modelManager.boundingBoxSize;
  const [currentObjModel, setCurrentObjModel] = useState<Group | null>(null);
  const generatedNewModel = modelManager.model;

  const sharedMaterial = new MeshStandardMaterial({
    metalness: 0.1,
    roughness: 0.5,
    side: DoubleSide,
    color: "#cc7b32",
  });

  useEffect(() => {
    if (generatedNewModel) {
      const loadModel = async () => {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const arrayBuffer = reader.result;
            const loader = new OBJLoader();
            const loadedModel = loader.parse(
              new TextDecoder().decode(arrayBuffer as ArrayBuffer)
            );
            loadedModel.traverse((child) => {
              if ((child as Mesh).isMesh) {
                const mesh = child as Mesh;
                mesh.material = sharedMaterial;
              }
            });
            setCurrentObjModel(loadedModel);
          };
          reader.onerror = (error) => {
            console.error("Error reading model Blob:", error);
          };
          reader.readAsArrayBuffer(generatedNewModel);
        } catch (error) {
          console.error("Error loading model:", error);
        }
      };
      loadModel();
    } else {
      setCurrentObjModel(null);
    }
  }, [generatedNewModel]);

  return (
    <Canvas
      camera={{ fov: 30, position: [0, 0, 20] }}
      shadows
      style={{ background: "black" }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight color="#cc7b32" position={[5, 5, 5]} />
      {currentObjModel ? (
        <primitive object={currentObjModel} />
      ) : (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[boxSize.length, boxSize.height, boxSize.width]} />
          <meshStandardMaterial {...sharedMaterial} />
        </mesh>
      )}
      <OrbitControls />
    </Canvas>
  );
}

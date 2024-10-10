"use client";
import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Group, Mesh, MeshStandardMaterial, DoubleSide } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Plane } from "@react-three/drei";
import { screenshotService } from "@/app/lib/services";
function Scene() {
  const { gl, scene, camera } = useThree();
  const { modelManager } = useGenerationManager();
  const boxSize = modelManager.boundingBoxSize;
  const [currentObjModel, setCurrentObjModel] = useState<Group | null>(null);
  const generatedNewModel = modelManager.model;

  const sharedMaterial = new MeshStandardMaterial({
    metalness: 0.4,
    roughness: 0.7,
    side: DoubleSide,
    color: "#cc7b32",
  });

  useEffect(() => {
    screenshotService.setCaptureFunction(() => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    });
  }, [gl, scene, camera]);

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
  }, [generatedNewModel, sharedMaterial]);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 20, 100]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight
        color="#ffffff"
        position={[5, 5, 5]}
        intensity={1}
        castShadow
      />
      <spotLight
        position={[-5, 5, 5]}
        angle={0.15}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
      {currentObjModel ? (
        <primitive object={currentObjModel} castShadow receiveShadow />
      ) : (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[boxSize.length, boxSize.height, boxSize.width]} />
          <meshStandardMaterial {...sharedMaterial} />
        </mesh>
      )}
      <Plane
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -boxSize.height / 2, 0]}
        args={[100, 100]}
      >
        <shadowMaterial opacity={0.2} />
      </Plane>
      <Environment preset="apartment" />
      <OrbitControls />
    </>
  );
}

export default function ThreeCanvas() {
  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 20] }}
      shadows
      style={{ background: "black" }}
    >
      <Scene />
    </Canvas>
  );
}

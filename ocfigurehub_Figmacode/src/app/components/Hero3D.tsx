// @ts-nocheck
/// <reference types="@react-three/fiber" />
"use client";

import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, useGLTF, OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";

interface SceneState {
  isHovered: boolean;
  isModelHovered: boolean;
  scrollProgress: number;
  mouse: { x: number; y: number };
  ringSpeedMultiplier: number;
}

const dataChips = Array.from({ length: 15 }).map(() => {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 2.5 + 0.5;
  return {
    angle,
    radius,
    y: Math.random() * 8 - 1,
    speed: Math.random() * 0.02 + 0.01,
    riseSpeed: Math.random() * 0.05 + 0.02,
    size: Math.random() * 0.1 + 0.02,
  };
});

function HolographicPlatform({ stateRef }: { stateRef: React.MutableRefObject<SceneState> }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const chipsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speedMultiplier = (stateRef.current.isHovered ? 2.5 : 1) + stateRef.current.scrollProgress * 5;

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.15 + Math.sin(t * 5) * 0.02;
    }
    if (ringsRef.current) {
      const children = ringsRef.current.children;
      for (let i = 0, len = children.length; i < len; i++) {
        children[i].rotation.z = t * ((i & 1) === 0 ? 1 : -1) * 0.2 * speedMultiplier;
      }
    }
    if (chipsRef.current) {
      const children = chipsRef.current.children;
      const totalHeight = 8;
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        const data = dataChips[i];
        const currentAngle = data.angle + t * data.speed * speedMultiplier;
        child.position.x = Math.cos(currentAngle) * data.radius;
        child.position.z = Math.sin(currentAngle) * data.radius;
        const currentY = data.y + t * data.riseSpeed * speedMultiplier;
        child.position.y = ((currentY + 1) % totalHeight) - 1;
        child.rotation.x = t * 2;
        child.rotation.y = t * 2;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group position={[0, -0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[2.8, 3.5, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[2.8, 32]} />
          <meshStandardMaterial color="#000000" metalness={1} roughness={0.1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[2.6, 2.65, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.5, 1.52, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={1.5} />
        </mesh>
      </group>
      <group ref={ringsRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0.5]}>
          <torusGeometry args={[3.2, 0.02, 8, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={4} />
        </mesh>
        <mesh position={[0, 0, 1.5]}>
          <torusGeometry args={[3.4, 0.01, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0, 0, -1]}>
          <torusGeometry args={[3.0, 0.03, 8, 32, Math.PI * 0.8]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={5} />
        </mesh>
      </group>
      <group ref={chipsRef}>
        {dataChips.map((data, i) => (
          <mesh key={i} scale={data.size}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={2} transparent opacity={0.8}/>
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0.5, 0]} color="#8B5CF6" intensity={2} distance={8} />
    </group>
  );
}

function ReactiveParticles({ stateRef }: { stateRef: React.MutableRefObject<SceneState> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 40;
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));
  const lifetimes = useRef(new Float32Array(count));
  const maxLifetimes = useRef(new Float32Array(count));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 4;
      const y = (Math.random() - 0.5) * 6;
      positions.current[i * 3] = Math.cos(angle) * radius;
      positions.current[i * 3 + 1] = y;
      positions.current[i * 3 + 2] = Math.sin(angle) * radius;
      velocities.current[i * 3] = (Math.random() - 0.5) * 0.008;
      velocities.current[i * 3 + 1] = 0.005 + Math.random() * 0.015;
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
      maxLifetimes.current[i] = 2 + Math.random() * 4;
      lifetimes.current[i] = Math.random() * maxLifetimes.current[i];
    }
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const { mouse, isHovered } = stateRef.current;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const mdx = mouse.x * 0.0003;
    const mdy = mouse.y * 0.0002;
    const speedMult = isHovered ? 1.5 : 1;

    for (let i = 0; i < count; i++) {
      lifetimes.current[i] -= 0.004;
      if (lifetimes.current[i] <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 3;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = -2.5;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
        velocities.current[i * 3] = (Math.random() - 0.5) * 0.015 * speedMult;
        velocities.current[i * 3 + 1] = 0.01 + Math.random() * 0.02;
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.015 * speedMult;
        lifetimes.current[i] = maxLifetimes.current[i] * (isHovered ? 0.6 : 1);
      } else {
        pos[i * 3] += velocities.current[i * 3] + mdx;
        pos[i * 3 + 1] += velocities.current[i * 3 + 1] + mdy;
        pos[i * 3 + 2] += velocities.current[i * 3 + 2];
        if (pos[i * 3 + 1] > 4) { pos[i * 3 + 1] = -2.5; lifetimes.current[i] = 0; }
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions.current, 3]} /></bufferGeometry>
      <pointsMaterial size={0.025} color="#8B5CF6" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false}/>
    </points>
  );
}

const MODELS = [
  "/rose-gold-sentinel.glb",
  "/Valkyrie_Mech.glb",
  "/robot.glb",
  "/monster.glb"
];

function Model({ stateRef }: { stateRef: React.MutableRefObject<SceneState> }) {
  const groupRef = useRef<THREE.Group>(null);
  const forcefieldRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const [modelIndex, setModelIndex] = useState(0);
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);
  const loadedSceneRef = useRef<THREE.Group | null>(null);
  const modelIndexRef = useRef(0);

  const gltfs = useGLTF(MODELS);

  const processedScenes = useMemo(() => {
    const _box = new THREE.Box3();
    const _size = new THREE.Vector3();
    const _center = new THREE.Vector3();

    return gltfs.map((gltf, i) => {
      const original = gltf.scene;
      const cloned = original.clone();

      _box.setFromObject(cloned);
      _size.copy(_box.max).sub(_box.min);
      const maxDim = Math.max(_size.x, _size.y, _size.z);

      _box.setFromObject(cloned);
      _center.copy(_box.max).add(_box.min).multiplyScalar(0.5);
      cloned.position.sub(_center);

      const meshList: THREE.Mesh[] = [];
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          
          // FIX: Many GLB files from Blender export with transparent=true and depthWrite=false
          // which causes the "inside-out" or "broken" polygon glitch.
          mat.transparent = false;
          mat.depthWrite = true;
          mat.alphaTest = 0.5;
          mat.side = THREE.DoubleSide;
          
          meshList.push(mesh);
        }
      });

      return { scene: cloned, meshes: meshList };
    });
  }, [gltfs]);

  useEffect(() => {
    setLoadedScene(processedScenes[modelIndex].scene);
    loadedSceneRef.current = processedScenes[modelIndex].scene;
  }, [processedScenes, modelIndex]);

  const targetRotation = useRef({ x: 0, y: 0 });
  const jumpProgress = useRef(0);
  const hasSwapped = useRef(false);
  const scaleVec = useRef(new THREE.Vector3(1, 1, 1));

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const { mouse, isModelHovered } = stateRef.current;

    if (!isModelHovered) {
      let rotationSpeed = 0;
      if (mouse.x > 0.05) rotationSpeed = 1.5;
      else if (mouse.x < -0.05) rotationSpeed = -1.5;
      targetRotation.current.y += rotationSpeed * delta;
      targetRotation.current.x = mouse.y * (Math.PI / 12);
    }
    if (isModelHovered) {
      targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, 0, 0.05);
    }

    if (jumpProgress.current > 0) {
      jumpProgress.current -= delta * 1.2;
      if (jumpProgress.current < 0) jumpProgress.current = 0;
      const progress = 1 - jumpProgress.current;
      const jumpY = Math.sin(progress * Math.PI) * 1.8;

      targetRotation.current.y += delta * 12;

      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, jumpY, 0.2);

      const scaleMult = Math.pow(Math.abs(progress - 0.5) * 2, 0.5);
      groupRef.current.scale.setScalar(scaleMult);

      if (jumpProgress.current < 0.5 && !hasSwapped.current) {
        hasSwapped.current = true;
        modelIndexRef.current = (modelIndexRef.current + 1) % MODELS.length;
        setModelIndex(modelIndexRef.current);
      }

      if (forcefieldRef.current) {
        forcefieldRef.current.scale.setScalar(progress * 8 + 0.1);
        const ffMat = forcefieldRef.current.material as THREE.MeshStandardMaterial;
        ffMat.opacity = jumpProgress.current * 0.4;
        forcefieldRef.current.visible = jumpProgress.current > 0;
      }
      if (shockwaveRef.current) {
        shockwaveRef.current.scale.setScalar(progress * 20 + 0.1);
        const swMat = shockwaveRef.current.material as THREE.MeshStandardMaterial;
        swMat.opacity = jumpProgress.current;
        shockwaveRef.current.visible = jumpProgress.current > 0;
      }
    } else {
      const scrollY = stateRef.current.scrollProgress * 6;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, scrollY, 0.1);
      groupRef.current.scale.lerp(scaleVec.current, 0.1);
      if (forcefieldRef.current) forcefieldRef.current.visible = false;
      if (shockwaveRef.current) shockwaveRef.current.visible = false;
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.05);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (jumpProgress.current > 0) return;
    jumpProgress.current = 1;
    hasSwapped.current = false;
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {processedScenes.map((sceneObj, index) => {
        const isActive = loadedScene === sceneObj.scene;
        return (
          <primitive 
            key={index} 
            object={sceneObj.scene} 
            scale={isActive ? 2.5 : 0.000001} 
            visible={true}
          />
        );
      })}
      <mesh
        visible={true}
        position={[0, 0.5, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); stateRef.current.isModelHovered = true; document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); stateRef.current.isModelHovered = false; document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[1.5, 1.5, 6, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <mesh ref={forcefieldRef} visible={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={3} transparent opacity={0.5} wireframe />
      </mesh>
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={5} transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene({ stateRef }: { stateRef: React.MutableRefObject<SceneState> }) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7));

  useFrame(({ clock }) => {
    const { mouse, scrollProgress } = stateRef.current;
    targetCamPos.current.x = THREE.MathUtils.lerp(targetCamPos.current.x, mouse.x * 0.5, 0.02);
    targetCamPos.current.y = THREE.MathUtils.lerp(targetCamPos.current.y, mouse.y * 0.3, 0.02);
    targetCamPos.current.z = THREE.MathUtils.lerp(targetCamPos.current.z, 8 - scrollProgress * 1.5, 0.02);
    camera.position.lerp(targetCamPos.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#ffffff", "#ffffff", 0.5]} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <spotLight position={[-3, 1, -4]} intensity={5} color="#ffffff" angle={0.7} penumbra={1} />
      <pointLight position={[0, 4, 1]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, -3, 0]} intensity={0.5} color="#ffffff" />

      <group position={[0.5, -0.5, 0]}>
        <group scale={0.8} position={[0, -1.5, 0]}>
          <HolographicPlatform stateRef={stateRef} />
          <ReactiveParticles stateRef={stateRef} />
        </group>
        <Suspense fallback={null}>
          <Float speed={1} rotationIntensity={0} floatIntensity={0.08} floatingRange={[-0.05, 0.05]}>
            <group position={[0, 1, 0]}>
              <Model stateRef={stateRef} />
            </group>
          </Float>
          <Environment preset="warehouse" />
        </Suspense>
      </group>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const stateRef = useRef<SceneState>({
    isHovered: false, isModelHovered: false, scrollProgress: 0, mouse: { x: 0, y: 0 }, ringSpeedMultiplier: 1,
  });

  useEffect(() => {
    stateRef.current.isHovered = isHovered;
    stateRef.current.ringSpeedMultiplier = isHovered ? 2.5 : 1;
  }, [isHovered]);

  useEffect(() => { stateRef.current.scrollProgress = scrollProgress; }, [scrollProgress]);
  useEffect(() => { stateRef.current.mouse = mousePosition; }, [mousePosition]);

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          const rect = containerRef.current!.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          setMousePosition({ x, y });
        });
      }
    };
    const handleScroll = () => {
      const hero = document.getElementById("home") || document.body;
      const totalScroll = hero.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = totalScroll > 0 ? Math.max(0, Math.min(1, scrolled / totalScroll)) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    setIsLoaded(true);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-screen z-10 pointer-events-auto" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isLoaded && (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 65 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            powerPreference: "high-performance"
          }}
          style={{ background: "transparent" }}
          dpr={[1, 1.5]}
          shadows={false}
        >
          <Scene stateRef={stateRef} />
          <Preload all />
        </Canvas>
      )}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full transition-all duration-500" style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(167, 139, 250, 0.02) 40%, transparent 70%)", filter: isHovered ? "blur(15px) brightness(1.2)" : "blur(20px) brightness(1)", transform: `translate(-50%, -50%) scale(${1 + scrollProgress * 0.2})`, transition: "all 0.5s ease" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full transition-all duration-500" style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)", filter: isHovered ? "blur(12px)" : "blur(30px)", opacity: isHovered ? 0.8 : 0.3, transform: `translate(-50%, -50%) scale(${1 + scrollProgress * 0.2})` }} />
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[100px]" style={{ background: "linear-gradient(to top, rgba(139, 92, 246, 0.06), transparent)", filter: "blur(25px)" }} />
        <div className="absolute w-[200px] h-[200px] rounded-full pointer-events-none transition-all duration-300" style={{ left: `${50 + mousePosition.x * 20}%`, top: `${50 + mousePosition.y * 15}%`, transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%)", filter: "blur(20px)" }} />
      </div>
    </div>
  );
}

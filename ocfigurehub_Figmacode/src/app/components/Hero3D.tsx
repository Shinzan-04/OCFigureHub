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

const dataChips = Array.from({ length: 40 }).map(() => {
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
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.z = t * (i % 2 === 0 ? 1 : -1) * 0.2 * speedMultiplier;
      });
    }
    if (chipsRef.current) {
      chipsRef.current.children.forEach((chip, i) => {
        const data = dataChips[i];
        const currentAngle = data.angle + t * data.speed * speedMultiplier;
        chip.position.x = Math.cos(currentAngle) * data.radius;
        chip.position.z = Math.sin(currentAngle) * data.radius;
        const totalHeight = 8;
        const currentY = data.y + t * data.riseSpeed * speedMultiplier;
        chip.position.y = ((currentY + 1) % totalHeight) - 1;
        chip.rotation.x = t * 2;
        chip.rotation.y = t * 2;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group position={[0, -0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[2.8, 3.5, 64]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[2.8, 64]} />
          <meshStandardMaterial color="#000000" metalness={1} roughness={0.1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[2.6, 2.65, 64]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.5, 1.52, 64]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={1.5} />
        </mesh>
      </group>
      {/* Trụ holographic đã bị xóa theo yêu cầu */}
      <group ref={ringsRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0.5]}>
          <torusGeometry args={[3.2, 0.02, 16, 64, Math.PI * 1.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={4} />
        </mesh>
        <mesh position={[0, 0, 1.5]}>
          <torusGeometry args={[3.4, 0.01, 16, 64, Math.PI]} />
          <meshStandardMaterial color="#ffffff" emissive="#8B5CF6" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0, 0, -1]}>
          <torusGeometry args={[3.0, 0.03, 16, 64, Math.PI * 0.8]} />
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
  const count = 120;
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

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const { mouse, isHovered } = stateRef.current;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      lifetimes.current[i] -= 0.004;
      if (lifetimes.current[i] <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 3;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = -2.5;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
        velocities.current[i * 3] = (Math.random() - 0.5) * 0.015 * (isHovered ? 1.5 : 1);
        velocities.current[i * 3 + 1] = 0.01 + Math.random() * 0.02;
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.015 * (isHovered ? 1.5 : 1);
        lifetimes.current[i] = maxLifetimes.current[i] * (isHovered ? 0.6 : 1);
      } else {
        const dx = mouse.x * 0.15 * Math.sin(t + i);
        const dy = mouse.y * 0.1 * Math.cos(t + i);
        pos[i * 3] += velocities.current[i * 3] + dx * 0.002;
        pos[i * 3 + 1] += velocities.current[i * 3 + 1] + dy * 0.002;
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
  "/Infernal.glb"
];

// Preload tất cả models để tránh bị giật lag/màn hình trắng khi swap
MODELS.forEach((url) => useGLTF.preload(url));

function Model({ stateRef }: { stateRef: React.MutableRefObject<SceneState> }) {
  const groupRef = useRef<THREE.Group>(null);
  const forcefieldRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const [modelIndex, setModelIndex] = useState(0);
  const gltf0 = useGLTF(MODELS[0]);
  const gltf1 = useGLTF(MODELS[1]);
  const gltf2 = useGLTF(MODELS[2]);
  const gltf3 = useGLTF(MODELS[3]);
  // Xử lý và lưu trữ tất cả các model 1 lần duy nhất để không bị lag khi chuyển đổi
  const processedScenes = useMemo(() => {
    return [gltf0.scene, gltf1.scene, gltf2.scene, gltf3.scene].map((original, index) => {
      // Clone 1 lần duy nhất
      const cloned = original.clone();
      
      const box = new THREE.Box3().setFromObject(cloned);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Tinh chỉnh độ lớn: model Valkyrie to bề ngang nên dùng hệ số nhỏ hơn xíu
      const targetSize = index === 1 ? 8 : 10;
      const scale = targetSize / maxDim;
      cloned.scale.setScalar(scale);
      
      const newBox = new THREE.Box3().setFromObject(cloned);
      const center = newBox.getCenter(new THREE.Vector3());
      cloned.position.sub(center);
      
      // Khởi tạo sẵn meshCache cho từng model để khỏi phải traverse lại lúc swap
      const meshList: THREE.Mesh[] = [];
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          
          // Sửa lỗi Alpha Blend cho các model tải thêm (Robot, Infernal ở vị trí số 2, 3)
          // Bỏ qua Valkyrie (index = 1) và Sentinel (index = 0) vì chúng cần độ trong suốt cho tóc và kính
          if (index >= 2) {
            mat.transparent = false;
            mat.depthWrite = true;
            mat.alphaTest = 0.5;
          }

          // Đã xóa tính năng ám màu tím (emissive) để trả lại 100% độ sắc nét và màu sắc gốc của mô hình
          meshList.push(mesh);
        }
      });
      
      return { scene: cloned, meshes: meshList };
    });
  }, [gltf0.scene, gltf1.scene]);
  
  const currentModelData = processedScenes[modelIndex];
  const scene = currentModelData.scene;
  const meshCache = useRef(currentModelData.meshes);

  // Khi đổi model, cập nhật ref bằng danh sách mesh đã cache sẵn
  useEffect(() => {
    meshCache.current = processedScenes[modelIndex].meshes;
  }, [modelIndex, processedScenes]);

  const targetRotation = useRef({ x: 0, y: 0 });
  const jumpProgress = useRef(0);
  const hasSwapped = useRef(false);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const { mouse, isHovered, isModelHovered } = stateRef.current;

    // Khi hover vào mô hình → đứng yên (không xoay theo chuột)
    if (!isModelHovered) {
      let rotationSpeed = 0;
      if (mouse.x > 0.05) rotationSpeed = 1.5;
      else if (mouse.x < -0.05) rotationSpeed = -1.5;
      targetRotation.current.y += rotationSpeed * delta;
      targetRotation.current.x = mouse.y * (Math.PI / 12);
    }
    // Khi hover: giữ nguyên x = 0 (đứng thẳng) thay vì nghiêng theo chuột
    if (isModelHovered) {
      targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, 0, 0.05);
    }

    if (jumpProgress.current > 0) {
      jumpProgress.current -= delta * 1.2;
      if (jumpProgress.current < 0) jumpProgress.current = 0;
      const progress = 1 - jumpProgress.current;
      const jumpY = Math.sin(progress * Math.PI) * 1.8;
      
      // Cho mô hình xoay một vài vòng mượt mà trên không (nhân với delta để đồng bộ frame)
      targetRotation.current.y += delta * 12; 
      
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, jumpY, 0.2);
      
      // Hiệu ứng teo nhỏ rồi bành trướng (Teleport effect)
      // progress từ 0 -> 1. Khi progress = 0.5 thì scale = 0
      const scaleMult = Math.pow(Math.abs(progress - 0.5) * 2, 0.5); // dùng pow để tạo độ cong mượt
      groupRef.current.scale.setScalar(scaleMult);

      // Đổi model ở chính giữa cú nhảy
      if (jumpProgress.current < 0.5 && !hasSwapped.current) {
        hasSwapped.current = true;
        setModelIndex((prev) => (prev + 1) % MODELS.length);
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
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1); // Đảm bảo scale về 1
      if (forcefieldRef.current) forcefieldRef.current.visible = false;
      if (shockwaveRef.current) shockwaveRef.current.visible = false;
    }

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.05);
    
    // Đã gỡ bỏ hiệu ứng ám màu khi Hover để tránh làm mờ texture gốc của mô hình
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (jumpProgress.current > 0) return;
    jumpProgress.current = 1;
    hasSwapped.current = false; // Reset cờ swap
  };

  return (
    <group 
      ref={groupRef} 
      position={[0, 0, 0]}
    >
      <primitive object={processedScenes[0].scene} scale={2.5} visible={modelIndex === 0} />
      <primitive object={processedScenes[1].scene} scale={2.5} visible={modelIndex === 1} />
      <primitive object={processedScenes[2].scene} scale={2} visible={modelIndex === 2} />
      <primitive object={processedScenes[3].scene} scale={2.5} visible={modelIndex === 3} />
      {/* Proxy mesh vô hình — chặn toàn bộ tia raycast, giúp click/hover mượt mà không bị khựng */}
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
        <ringGeometry args={[0.9, 1, 64]} />
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
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow />
      <spotLight position={[-3, 1, -4]} intensity={5} color="#ffffff" angle={0.7} penumbra={1} />
      <spotLight position={[0, 2, -5]} intensity={2} color="#ffffff" angle={0.6} penumbra={0.5} />
      <pointLight position={[0, 4, 1]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, -3, 0]} intensity={0.5} color="#ffffff" />

      {/* Vị trí gốc của mô hình và bệ đứng */}
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
            toneMappingExposure: 1.0, // Tăng sáng về 100% bản gốc (không bị tối mờ)
            powerPreference: "high-performance" 
          }} 
          style={{ background: "transparent" }} 
          dpr={[1, 2]} // Nâng trần độ phân giải (DPR) lên 2x để hiển thị cực nét trên màn hình to, hết mờ rỗ
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

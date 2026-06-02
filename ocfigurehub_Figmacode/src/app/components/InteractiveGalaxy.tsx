// @ts-nocheck
/// <reference types="@react-three/fiber" />
"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Stars, useTexture, Billboard } from "@react-three/drei";

function InteractiveStar({ position, size }: { position: [number, number, number], size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const starTex = useTexture("/star.jpg");
  
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 3 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <Billboard position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[size * 35, size * 35]} />
        <meshBasicMaterial 
          map={starTex} 
          alphaMap={starTex} 
          color="#ffffff"
          transparent={true} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          opacity={hovered ? 1 : 0.95} 
        />
      </mesh>
    </Billboard>
  );
}

function TexturedPlanet({ position, size, textureUrl, speed = 0.05, floatSpeed = 2, hasRings = false, hasAtmosphere = false, atmosphereColor = "#4da6ff" }: { position: [number, number, number], size: number, textureUrl: string, speed?: number, floatSpeed?: number, hasRings?: boolean, hasAtmosphere?: boolean, atmosphereColor?: string }) {
  const tex = useTexture(textureUrl);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.15 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    const rotateSpeed = hovered ? speed * 6 : speed;
    groupRef.current.rotation.y += rotateSpeed * delta;
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh 
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial map={tex} />
        </mesh>
        {/* Render vòng đai nếu có */}
        {hasRings && (
          <group rotation={[-Math.PI / 2 + 0.3, 0.2, 0]}>
            {/* Vòng đai chính sáng hơn */}
            <mesh>
              <ringGeometry args={[size * 1.3, size * 2.1, 64]} />
              <meshBasicMaterial color="#e6d5b8" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            {/* Vòng đai ngoài cùng mờ và nhỏ hơn */}
            <mesh>
              <ringGeometry args={[size * 2.2, size * 2.6, 64]} />
              <meshBasicMaterial color="#d2b48c" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Vòng đai mỏng phân tách */}
            <mesh>
              <ringGeometry args={[size * 2.12, size * 2.18, 64]} />
              <meshBasicMaterial color="#b39c7d" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        
        {/* Render bầu khí quyển siêu thực (Fresnel Shader) */}
        {hasAtmosphere && (
          <mesh scale={1.03}>
            <sphereGeometry args={[size, 64, 64]} />
            <shaderMaterial
              transparent={true}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
              uniforms={{
                color: { value: new THREE.Color(atmosphereColor) }
              }}
              vertexShader={`
                varying vec3 vNormal;
                void main() {
                  vNormal = normalize(normalMatrix * normal);
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `}
              fragmentShader={`
                uniform vec3 color;
                varying vec3 vNormal;
                void main() {
                  // pow = 3.0 để viền sáng tản êm ái hơn khi đã ép sát vào bề mặt
                  float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
                  // Tăng cường độ lên một chút để thấy rõ viền phát sáng
                  gl_FragColor = vec4(color, 1.0) * intensity * 0.6;
                }
              `}
            />
          </mesh>
        )}
      </Float>
    </group>
  );
}

function FlyingAsteroid({ startPos, size, textureUrl, speed, slope = 0.5 }: { startPos: [number, number, number], size: number, textureUrl: string, speed: number, slope?: number }) {
  const tex = useTexture(textureUrl);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  // Màu sắc bắt đầu (trắng xám nhạt) và màu khi cháy rực (cam/đỏ lửa)
  const startColor = useMemo(() => new THREE.Color("#999999"), []);
  const endColor = useMemo(() => new THREE.Color("#ff5500"), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const totalDistance = startPos[0] + 80;
      const traveled = startPos[0] - groupRef.current.position.x;
      let progress = Math.min(Math.max(traveled / totalDistance, 0), 1);

      // Hiệu ứng tốc độ: bay càng gần càng nhanh (từ 0.5x ở xa đến 2.5x khi lại gần)
      const dynamicSpeed = speed * (0.5 + progress * 5.0);

      groupRef.current.position.x -= dynamicSpeed * delta;
      groupRef.current.position.y -= dynamicSpeed * slope * delta;
      
      // 1. Càng rơi càng to ra (phóng to từ 1x lên 3x theo yêu cầu)
      const currentScale = 1 + progress * 10.0;
      groupRef.current.scale.set(currentScale, currentScale, currentScale);
      
      // 2. Càng rơi càng sáng và chuyển sang màu lửa bốc cháy
      if (materialRef.current) {
        materialRef.current.color.lerpColors(startColor, endColor, Math.pow(progress, 1.5));
      }
      
      // Đã XÓA logic tự lặp lại quỹ đạo ở đây, vì AsteroidEvent sẽ quản lý vòng đời bay 1 lần
    }
  });
  
  const flightAngle = Math.atan2(-slope, -1);

  return (
    <group ref={groupRef} position={startPos}>
      <Billboard>
        <mesh rotation-z={flightAngle + Math.PI - 0.6}>
          <planeGeometry args={[size * 1.5, size * 1.5]} />
          <meshBasicMaterial 
            ref={materialRef}
            map={tex} 
            alphaMap={tex}
            color={startColor}
            transparent={true} 
            blending={THREE.AdditiveBlending}
            depthWrite={false} 
          />
        </mesh>
      </Billboard>
    </group>
  );
}

function Meteor({ startPos, size, textureUrl, speed, slope, isActive }: { startPos: [number, number, number], size: number, textureUrl: string, speed: number, slope: number, isActive: boolean }) {
  const tex = useTexture(textureUrl);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const isFlying = useRef(true); // Trạng thái có đang bay hay không
  
  // Màu sắc động — sẽ được cập nhật theo progress trong useFrame
  const dynamicColor = useMemo(() => new THREE.Color(1, 1, 1), []);
  
  // Từa điểm xuất phát đến giữa màn hình là toàn bộ hành trình của sao băng
  const travelRange = startPos[0] + 400; // Từ startPos.x đến -400
  const currentSpeedRef = useRef(speed);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const x = groupRef.current.position.x;
      
      // Tính progress: 0 khi mới xuất phát, 1 khi bay hết màn hình
      const progress = Math.min(1, Math.max(0, (startPos[0] - x) / travelRange));
      
      // Tốc độ tăng dần: bắt đầu rất chậm (0.2x), càng vào gần càng nhanh (1x)
      const dynamicSpeed = speed * (0.2 + progress * 0.8);
      currentSpeedRef.current = dynamicSpeed;
      
      // Kích thước tăng dần: bắt đầu rất nhỏ (0.1x), càng vào gần càng to (1.5x)
      const dynamicScale = 0.1 + progress * 1.6;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);
      
      // Độ sáng tăng mạnh theo progress: xa thì mờ (1x), gần thì chói lóa cực mạnh (15x)
      // Dùng lũy thừa để sự bùng sáng xảy ra rõ rệt hơn ở nửa sau hành trình
      const brightness = 1 + Math.pow(progress, 2) * 14;
      if (materialRef.current) {
        dynamicColor.setRGB(brightness, brightness, brightness);
        materialRef.current.color.copy(dynamicColor);
      }
      
      // Chỉ di chuyển nếu đang có cờ bay
      if (isFlying.current) {
        groupRef.current.position.x -= dynamicSpeed * delta;
        groupRef.current.position.y -= dynamicSpeed * slope * delta;
      }
      
      // Hiệu ứng mờ dần (Fade in / Fade out) — chỉ điều khiển opacity, màu được quản lý riêng bên trên
      if (materialRef.current) {
        let opacity = 1;
        if (x > 250) {
          opacity = Math.max(0, 1 - (x - 250) / 150);
        } else if (x < -200) {
          opacity = Math.max(0, 1 - (-200 - x) / 150);
        }
        materialRef.current.opacity = opacity;
      }
      
      // Khi sao băng bay khuất hẳn khỏi rìa trái (-400)
      if (groupRef.current.position.x < -400 || groupRef.current.position.y < -200) {
        if (isActive) {
          groupRef.current.position.x = 300 + Math.random() * 300;
          groupRef.current.position.y = 20 + Math.random() * 100;
        } else {
          groupRef.current.position.x = 300 + Math.random() * 300;
          groupRef.current.position.y = 20 + Math.random() * 100;
          isFlying.current = false;
        }
      }

      // Đánh thức các sao băng đang chờ khi đợt mưa mới bắt đầu
      if (isActive && !isFlying.current) {
        isFlying.current = true;
      }
    }
  });
  
  const flightAngle = Math.atan2(-slope, -1);

  return (
    <group ref={groupRef} position={startPos}>
      <Billboard>
        {/* Tạm xoay góc chuẩn, bẻ đầu sao băng ngóc lên để khớp với quỹ đạo bay ngang */}
        <mesh rotation-z={flightAngle + Math.PI - Math.PI / 4}>
          <planeGeometry args={[size * 4, size * 4]} />
          <meshBasicMaterial 
            ref={materialRef}
            map={tex} 
            alphaMap={tex}
            color={dynamicColor}
            transparent={true} 
            blending={THREE.AdditiveBlending}
            depthWrite={false} 
          />
        </mesh>
      </Billboard>
    </group>
  );
}

// Khởi tạo trước dữ liệu cho 120 sao băng để phủ kín không gian khổng lồ
const meteorData = Array.from({ length: 120 }).map((_, i) => ({
  id: i,
  startPos: [
    250 + Math.random() * 500, // Bắt đầu ở rìa phải (ngoài màn hình) để bay dần vào
    80 + Math.random() * 120,   // Y cao hơn: từ 80 đến 200 (đẩy lên vùng trời cao)
    -50 - Math.random() * 150   // Z đẩy ra xa hơn để tạo chiều sâu khổng lồ
  ] as [number, number, number],
  size: 10 + Math.random() * 8, // To hơn: từ 10x đến 18x
  textureUrl: Math.random() > 0.5 ? "/bolide.jpg" : "/bolide1.jpg",
  speed: 60 + Math.random() * 40, // Tốc độ xé gió cực nhanh (60 đến 100)
  slope: 0.15 + Math.random() * 0.15 // Góc ngang
}));

function MeteorWave() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Cứ mỗi 45s gọi đợt mưa mới (15s mưa + 30s nghỉ hoàn toàn)
    const interval = setInterval(() => {
      setIsActive(true);
      // Tắt cờ tạo sao băng mới sau 15s, những viên đang bay sẽ tiếp tục bay cho đến khi khuất
      setTimeout(() => setIsActive(false), 15000);
    }, 45000);

    // Lần đầu cũng tự tắt sau 15s
    const timeout = setTimeout(() => setIsActive(false), 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {meteorData.map(m => (
        <Meteor key={m.id} {...m} isActive={isActive} />
      ))}
    </>
  );
}

// 4 Đường bay (tọa độ và độ dốc khác nhau) dành cho Thiên thạch khổng lồ
const asteroidPaths = [
  { startPos: [120, 60, -80] as [number, number, number], slope: 0.5, size: 4.5, speed: 6.0 },
  { startPos: [180, 90, -100] as [number, number, number], slope: 0.6, size: 5.5, speed: 7.5 },
  { startPos: [90, 110, -60] as [number, number, number], slope: 0.8, size: 3.5, speed: 5.0 },
  { startPos: [200, 40, -120] as [number, number, number], slope: 0.4, size: 6.0, speed: 9.0 },
];

function AsteroidEvent() {
  const [eventData, setEventData] = useState({ pathIndex: 0, waveId: 0 });

  useEffect(() => {
    // Kích hoạt ngay lần đầu tiên
    setEventData({
      pathIndex: Math.floor(Math.random() * asteroidPaths.length),
      waveId: 1
    });
    
    // Đều đặn mỗi 40 giây sẽ gọi ra 1 thiên thạch bay ngang
    const interval = setInterval(() => {
      setEventData(prev => ({
        pathIndex: Math.floor(Math.random() * asteroidPaths.length),
        waveId: prev.waveId + 1
      }));
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  if (eventData.waveId === 0) return null;

  const path = asteroidPaths[eventData.pathIndex];
  // Sử dụng waveId làm key để ép React tạo ra một thực thể FlyingAsteroid hoàn toàn mới cho mỗi đợt bay
  return <FlyingAsteroid key={eventData.waveId} {...path} textureUrl="/thien_thach.png" />;
}

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Đặt camera ở vị trí cố định, chỉ xoay nhìn theo chuột
    camera.position.set(0, 0, 5);

    const handleMouseMove = (e: MouseEvent) => {
      // Chuyển vị trí chuột sang range -1 đến 1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Điểm nhìn đích: chuột sang phải → nhìn sang phải, chuột lên → nhìn lên
    // Nhân hệ số lớn để góc xoay rõ rệt hơn
    targetLook.current.set(
      mouse.current.x * 12,   // trái/phải: biên độ ngang
      mouse.current.y * 8,    // lên/xuống: biên độ dọc
      -10                     // luôn nhìn về phía trước (âm Z)
    );

    // Lerp mượt từ hướng nhìn hiện tại sang hướng nhìn đích
    currentLook.current.lerp(targetLook.current, 0.05);
    camera.lookAt(currentLook.current);
  });
  
  return null;
}

export default function InteractiveGalaxy() {
  const stars = useMemo(() => {
    // Tạo ngẫu nhiên 12 ngôi sao rải rác ở một không gian cực rộng
    // Đảm bảo khi camera lia (pan) kịch kim sang 2 mép màn hình vẫn không bị thiếu sao
    return Array.from({ length: 12 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 250, // X rất rộng: từ -125 đến 125
        (Math.random() - 0.5) * 150, // Y rộng: từ -75 đến 75
        -60 - Math.random() * 50     // Z lùi sâu: từ -60 đến -110
      ] as [number, number, number],
      size: 0.1 + Math.random() * 0.15 // Kích thước nhỏ bé xa xăm
    }));
  }, []);

  const asteroids = useMemo(() => {
    // 2 thiên thạch bay lơ lửng cách rất xa nhau
    return [
      { position: [-16, 8, -26], size: 3.5 },
      { position: [18, -10, -40], size: 4 }
    ] as any;
  }, []);

  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setEventSource(document.body);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
      <div className="w-full h-full">
        {/* eventSource={eventSource} giúp Canvas nhận sự kiện chuột toàn cục dù div ngoài bị pointer-events-none */}
        <Canvas 
          eventSource={eventSource || undefined} 
          eventPrefix="client"
          camera={{ position: [0, 0, 5], fov: 75 }} 
          style={{ background: "transparent" }} 
          dpr={[1, 1.5]}
        >
          <React.Suspense fallback={null}>
            <CameraRig />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Bầu trời sao nền lùi xa hơn nhưng các chấm sao được phóng to độ sáng chói (factor tăng) */}
            <Stars radius={150} depth={150} count={3000} factor={3.5} saturation={1} fade speed={0.5} />
            
            {stars.map((star, i) => (
              <InteractiveStar key={`star-${i}`} position={star.position} size={star.size} />
            ))}

            {/* Sao Thủy tít trên cùng bên trái */}
            <TexturedPlanet position={[-28, 14, -30]} size={1.2} textureUrl="/Mercury.jpg" speed={0.1} />
            
            {/* Trái đất lệch sang phải - nằm trong vùng Hero3D (pointer-events-none) để hover được */}
            <TexturedPlanet position={[2, 2, -22]} size={5} textureUrl="/Earth.jpg" speed={0.07} hasAtmosphere={true} atmosphereColor="#d9f2ff" />
            
            {/* Sao Hỏa lệch hẳn sang phải và lùi về sau */}
            <TexturedPlanet position={[14, -6, -35]} size={2} textureUrl="/mars.jpg" speed={0.08} />
            
            {/* Sao Thổ tít dưới cùng bên phải, rất xa kèm theo Vòng đai */}
            <TexturedPlanet position={[32, -15, -45]} size={3} textureUrl="/saturn.jpg" speed={0.03} hasRings={true} />
            
            {/* Gọi thiên thạch khổng lồ bay ngang mỗi 40s với đường bay random */}
            <AsteroidEvent />
            
            {/* Gọi đợt mưa sao băng theo chu kỳ 30s */}
            <MeteorWave />
          </React.Suspense>
        </Canvas>
      </div>
    </div>
  );
}

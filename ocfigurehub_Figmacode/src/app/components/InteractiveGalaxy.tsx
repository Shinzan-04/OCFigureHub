// @ts-nocheck
/// <reference types="@react-three/fiber" />
"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Stars, useTexture, Billboard } from "@react-three/drei";


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
  const startColor = useMemo(() => new THREE.Color("#aaaaaa"), []);
  const endColor = useMemo(() => new THREE.Color("#ff5500"), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const totalDistance = startPos[0] + 80;
      const traveled = startPos[0] - groupRef.current.position.x;
      let progress = Math.min(Math.max(traveled / totalDistance, 0), 1);

      // Hiệu ứng tốc độ: bay càng gần càng nhanh
      const dynamicSpeed = speed * (0.5 + progress * 4.0);
      groupRef.current.position.x -= dynamicSpeed * delta;
      groupRef.current.position.y -= dynamicSpeed * slope * delta;
      
      // Phóng to mượt mà theo số mũ, tối đa 6x (Không phóng to quá đà thành 16x - 20x như lúc đầu)
      const currentScale = 1 + Math.pow(progress, 2) * 5.0;
      
      // Giữ nguyên tỷ lệ 1:1 cho X, Y, Z. Không kéo dãn ảnh để tránh móp méo cục đá con.
      groupRef.current.scale.set(currentScale, currentScale, currentScale);
      
      // Càng rơi càng sáng và chuyển màu lửa bốc cháy
      if (materialRef.current) {
        materialRef.current.color.lerpColors(startColor, endColor, Math.pow(progress, 1.5));
        materialRef.current.opacity = 1.0; // Đảm bảo luôn sáng rực, không biến mất giữa chừng
      }
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

function InteractiveStar({ position, size, isFlashing }: { position: [number, number, number], size: number, isFlashing: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const starTex = useTexture("/star.jpg");
  
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isFlashing ? 3 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <Billboard position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[size * 35, size * 35]} />
        <meshBasicMaterial 
          map={starTex} 
          alphaMap={starTex} 
          color="#ffffff"
          transparent={true} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          opacity={isFlashing ? 1 : 0.95} 
        />
      </mesh>
    </Billboard>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  const currentLook = useRef(new THREE.Vector3(0, 0, -10));
  const targetLook = useRef(new THREE.Vector3(0, 0, -10));

  useFrame(() => {
    // Điểm nhìn đích: chuột sang phải → nhìn sang phải, chuột lên → nhìn lên
    // Nhân hệ số lớn để góc xoay rõ rệt hơn
    targetLook.current.set(
      mouse.x * 12,   // trái/phải: biên độ ngang
      mouse.y * 8,    // lên/xuống: biên độ dọc
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
    // Thuật toán rải sao 3D Jittered Grid: Chia không gian thành các khối lập phương 3D
    // Không gian siêu rộng đa chiều để tận dụng tối đa môi trường 3D
    const starList = [];
    const cols = 5;   // X chia 5 cột
    const rows = 4;   // Y chia 4 hàng
    const layers = 3; // Z chia 3 lớp chiều sâu (Tổng = 5x4x3 = 60 ngôi sao)
    
    const spaceWidth = 700;  // X từ -350 đến 350
    const spaceHeight = 300; // Y từ -150 đến 150
    const spaceDepth = 150;  // Z từ -40 đến -190
    
    const colWidth = spaceWidth / cols;
    const rowHeight = spaceHeight / rows;
    const layerDepth = spaceDepth / layers;
    
    for (let l = 0; l < layers; l++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Tâm của khối 3D
          const centerX = -spaceWidth/2 + c * colWidth + colWidth/2;
          const centerY = -spaceHeight/2 + r * rowHeight + rowHeight/2;
          const centerZ = -40 - (l * layerDepth + layerDepth/2); // Z lùi dần về sau
          
          // Độ nhiễu 3D (Lệch tâm ngẫu nhiên 80% thể tích khối để không bao giờ bị xếp thẳng hàng)
          const jitterX = (Math.random() - 0.5) * (colWidth * 0.8);
          const jitterY = (Math.random() - 0.5) * (rowHeight * 0.8);
          const jitterZ = (Math.random() - 0.5) * (layerDepth * 0.8);
          
          // Sao ở càng xa (Z càng âm) thì cho kích thước nhỉnh hơn một chút để vẫn nhìn thấy rõ
          const depthScale = 1 + (l * 0.5); 

          starList.push({
            position: [
              centerX + jitterX,
              centerY + jitterY,
              centerZ + jitterZ
            ] as [number, number, number],
            size: (0.1 + Math.random() * 0.15) * depthScale
          });
        }
      }
    }
    return starList;
  }, []);

  const asteroids = useMemo(() => {
    // 2 thiên thạch bay lơ lửng cách rất xa nhau
    return [
      { position: [-16, 8, -26], size: 3.5 },
      { position: [18, -10, -40], size: 4 }
    ] as any;
  }, []);

  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const [starsFlashing, setStarsFlashing] = useState(false);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Lấy thẻ gốc 100vh để xuyên qua các mảng Text và Hero3D đang chặn chuột ở 2 bên màn hình
    const heroContainer = document.getElementById('hero-event-source');
    if (heroContainer) setEventSource(heroContainer);
    
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    }
  }, []);

  const handleBackgroundClick = () => {
    setStarsFlashing(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setStarsFlashing(false);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 w-full h-screen z-0 overflow-hidden">
      <div className="w-full h-full">
        {/* Nhận tọa độ chuột từ thẻ gốc để không bị các thẻ z-index cao chặn mất */}
        <Canvas 
          eventSource={eventSource || undefined}
          eventPrefix="client"
          camera={{ position: [0, 0, 5], fov: 75 }} 
          style={{ background: "transparent" }} 
          dpr={[1, 1.5]}
          onPointerMissed={handleBackgroundClick}
        >
          <React.Suspense fallback={null}>
            <CameraRig />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Bầu trời sao nền lùi xa hơn nhưng các chấm sao được phóng to độ sáng chói (factor tăng) */}
            <Stars radius={150} depth={150} count={3000} factor={3.5} saturation={1} fade speed={0.5} />
            
            {stars.map((star, i) => (
              <InteractiveStar key={`star-${i}`} position={star.position} size={star.size} isFlashing={starsFlashing} />
            ))}

            {/* Sao Thủy tít trên cùng bên trái */}
            <TexturedPlanet position={[-250, -10, 0]} size={15} textureUrl="/Mercury.jpg" speed={0.1} />
            
            {/* Trái đất lệch sang phải - nằm trong vùng Hero3D (pointer-events-none) để hover được */}
            <TexturedPlanet position={[-35, 10, -22]} size={7} textureUrl="/Earth.jpg" speed={0.07} hasAtmosphere={true} atmosphereColor="#d9f2ff" />
            
            {/* Sao Hỏa lệch hẳn sang phải và lùi về sau */}
            <TexturedPlanet position={[0, -20, -35]} size={4} textureUrl="/mars.jpg" speed={0.08} />
            
            {/* Sao Thổ tít dưới cùng bên phải, rất xa kèm theo Vòng đai */}
            <TexturedPlanet position={[90, -15, -45]} size={7} textureUrl="/saturn.jpg" speed={0.03} hasRings={true} />
            
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

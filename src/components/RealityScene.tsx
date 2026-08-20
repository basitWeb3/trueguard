import { Float, OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { AssetModel, RealityLayer } from "../types";

type RealitySceneProps = {
  activeLayer: RealityLayer;
  scene: AssetModel["scene"];
  accent: string;
};

const stateColors: Record<RealityLayer, string> = {
  live: "#61f5a1",
  building: "#f3c969",
  vision: "#a88cff",
  risk: "#ff6b73",
};

function GroundRing({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.009, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.38} />
    </mesh>
  );
}

function Satellite({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.25}>
      <group position={position}>
        <mesh><boxGeometry args={[0.15, 0.09, 0.09]} /><meshStandardMaterial color="#e7edf8" metalness={0.8} /></mesh>
        <mesh position={[0.18, 0, 0]}><boxGeometry args={[0.2, 0.015, 0.12]} /><meshStandardMaterial color="#537ed8" /></mesh>
        <mesh position={[-0.18, 0, 0]}><boxGeometry args={[0.2, 0.015, 0.12]} /><meshStandardMaterial color="#537ed8" /></mesh>
      </group>
    </Float>
  );
}

function SpaceScene({ stateColor, layer }: { stateColor: string; layer: RealityLayer }) {
  return (
    <>
      <Stars radius={45} depth={35} count={1500} factor={2.2} fade speed={0.35} />
      <mesh><sphereGeometry args={[1.05, 48, 48]} /><meshStandardMaterial color="#173f73" roughness={0.75} /></mesh>
      <mesh scale={1.012}><sphereGeometry args={[1.05, 32, 32]} /><meshBasicMaterial color={stateColor} wireframe transparent opacity={0.13} /></mesh>
      <GroundRing radius={1.58} color={stateColor} /><GroundRing radius={2.12} color="#6f87a9" />
      <Satellite position={[1.5, 0.25, 0.2]} /><Satellite position={[-1.25, -0.62, 0.8]} /><Satellite position={[0.35, 1.65, -0.45]} />
      <group position={[2.55, -0.25, -0.7]} rotation={[0.05, 0, -0.38]}>
        <mesh><cylinderGeometry args={[0.12, 0.18, 1.15, 16]} /><meshStandardMaterial color="#e9edf5" metalness={0.55} /></mesh>
        <mesh position={[0, 0.68, 0]}><coneGeometry args={[0.12, 0.35, 16]} /><meshStandardMaterial color="#f8fbff" /></mesh>
        <mesh position={[0, -0.68, 0]}><coneGeometry args={[0.14, 0.3, 16]} /><meshBasicMaterial color={stateColor} /></mesh>
      </group>
      {layer === "vision" && <mesh position={[-3.75, 0.1, -1.8]}><sphereGeometry args={[0.58, 40, 40]} /><meshStandardMaterial color="#a84f38" roughness={0.9} /></mesh>}
    </>
  );
}

function Wheel({ x }: { x: number }) {
  return <mesh position={[x, -0.56, 0.56]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.36, 0.36, 0.22, 28]} /><meshStandardMaterial color="#111318" roughness={0.35} /></mesh>;
}

function MobilityScene({ stateColor, layer }: { stateColor: string; layer: RealityLayer }) {
  return (
    <>
      <gridHelper args={[14, 28, stateColor, "#1b2430"]} position={[0, -0.95, 0]} />
      <Float speed={1.2} floatIntensity={0.1} rotationIntensity={0.05}>
        <group rotation={[0, -0.48, 0]}>
          <mesh position={[0, -0.22, 0]}><boxGeometry args={[2.65, 0.55, 1.25]} /><meshStandardMaterial color="#cfd8e8" metalness={0.65} roughness={0.2} /></mesh>
          <mesh position={[0.15, 0.2, 0]}><boxGeometry args={[1.35, 0.48, 1.08]} /><meshStandardMaterial color="#253447" metalness={0.8} roughness={0.15} /></mesh>
          <Wheel x={-0.83} /><Wheel x={0.83} />
        </group>
      </Float>
      <group position={[-2.3, 0.35, -1.2]}>
        {[0, 0.54, 1.08].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.75, 0.43, 0.28]} /><meshStandardMaterial color={stateColor} metalness={0.3} /></mesh>)}
      </group>
      {layer === "vision" && <GroundRing radius={3.35} color={stateColor} />}
    </>
  );
}

function GoldScene({ stateColor, layer }: { stateColor: string; layer: RealityLayer }) {
  const bars = [[-0.72, -0.5, 0], [0, -0.5, 0], [0.72, -0.5, 0], [-0.36, 0, 0], [0.36, 0, 0]] as Array<[number, number, number]>;
  return (
    <>
      <Stars radius={35} depth={25} count={700} factor={1.6} fade />
      <Float speed={1.1} floatIntensity={0.18} rotationIntensity={0.08}>
        <group rotation={[-0.12, 0.42, 0]}>
          {bars.map((position, index) => <mesh key={index} position={position}><boxGeometry args={[0.62, 0.32, 1.18]} /><meshStandardMaterial color={index === 4 ? stateColor : "#d9a82d"} metalness={0.85} roughness={0.18} /></mesh>)}
        </group>
      </Float>
      <mesh position={[0, 0.05, -0.85]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.2, 0.02, 8, 96]} /><meshBasicMaterial color={stateColor} transparent opacity={0.5} /></mesh>
      {layer === "risk" && <mesh position={[2.35, 0.7, -0.8]}><octahedronGeometry args={[0.45]} /><meshBasicMaterial color="#ff6b73" wireframe /></mesh>}
    </>
  );
}

function SceneContent({ activeLayer, scene, accent }: RealitySceneProps) {
  const stateColor = activeLayer === "live" ? accent : stateColors[activeLayer];
  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[5, 3, 5]} intensity={30} color="#b8d3ff" />
      <pointLight position={[-4, -2, 2]} intensity={14} color={stateColor} />
      {scene === "space" && <SpaceScene stateColor={stateColor} layer={activeLayer} />}
      {scene === "mobility" && <MobilityScene stateColor={stateColor} layer={activeLayer} />}
      {scene === "gold" && <GoldScene stateColor={stateColor} layer={activeLayer} />}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={9} autoRotate autoRotateSpeed={0.28} />
    </>
  );
}

export default function RealityScene(props: RealitySceneProps) {
  return (
    <Canvas camera={{ position: [0, 0.4, 6], fov: 42 }} dpr={[1, 1.45]}>
      <SceneContent {...props} />
    </Canvas>
  );
}

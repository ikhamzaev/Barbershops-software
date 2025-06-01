import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

function TrimmerModel() {
    const obj = useLoader(OBJLoader, '/Hair-trimmer.obj');
    const ref = useRef<THREE.Group>(null);
    const isMobile = useIsMobile();
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            // Y axis: ping-pong (blade centered)
            ref.current.rotation.y = Math.PI + Math.sin(t * 0.7) * Math.PI;
            // X axis: slow continuous orbit
            ref.current.rotation.x = -Math.PI / 2 + Math.sin(t * 0.5) * 0.4;
            // Z axis: gentle flip/wobble
            ref.current.rotation.z = Math.sin(t * 0.7) * 0.5;
        }
    });
    // Responsive scale
    const scale = isMobile ? 0.45 : 0.75;
    return <primitive object={obj} ref={ref} scale={scale} />;
}

function Shadow() {
    // Simple shadow using a transparent plane
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
            <planeGeometry args={[2, 2]} />
            <shadowMaterial opacity={0.3} />
        </mesh>
    );
}

export default function TrimmerViewer() {
    return (
        <Canvas
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            camera={{ position: [0, 0, 5] }}
            shadows
            gl={{ alpha: true }}
        >
            {/* Lighting setup for realism and depth */}
            <ambientLight intensity={0.3} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={0.7}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <directionalLight
                position={[-10, -10, -5]}
                intensity={0.3}
                color="#ffd700"
            />
            {/* Rim light for edge highlight */}
            <directionalLight
                position={[0, 10, -10]}
                intensity={0.4}
                color="#aeefff"
            />
            <TrimmerModel />
            <Shadow />
        </Canvas>
    );
} 
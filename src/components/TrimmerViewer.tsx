import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
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

function ChairModel({ onLoaded }: { onLoaded?: () => void }) {
    const [object, setObject] = useState<THREE.Group | null>(null);
    const ref = useRef<THREE.Group>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const mtlLoader = new MTLLoader();
        mtlLoader.setResourcePath('/3d-chair/maps/');
        mtlLoader.load('/3d-chair/barber_chair_3ds.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('/3d-chair/barber_chair_3ds.obj', (obj) => {
                setObject(obj);
                if (onLoaded) onLoaded();
            });
        });
    }, [onLoaded]);

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += 0.01; // Smooth 360-degree rotation
        }
    });
    // Center and lower the chair
    if (!object) return null;
    return <primitive object={object} ref={ref} scale={0.04} position={[0, -1.5, 0]} />;
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

export default function TrimmerViewer({ onLoaded }: { onLoaded?: () => void }) {
    return (
        <Canvas
            style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'transparent' }}
            camera={{}}
            shadows
            gl={{ alpha: true, preserveDrawingBuffer: true }}
        >
            {/* Transparent background for video */}
            <CameraController />
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
            <directionalLight
                position={[0, 10, -10]}
                intensity={0.4}
                color="#aeefff"
            />
            <ChairModel onLoaded={onLoaded} />
            <Shadow />
        </Canvas>
    );
}

function CameraController() {
    const { camera } = useThree();
    useFrame(() => {
        camera.position.set(0, 2.5, 5); // Higher, in front
        camera.lookAt(0, 0.5, 0);      // Look down at the chair
    });
    return null;
} 
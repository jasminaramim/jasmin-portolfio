import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configurable parameters
    const config = {
      speedMultiplier: 0.4,  // Reduced speed multiplier for subtle movement
      plexusMaxDistance: 3.5, // Increased for wider connections
      particleCount: 1000,   // More stars for deep space look
      showGrid: true,
      mouseGravity: true,
      theme: {
        primary: 0x8b5cf6, // Purple
        secondary: 0x3b82f6, // Neon Blue
        accent: 0xec4899 // Pink/Rose
      }
    };

    // Setup Variables
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let outerStars: THREE.Points | null = null;
    let earthGroup: THREE.Group;
    let coreMesh: THREE.Mesh | null = null;
    let wireGlobe: THREE.Mesh | null = null;
    let plexusPoints: THREE.Points | null = null;
    let plexusLines: THREE.LineSegments | null = null;
    let animationFrameId: number;

    // Physics & Interaction state
    let targetRotationX = 0.005;
    let targetRotationY = 0.005;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    const startTime = Date.now();

    // Custom Simple Noise for Procedural Continents
    function pseudoNoise(x: number, y: number, z: number) {
      const value = Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.sin(z * 1.5) + 
                    Math.sin(x * 4.3) * Math.sin(y * 3.7) * Math.cos(z * 4.1) * 0.5 +
                    Math.cos(x * 9.1) * Math.sin(z * 8.7) * 0.25;
      return value;
    }

    // Initialize WebGL Application
    const init = () => {
      const container = containerRef.current!;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Scene creation
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050716, 0.05);

      // Camera Setup
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 8.5;

      // Renderer Setup
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      // Lighting Setup
      const ambientLight = new THREE.AmbientLight(0x101432, 2.0);
      scene.add(ambientLight);

      const purpleLight = new THREE.PointLight(config.theme.primary, 4, 30);
      purpleLight.position.set(-8, 6, 5);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(config.theme.secondary, 4.5, 30);
      cyanLight.position.set(8, -6, 5);
      scene.add(cyanLight);

      // Main Interactive Group
      earthGroup = new THREE.Group();
      scene.add(earthGroup);

      // Generate elements
      createBackgroundStars();
      createTechEarth();
      createPlexusNetwork();

      // Start loop
      animate();
    };

    // Generate Celestial Background (Small glowing star dots)
    const createBackgroundStars = () => {
      const count = config.particleCount;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const color1 = new THREE.Color(config.theme.primary);
      const color2 = new THREE.Color(config.theme.secondary);
      const color3 = new THREE.Color(config.theme.accent);

      for (let i = 0; i < count; i++) {
        // Wide distribution across the whole scene space
        const x = (Math.random() - 0.5) * 45;
        const y = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 25 - 10;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const rand = Math.random();
        const chosenColor = rand < 0.4 ? color1 : rand < 0.8 ? color2 : color3;

        colors[i * 3] = chosenColor.r;
        colors[i * 3 + 1] = chosenColor.g;
        colors[i * 3 + 2] = chosenColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Procedural point texture
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
      const starTexture = new THREE.CanvasTexture(canvas);

      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        map: starTexture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      outerStars = new THREE.Points(geometry, material);
      scene.add(outerStars);
    };

    // Generate High-Tech Earth
    const createTechEarth = () => {
      const coreGeom = new THREE.SphereGeometry(2.1, 32, 32);
      const coreMat = new THREE.MeshPhongMaterial({
        color: 0x05071b,
        transparent: true,
        opacity: 0.5,
        shininess: 80,
        specular: new THREE.Color(config.theme.primary)
      });
      coreMesh = new THREE.Mesh(coreGeom, coreMat);
      earthGroup.add(coreMesh);

      if (config.showGrid) {
        const gridGeom = new THREE.SphereGeometry(2.12, 24, 24);
        const gridMat = new THREE.MeshBasicMaterial({
          color: config.theme.secondary,
          wireframe: true,
          transparent: true,
          opacity: 0.05
        });
        wireGlobe = new THREE.Mesh(gridGeom, gridMat);
        earthGroup.add(wireGlobe);
      }

      const dataPointCount = 2800;
      const dataGeometry = new THREE.BufferGeometry();
      const dataPositions: number[] = [];
      const dataColors: number[] = [];

      const tempColor = new THREE.Color();

      for (let i = 0; i < dataPointCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / dataPointCount);
        const theta = Math.sqrt(dataPointCount * Math.PI) * phi;

        const r = 2.14;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        const noiseVal = pseudoNoise(x, y, z);
        
        if (noiseVal > -0.15) {
          dataPositions.push(x, y, z);
          const mixFactor = (noiseVal + 1) / 2;
          tempColor.setHSL(0.55 + mixFactor * 0.15, 0.9, 0.6);
          dataColors.push(tempColor.r, tempColor.g, tempColor.b);
        }
      }

      dataGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dataPositions, 3));
      dataGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dataColors, 3));

      const dataPointMat = new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      const techHoloEarth = new THREE.Points(dataGeometry, dataPointMat);
      earthGroup.add(techHoloEarth);
    };

    // Generate the Plexus network surrounding the Earth
    interface PlexusNode {
      pos: THREE.Vector3;
      basePos: THREE.Vector3;
      vel: THREE.Vector3;
      phase: number;
      speed: number;
    }

    const plexusNodeArray: PlexusNode[] = [];

    const createPlexusNetwork = () => {
      const count = 160;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Distribute nodes randomly throughout the ENTIRE 3D layout bounds
        const x = (Math.random() - 0.5) * 18;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 12 - 1;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        plexusNodeArray.push({
          pos: new THREE.Vector3(x, y, z),
          basePos: new THREE.Vector3(x, y, z),
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.012, // Slightly faster drift velocities
            (Math.random() - 0.5) * 0.012,
            (Math.random() - 0.5) * 0.012
          ),
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.5
        });
      }

      const plexusGeom = new THREE.BufferGeometry();
      plexusGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Custom Node Texture
      const nodeCanvas = document.createElement('canvas');
      nodeCanvas.width = 32;
      nodeCanvas.height = 32;
      const nodeCtx = nodeCanvas.getContext('2d')!;
      const g = nodeCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.2, 'rgba(139, 92, 246, 0.8)');
      g.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      nodeCtx.fillStyle = g;
      nodeCtx.fillRect(0, 0, 32, 32);
      const nodeTexture = new THREE.CanvasTexture(nodeCanvas);

      const plexusMat = new THREE.PointsMaterial({
        size: 0.2,
        map: nodeTexture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      plexusPoints = new THREE.Points(plexusGeom, plexusMat);
      earthGroup.add(plexusPoints);

      // Lines connect setup
      const maxConnections = count * 6; // Max connections
      const linePositions = new Float32Array(maxConnections * 3 * 2);
      const lineColors = new Float32Array(maxConnections * 3 * 2);

      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      plexusLines = new THREE.LineSegments(lineGeom, lineMat);
      earthGroup.add(plexusLines);
    };

    // Live plexus system updates
    const updatePlexus = () => {
      try {
        if (!plexusPoints || !plexusLines || !camera || !scene || !earthGroup) return;

        const positions = plexusPoints.geometry.attributes.position.array as Float32Array;
        const linePositions = plexusLines.geometry.attributes.position.array as Float32Array;
        const colorsArray = plexusLines.geometry.attributes.color.array as Float32Array;

        if (!positions || !linePositions || !colorsArray) return;

        const nodeCount = plexusNodeArray.length;
        let lineIndex = 0;
        const maxLineIndex = linePositions.length / 3;

        const colorNear = new THREE.Color(config.theme.primary);
        const colorFar = new THREE.Color(config.theme.secondary);
        const colorMix = new THREE.Color();

        // Track mouse in 3D relative to earth group
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2(mouseX, mouseY);
        raycaster.setFromCamera(mouseVector, camera);
        
        const targetZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const mouse3D = new THREE.Vector3();
        raycaster.ray.intersectPlane(targetZ, mouse3D);
        
        const localMouse3D = earthGroup.worldToLocal(mouse3D.clone());

        // 1. Update Positions (Floating in whole viewport space)
        for (let i = 0; i < nodeCount; i++) {
          const node = plexusNodeArray[i];

          node.pos.x += node.vel.x * config.speedMultiplier;
          node.pos.y += node.vel.y * config.speedMultiplier;
          node.pos.z += node.vel.z * config.speedMultiplier;

          // Screen Boundary box wrap-around / bouncing (Direction-safe to prevent stuck vibration states)
          if (node.pos.x > 9) node.vel.x = -Math.abs(node.vel.x);
          if (node.pos.x < -9) node.vel.x = Math.abs(node.vel.x);
          if (node.pos.y > 6) node.vel.y = -Math.abs(node.vel.y);
          if (node.pos.y < -6) node.vel.y = Math.abs(node.vel.y);
          if (node.pos.z > 6) node.vel.z = -Math.abs(node.vel.z);
          if (node.pos.z < -6) node.vel.z = Math.abs(node.vel.z);

          // Mouse influence
          if (config.mouseGravity) {
            const distToMouse = node.pos.distanceTo(localMouse3D);
            if (distToMouse < 3.0) {
              const pullDir = localMouse3D.clone().sub(node.pos).normalize();
              const pullForce = (3.0 - distToMouse) * 0.005;
              node.pos.addScaledVector(pullDir, pullForce);
            }
          }

          positions[i * 3] = node.pos.x;
          positions[i * 3 + 1] = node.pos.y;
          positions[i * 3 + 2] = node.pos.z;
        }
        plexusPoints.geometry.attributes.position.needsUpdate = true;

        // 2. Build Lines Network dynamically in whole background
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            const nodeA = plexusNodeArray[i];
            const nodeB = plexusNodeArray[j];

            const dist = nodeA.pos.distanceTo(nodeB.pos);

            // Safe bound check to prevent typing array write out of bounds
            if (dist < config.plexusMaxDistance && lineIndex < maxLineIndex - 2) {
              const alpha = 1.0 - (dist / config.plexusMaxDistance);

              linePositions[lineIndex * 3] = nodeA.pos.x;
              linePositions[lineIndex * 3 + 1] = nodeA.pos.y;
              linePositions[lineIndex * 3 + 2] = nodeA.pos.z;

              linePositions[lineIndex * 3 + 3] = nodeB.pos.x;
              linePositions[lineIndex * 3 + 4] = nodeB.pos.y;
              linePositions[lineIndex * 3 + 5] = nodeB.pos.z;

              colorMix.copy(colorNear).lerp(colorFar, dist / config.plexusMaxDistance);
              
              colorsArray[lineIndex * 3] = colorMix.r * alpha * 0.55;
              colorsArray[lineIndex * 3 + 1] = colorMix.g * alpha * 0.55;
              colorsArray[lineIndex * 3 + 2] = colorMix.b * alpha * 0.55;

              colorsArray[lineIndex * 3 + 3] = colorMix.r * alpha * 0.55;
              colorsArray[lineIndex * 3 + 4] = colorMix.g * alpha * 0.55;
              colorsArray[lineIndex * 3 + 5] = colorMix.b * alpha * 0.55;

              lineIndex += 2;
            }
          }
        }

        plexusLines.geometry.setDrawRange(0, lineIndex);
        plexusLines.geometry.attributes.position.needsUpdate = true;
        plexusLines.geometry.attributes.color.needsUpdate = true;
      } catch (err) {
        console.error("Three.js Plexus Update Error: ", err);
      }
    };

    // Animation Frame Loop
    const animate = () => {
      try {
        animationFrameId = requestAnimationFrame(animate);

        if (!renderer || !scene || !camera || !earthGroup) return;

        if (!isDragging) {
          // Continuous base rotation
          const time = (Date.now() - startTime) * 0.0005 * config.speedMultiplier;
          
          // Strongly map mouse position to earth rotation
          const targetY = time + (mouseX * 2.5); // Strong horizontal rotation based on mouse
          const targetX = (mouseY * 1.2);        // Strong vertical tilt based on mouse

          targetRotationY += (targetY - targetRotationY) * 0.05;
          targetRotationX += (targetX - targetRotationX) * 0.05;
        }

        currentRotationX += (targetRotationX - currentRotationX) * 0.08;
        currentRotationY += (targetRotationY - currentRotationY) * 0.08;

        earthGroup.rotation.x = currentRotationX;
        earthGroup.rotation.y = currentRotationY;

        if (outerStars) {
          outerStars.rotation.y -= 0.0004 * config.speedMultiplier;
          outerStars.rotation.x += 0.0001 * config.speedMultiplier;
        }

        updatePlexus();

        renderer.render(scene, camera);
      } catch (err) {
        console.error("Three.js Animation Frame Error: ", err);
      }
    };

    // Responsive Design Resizing
    const onWindowResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Mouse Interactions
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea')
      ) {
        return;
      }
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      document.body.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = -(e.clientY / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;

        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const targetCamX = mouseX * 2.0;
        const targetCamY = mouseY * 2.0;
        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        camera.position.y += (targetCamY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = 'grab';
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        return;
      }
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (e.touches.length === 1) {
        mouseX = (e.touches[0].clientX / width) * 2 - 1;
        mouseY = -(e.touches[0].clientY / height) * 2 + 1;

        if (isDragging) {
          const deltaX = e.touches[0].clientX - prevMouseX;
          const deltaY = e.touches[0].clientY - prevMouseY;

          targetRotationY += deltaX * 0.008;
          targetRotationX += deltaY * 0.008;

          prevMouseX = e.touches[0].clientX;
          prevMouseY = e.touches[0].clientY;
        }
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    init();

    document.body.style.cursor = 'grab';

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.cursor = '';
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && containerRef.current) {
          try {
            containerRef.current.removeChild(renderer.domElement);
          } catch (err) {
            // handle silently
          }
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, #0c102b 0%, #050716 100%)',
        opacity: 0.8
      }}
    />
  );
};

export default Background3D;
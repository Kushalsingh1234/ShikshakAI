import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function ExplainerThreeScene({
  payload = {},
  cameraInstruction = { zoom: 1.0, subtle_pan: { x: 0, y: 0 } },
  cueIndex = 0,
}) {
  const mountRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const sceneShape = payload?.shape || "neural_net";

  // Keep camera instructions and cue index up-to-date in refs for animation loop
  const cameraRef = useRef(cameraInstruction);
  const cueIndexRef = useRef(cueIndex);
  useEffect(() => {
    cameraRef.current = cameraInstruction;
  }, [cameraInstruction]);
  useEffect(() => {
    cueIndexRef.current = cueIndex;
  }, [cueIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 4, 20);
    cyanPoint.position.set(-5, 4, 3);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 4, 20);
    purplePoint.position.set(5, -3, 3);
    scene.add(purplePoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 2, 15);
    emeraldPoint.position.set(0, 5, -2);
    scene.add(emeraldPoint);

    // 3. Subject-Specific 3D Scene Assembly
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const updatables = [];

    if (sceneShape === "neural_net") {
      // 3D Neural Net Layers
      const layers = payload.layers || [3, 4, 2];
      const layerSpacing = 2.4;
      const nodeMeshes = [];
      const nodePositions = [];

      layers.forEach((count, lIdx) => {
        const x = (lIdx - (layers.length - 1) / 2) * layerSpacing;
        const colPositions = [];
        for (let i = 0; i < count; i++) {
          const y = (i - (count - 1) / 2) * 1.3;
          const z = (Math.sin(i * 1.5 + lIdx) * 0.4);

          const geom = new THREE.SphereGeometry(0.24, 24, 24);
          const color = lIdx === 0 ? 0x06b6d4 : lIdx === 1 ? 0xa855f7 : 0x10b981;
          const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.8,
          });
          const nodeMesh = new THREE.Mesh(geom, mat);
          nodeMesh.position.set(x, y, z);
          mainGroup.add(nodeMesh);

          nodeMeshes.push({ mesh: nodeMesh, layer: lIdx });
          colPositions.push(new THREE.Vector3(x, y, z));
        }
        nodePositions.push(colPositions);
      });

      // Synapse Connections with glowing line geometry
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
      });

      for (let l = 0; l < nodePositions.length - 1; l++) {
        const fromNodes = nodePositions[l];
        const toNodes = nodePositions[l + 1];
        fromNodes.forEach((from) => {
          toNodes.forEach((to) => {
            const lineGeom = new THREE.BufferGeometry().setFromPoints([from, to]);
            const line = new THREE.Line(lineGeom, lineMaterial);
            mainGroup.add(line);
          });
        });
      }

      // Synaptic Pulses (animated signal packets)
      const pulseGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulses = [];
      for (let p = 0; p < 8; p++) {
        const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
        mainGroup.add(pulseMesh);
        pulses.push({
          mesh: pulseMesh,
          from: nodePositions[0][p % nodePositions[0].length],
          to: nodePositions[1][p % nodePositions[1].length],
          progress: Math.random(),
          speed: 0.008 + Math.random() * 0.006,
        });
      }

      updatables.push(() => {
        pulses.forEach((item) => {
          item.progress += item.speed;
          if (item.progress > 1) {
            item.progress = 0;
            item.from = nodePositions[0][Math.floor(Math.random() * nodePositions[0].length)];
            item.to = nodePositions[1][Math.floor(Math.random() * nodePositions[1].length)];
          }
          item.mesh.position.lerpVectors(item.from, item.to, item.progress);
        });

        // Dynamic layer pulsing according to active cue
        const activeLayer = cueIndexRef.current % 3;
        nodeMeshes.forEach(({ mesh, layer }) => {
          if (layer === activeLayer) {
            mesh.material.emissiveIntensity = 0.9 + Math.sin(Date.now() * 0.005) * 0.3;
          } else {
            mesh.material.emissiveIntensity = 0.35;
          }
        });
      });

    } else if (sceneShape === "vector_space") {
      // 3D Cartesian Axes and Transformed Basis Vectors
      const gridHelper = new THREE.GridHelper(8, 16, 0x06b6d4, 0x1e293b);
      gridHelper.position.y = -1.5;
      mainGroup.add(gridHelper);

      const createArrow = (dir, origin, length, hex) => {
        const arrow = new THREE.ArrowHelper(dir.normalize(), origin, length, hex, 0.4, 0.2);
        mainGroup.add(arrow);
        return arrow;
      };

      createArrow(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2.5, 0x06b6d4); // i
      createArrow(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2.5, 0x10b981); // j
      createArrow(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 2.5, 0xa855f7); // k
      createArrow(new THREE.Vector3(1.6, 1.4, 1.2), new THREE.Vector3(0, 0, 0), 2.8, 0xf59e0b); // v

      // Transformed Subspace Plane
      const planeGeom = new THREE.PlaneGeometry(3.5, 3.5);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        roughness: 0.1,
      });
      const planeMesh = new THREE.Mesh(planeGeom, planeMat);
      planeMesh.rotation.x = Math.PI / 4;
      planeMesh.rotation.y = Math.PI / 6;
      mainGroup.add(planeMesh);

    } else if (sceneShape === "physics_orbit") {
      // 3D Gravitational Orbit Mechanics
      const starGeom = new THREE.SphereGeometry(1.0, 32, 32);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf97316,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      });
      const star = new THREE.Mesh(starGeom, starMat);
      mainGroup.add(star);

      // Star Glow Atmosphere Ring
      const coronaGeom = new THREE.RingGeometry(1.05, 1.35, 48);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const corona = new THREE.Mesh(coronaGeom, coronaMat);
      corona.rotation.x = Math.PI / 2;
      mainGroup.add(corona);

      // Orbit Path Ring
      const orbitGeom = new THREE.BufferGeometry();
      const orbitPoints = [];
      const a = 3.4;
      const b = 2.4;
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(theta) * a, 0, Math.sin(theta) * b));
      }
      orbitGeom.setFromPoints(orbitPoints);
      const orbitLine = new THREE.Line(
        orbitGeom,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
      );
      mainGroup.add(orbitLine);

      // Satellite / Planet Body
      const satGeom = new THREE.SphereGeometry(0.32, 24, 24);
      const satMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.4,
        metalness: 0.6,
      });
      const satellite = new THREE.Mesh(satGeom, satMat);
      mainGroup.add(satellite);

      let angle = 0;
      updatables.push(() => {
        angle += 0.018;
        satellite.position.set(Math.cos(angle) * a, 0, Math.sin(angle) * b);
      });

    } else if (sceneShape === "molecule") {
      // 3D Ball-and-Stick Molecule (Water H2O Polar Bond)
      const oxygenGeom = new THREE.SphereGeometry(0.85, 32, 32);
      const oxygenMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const oxygen = new THREE.Mesh(oxygenGeom, oxygenMat);
      oxygen.position.set(0, 0.4, 0);
      mainGroup.add(oxygen);

      const hGeom = new THREE.SphereGeometry(0.48, 24, 24);
      const hMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });

      const h1 = new THREE.Mesh(hGeom, hMat);
      h1.position.set(-1.8, -0.8, 0);
      mainGroup.add(h1);

      const h2 = new THREE.Mesh(hGeom, hMat);
      h2.position.set(1.8, -0.8, 0);
      mainGroup.add(h2);

      // Chemical Bonds (Cylinders)
      const createBond = (from, to) => {
        const bondLength = from.distanceTo(to);
        const bondGeom = new THREE.CylinderGeometry(0.12, 0.12, bondLength, 16);
        const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
        const bond = new THREE.Mesh(bondGeom, bondMat);
        bond.position.copy(from).add(to).multiplyScalar(0.5);
        bond.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          to.clone().sub(from).normalize()
        );
        mainGroup.add(bond);
      };

      createBond(oxygen.position, h1.position);
      createBond(oxygen.position, h2.position);

    } else {
      // 3D Polyhedron Geometry with Wireframe
      const polyGeom = new THREE.DodecahedronGeometry(2.0);
      const polyMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.2,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      const poly = new THREE.Mesh(polyGeom, polyMat);
      mainGroup.add(poly);

      const wireGeom = new THREE.WireframeGeometry(polyGeom);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      const wire = new THREE.LineSegments(wireGeom, wireMat);
      mainGroup.add(wire);
    }

    // 4. Subtle Ambient Float / Particle Dust Field
    const starFieldGeom = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 200; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12
      );
    }
    starFieldGeom.setAttribute("position", new THREE.Float32BufferAttribute(starCoords, 3));
    const starFieldMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starFieldGeom, starFieldMat);
    scene.add(starField);

    // 5. Mouse & Touch Drag Orbit Controls
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (clientX, clientY) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const onPointerMove = (clientX, clientY) => {
      if (!isDragging) return;
      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;
      mainGroup.rotation.y += deltaX * 0.008;
      mainGroup.rotation.x += deltaY * 0.008;
      prevPointerX = clientX;
      prevPointerY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const onMouseDown = (e) => onPointerDown(e.clientX, e.clientY);
    const onMouseMove = (e) => onPointerMove(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 1) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 6. Animation Loop (checks prefers-reduced-motion)
    let animId;
    const baseRotSpeed = payload.rotation_speed || 0.006;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging && !prefersReducedMotion) {
        mainGroup.rotation.y += baseRotSpeed;
        mainGroup.rotation.x += baseRotSpeed * 0.3;
      }

      // Smooth Camera Zoom & Subtle Pan Interpolation via active cameraRef
      const activeCam = cameraRef.current || {};
      const targetZ = prefersReducedMotion ? 7 : 7 / (activeCam.zoom || 1.0);
      camera.position.z += (targetZ - camera.position.z) * 0.04;
      const panX = prefersReducedMotion ? 0 : (activeCam.subtle_pan?.x || 0) * 3;
      const panY = prefersReducedMotion ? 0 : (activeCam.subtle_pan?.y || 0) * 3;
      camera.position.x += (panX - camera.position.x) * 0.04;
      camera.position.y += (1.2 + panY - camera.position.y) * 0.04;

      updatables.forEach((fn) => fn());

      renderer.render(scene, camera);
    };
    animate();

    // 7. Robust Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          camera.aspect = cr.width / cr.height;
          camera.updateProjectionMatrix();
          renderer.setSize(cr.width, cr.height);
        }
      }
    });
    ro.observe(container);

    // 8. Comprehensive Memory Leak Cleanup (Geometry, Material, Texture disposal)
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onPointerUp);

      scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sceneShape]);

  return (
    <div className="explainer-three-canvas-wrap">
      <div ref={mountRef} className="explainer-three-viewport" />
      <div className="explainer-three-hud">
        <span className="hud-badge-3d">
          <span className="hud-dot-pulse" /> 3D SPATIAL MODEL • {sceneShape.toUpperCase().replace("_", " ")}
        </span>
        <span className="hud-hint">
          {isInteracting ? "Inspecting 3D Canvas" : "Click & Drag to Rotate Canvas in 3D"}
        </span>
      </div>
    </div>
  );
}

export default React.memo(ExplainerThreeScene);

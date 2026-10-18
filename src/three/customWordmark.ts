import * as THREE from 'three';

export interface CustomWordmarkInstallation {
  group: THREE.Group;
  updateState: (scrollProgress: number, elapsed: number) => void;
  dispose: () => void;
}

/**
 * Builds the custom 3D architectural wordmark "MIKEY" using procedural vector shapes
 * and ExtrudeGeometry with intentional perspective/depth contradictions.
 * Zero external font file dependency.
 */
export function createCustomWordmark(): CustomWordmarkInstallation {
  const group = new THREE.Group();
  group.name = 'MikeyArchitecturalWordmark';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const letterMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    roughness: 0.38,
    metalness: 0.15,
  });
  const contradictionMat = new THREE.MeshStandardMaterial({
    color: 0xf8f7f2,
    roughness: 0.22,
    metalness: 0.35,
  });
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x888983,
    transparent: true,
    opacity: 0.5,
  });
  materials.push(letterMat, contradictionMat, lineMat);

  function addBlock(
    parent: THREE.Group,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rotZ = 0,
    useAccent = false
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, useAccent ? contradictionMat : letterMat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    geometries.push(edges);
    mesh.add(new THREE.LineSegments(edges, lineMat));
  }

  const barThickness = 0.14;
  const letterHeight = 1.15;

  // 1. Letter M (Unexpected internal depth plane on the V-apex)
  const mGroup = new THREE.Group();
  mGroup.position.set(-2.9, 0, 0);
  addBlock(mGroup, barThickness, letterHeight, 0.22, -0.42, 0, 0);
  addBlock(mGroup, barThickness, letterHeight, 0.22, 0.42, 0, 0);
  addBlock(mGroup, 0.11, 0.72, 0.38, -0.2, 0.12, -0.18, 0.52, true);
  addBlock(mGroup, 0.11, 0.72, 0.38, 0.2, 0.12, 0.18, -0.52, true);
  group.add(mGroup);

  // 2. Letter I (Shadow bar below implies a contradictory thickness)
  const iGroup = new THREE.Group();
  iGroup.position.set(-1.55, 0, 0);
  addBlock(iGroup, barThickness, letterHeight, 0.18, 0, 0, 0);
  // Displaced architectural shadow plinth
  addBlock(iGroup, 0.55, 0.04, 0.45, 0.08, -letterHeight / 2 - 0.08, -0.12, 0, true);
  group.add(iGroup);

  // 3. Letter K (Upper branch passes through a thinvertical datum plane)
  const kGroup = new THREE.Group();
  kGroup.position.set(-0.35, 0, 0);
  addBlock(kGroup, barThickness, letterHeight, 0.22, -0.32, 0, 0);
  addBlock(kGroup, 0.12, 0.74, 0.2, 0.06, 0.24, 0.12, -0.68, true);
  addBlock(kGroup, 0.12, 0.74, 0.2, 0.08, -0.24, -0.12, 0.68);
  group.add(kGroup);

  // 4. Letter E (Horizontal bars occupy inconsistent depth planes that align from front)
  const eGroup = new THREE.Group();
  eGroup.position.set(1.15, 0, 0);
  addBlock(eGroup, barThickness, letterHeight, 0.22, -0.32, 0, 0);
  addBlock(eGroup, 0.66, barThickness, 0.18, 0.02, letterHeight / 2 - barThickness / 2, 0.22, 0, true);
  addBlock(eGroup, 0.54, barThickness, 0.18, -0.04, 0, 0.0);
  addBlock(eGroup, 0.66, barThickness, 0.18, 0.02, -letterHeight / 2 + barThickness / 2, -0.22, 0, true);
  group.add(eGroup);

  // 5. Letter Y (Upper arms imply continuation via fine extension hairlines)
  const yGroup = new THREE.Group();
  yGroup.position.set(2.65, 0, 0);
  addBlock(yGroup, barThickness, 0.62, 0.22, 0, -0.26, 0);
  addBlock(yGroup, 0.12, 0.66, 0.22, -0.22, 0.28, 0.08, 0.58);
  addBlock(yGroup, 0.12, 0.66, 0.22, 0.22, 0.28, -0.08, -0.58, true);

  // Continuation hairline vectors extending beyond Y's arms
  const extPoints = [
    new THREE.Vector3(-0.42, 0.56, 0.08),
    new THREE.Vector3(-1.15, 1.38, 0.08),
    new THREE.Vector3(0.42, 0.56, -0.08),
    new THREE.Vector3(1.15, 1.38, -0.08),
  ];
  const extGeo = new THREE.BufferGeometry().setFromPoints(extPoints);
  geometries.push(extGeo);
  yGroup.add(new THREE.LineSegments(extGeo, lineMat));
  group.add(yGroup);

  // Architectural baseline rule that extends across the opening vista
  const rulePoints = [
    new THREE.Vector3(-9.5, -0.78, 0.2),
    new THREE.Vector3(9.5, -0.78, 0.2),
  ];
  const ruleGeo = new THREE.BufferGeometry().setFromPoints(rulePoints);
  geometries.push(ruleGeo);
  const baselineRule = new THREE.Line(ruleGeo, lineMat);
  group.add(baselineRule);

  group.position.set(0, 3.15, -2.4);

  return {
    group,
    updateState: (scrollProgress: number, elapsed: number) => {
      // Gradually transform the wordmark into high-altitude architectural coordinates as visitor moves deeper
      const expansion = Math.max(0, Math.min(1, scrollProgress * 2.5));
      group.position.y = 3.15 + expansion * 3.8 + Math.sin(elapsed * 0.4) * 0.03;
      group.position.z = -2.4 - expansion * 5.2;
      mGroup.position.z = -expansion * 1.4;
      eGroup.position.z = expansion * 1.2;
      lineMat.opacity = Math.max(0.15, 0.55 - expansion * 0.35);
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

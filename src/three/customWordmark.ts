import * as THREE from 'three';

export interface CustomWordmarkInstallation {
  group: THREE.Group;
  clickProxy: THREE.Mesh;
  updateState: (
    scrollProgress: number,
    elapsed: number,
    isHoveredOrInspected: boolean
  ) => void;
  dispose: () => void;
}

/**
 * Builds the custom 3D architectural wordmark "MIKEY" as the primary hero focal point
 * in the opening vista, with strong bone-white & soft-white contrast, architectural
 * framing lintels, depth contradictions, and a raycastable click proxy.
 */
export function createCustomWordmark(): CustomWordmarkInstallation {
  const group = new THREE.Group();
  group.name = 'MikeyArchitecturalWordmark';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // High-contrast bone-white stone with subtle emissive lift so it never gets overshadowed
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0xf8f7f2,
    emissive: 0xe9e5da,
    emissiveIntensity: 0.22,
    roughness: 0.28,
    metalness: 0.14,
  });

  // Contradiction depth planes in warm bone & brushed metallic finish
  const contradictionMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    emissive: 0x526bff,
    emissiveIntensity: 0.18,
    roughness: 0.2,
    metalness: 0.42,
  });

  const amberAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf8f7f2,
    emissive: 0xf0a65a,
    emissiveIntensity: 0.28,
    roughness: 0.22,
    metalness: 0.35,
  });

  const crispEdgeMat = new THREE.LineBasicMaterial({
    color: 0xf8f7f2,
    transparent: true,
    opacity: 0.88,
  });

  const cobaltRuleMat = new THREE.LineBasicMaterial({
    color: 0x526bff,
    transparent: true,
    opacity: 0.85,
  });

  materials.push(
    letterMat,
    contradictionMat,
    amberAccentMat,
    crispEdgeMat,
    cobaltRuleMat
  );

  function addBlock(
    parent: THREE.Group,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rotZ = 0,
    matMode: 'primary' | 'cobalt' | 'amber' = 'primary'
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    geometries.push(geo);
    const chosenMat =
      matMode === 'cobalt'
        ? contradictionMat
        : matMode === 'amber'
        ? amberAccentMat
        : letterMat;
    const mesh = new THREE.Mesh(geo, chosenMat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    geometries.push(edges);
    mesh.add(new THREE.LineSegments(edges, crispEdgeMat));
  }

  const barThickness = 0.2;
  const letterHeight = 1.48;

  // 1. Letter M (Unexpected internal depth plane on the V-apex)
  const mGroup = new THREE.Group();
  mGroup.position.set(-3.35, 0, 0);
  addBlock(mGroup, barThickness, letterHeight, 0.32, -0.48, 0, 0);
  addBlock(mGroup, barThickness, letterHeight, 0.32, 0.48, 0, 0);
  addBlock(mGroup, 0.15, 0.88, 0.44, -0.23, 0.14, -0.18, 0.52, 'cobalt');
  addBlock(mGroup, 0.15, 0.88, 0.44, 0.23, 0.14, 0.18, -0.52, 'amber');
  group.add(mGroup);

  // 2. Letter I (Elevated column with displaced architectural shadow plinth)
  const iGroup = new THREE.Group();
  iGroup.position.set(-1.75, 0, 0);
  addBlock(iGroup, barThickness, letterHeight, 0.3, 0, 0, 0);
  addBlock(
    iGroup,
    0.68,
    0.06,
    0.52,
    0.08,
    -letterHeight / 2 - 0.1,
    -0.12,
    0,
    'amber'
  );
  addBlock(
    iGroup,
    0.68,
    0.06,
    0.52,
    -0.08,
    letterHeight / 2 + 0.1,
    0.12,
    0,
    'cobalt'
  );
  group.add(iGroup);

  // 3. Letter K (Upper branch passes through a vertical datum plane)
  const kGroup = new THREE.Group();
  kGroup.position.set(-0.35, 0, 0);
  addBlock(kGroup, barThickness, letterHeight, 0.32, -0.36, 0, 0);
  addBlock(kGroup, 0.16, 0.92, 0.28, 0.08, 0.28, 0.14, -0.68, 'cobalt');
  addBlock(kGroup, 0.16, 0.92, 0.28, 0.1, -0.28, -0.14, 0.68);
  group.add(kGroup);

  // 4. Letter E (Horizontal cantilevers occupy three Z-planes that align from arrival axis)
  const eGroup = new THREE.Group();
  eGroup.position.set(1.35, 0, 0);
  addBlock(eGroup, barThickness, letterHeight, 0.32, -0.36, 0, 0);
  addBlock(
    eGroup,
    0.78,
    barThickness,
    0.26,
    0.04,
    letterHeight / 2 - barThickness / 2,
    0.22,
    0,
    'amber'
  );
  addBlock(eGroup, 0.64, barThickness * 0.9, 0.26, -0.02, 0, 0.0);
  addBlock(
    eGroup,
    0.78,
    barThickness,
    0.26,
    0.04,
    -letterHeight / 2 + barThickness / 2,
    -0.22,
    0,
    'cobalt'
  );
  group.add(eGroup);

  // 5. Letter Y (Upper arms imply continuation via precision extension vectors)
  const yGroup = new THREE.Group();
  yGroup.position.set(3.05, 0, 0);
  addBlock(yGroup, barThickness, 0.78, 0.32, 0, -0.34, 0);
  addBlock(yGroup, 0.16, 0.82, 0.3, -0.26, 0.34, 0.1, 0.58);
  addBlock(yGroup, 0.16, 0.82, 0.3, 0.26, 0.34, -0.1, -0.58, 'cobalt');

  const extPoints = [
    new THREE.Vector3(-0.48, 0.68, 0.1),
    new THREE.Vector3(-1.35, 1.55, 0.1),
    new THREE.Vector3(0.48, 0.68, -0.1),
    new THREE.Vector3(1.35, 1.55, -0.1),
  ];
  const extGeo = new THREE.BufferGeometry().setFromPoints(extPoints);
  geometries.push(extGeo);
  yGroup.add(new THREE.LineSegments(extGeo, cobaltRuleMat));
  group.add(yGroup);

  // Framing architectural datum lintel beneath MIKEY so the wordmark sits on a clear horizon stage
  const lintelGeo = new THREE.BoxGeometry(8.6, 0.05, 0.18);
  geometries.push(lintelGeo);
  const lintelMesh = new THREE.Mesh(lintelGeo, contradictionMat);
  lintelMesh.position.set(-0.1, -1.02, 0.1);
  group.add(lintelMesh);

  const rulePoints = [
    new THREE.Vector3(-11.0, -1.04, 0.22),
    new THREE.Vector3(11.0, -1.04, 0.22),
  ];
  const ruleGeo = new THREE.BufferGeometry().setFromPoints(rulePoints);
  geometries.push(ruleGeo);
  const baselineRule = new THREE.Line(ruleGeo, cobaltRuleMat);
  group.add(baselineRule);

  // Raycast proxy so visitors can click the 3D MIKEY wordmark to inspect its architecture
  const proxyGeo = new THREE.BoxGeometry(8.2, 2.2, 1.2);
  geometries.push(proxyGeo);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  materials.push(proxyMat);
  const clickProxy = new THREE.Mesh(proxyGeo, proxyMat);
  clickProxy.name = 'WordmarkProxy';
  clickProxy.userData = { inspectionTargetId: 'wordmark' };
  group.add(clickProxy);

  // Positioned cleanly in the upper-middle hero plane with generous negative space
  group.position.set(0, 3.55, -1.6);

  return {
    group,
    clickProxy,
    updateState: (
      scrollProgress: number,
      elapsed: number,
      isHoveredOrInspected: boolean
    ) => {
      const expansion = Math.max(0, Math.min(1, scrollProgress * 2.2));
      group.position.y =
        3.55 + expansion * 2.4 + Math.sin(elapsed * 0.45) * 0.035;
      group.position.z = -1.6 - expansion * 3.8;

      // Subtle paradoxical depth separation when scrolled or inspected
      const inspectOffset = isHoveredOrInspected ? 0.45 : 0;
      mGroup.position.z = -(expansion * 0.9 + inspectOffset * 0.5);
      iGroup.position.y = inspectOffset * 0.18;
      kGroup.position.z = inspectOffset * 0.35;
      eGroup.position.z = expansion * 0.9 + inspectOffset * 0.5;

      letterMat.emissiveIntensity = isHoveredOrInspected ? 0.42 : 0.24;
      contradictionMat.emissiveIntensity = isHoveredOrInspected ? 0.55 : 0.22;
      crispEdgeMat.opacity = Math.max(
        0.35,
        (isHoveredOrInspected ? 1.0 : 0.9) - expansion * 0.35
      );
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

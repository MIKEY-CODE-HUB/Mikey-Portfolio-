import * as THREE from 'three';

export type SurfaceFinishMode = 'obsidian' | 'graphite' | 'wireframe';

export interface SignatureImpossibleObject {
  group: THREE.Group;
  clickProxy: THREE.Mesh;
  updateState: (params: {
    elapsed: number;
    paradoxSeparation: number;
    wireframeMix: number;
    finishMode: SurfaceFinishMode;
    hoverIntensity: number;
    cobaltIntensity: number;
    amberIntensity: number;
  }) => void;
  dispose: () => void;
}

const _cobaltColor = new THREE.Color(0x526bff);
const _amberColor = new THREE.Color(0xf0a65a);
const _boneColor = new THREE.Color(0xe9e5da);
const _softWhiteColor = new THREE.Color(0xf8f7f2);

export function createSignatureImpossibleObject(
  bumpTexture: THREE.CanvasTexture,
  contactShadowTexture: THREE.CanvasTexture
): SignatureImpossibleObject {
  const group = new THREE.Group();
  group.name = 'SignatureImpossibleObject';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Materials across contrasting monochrome finishes + selective Cobalt & Amber accents
  const primaryMat = new THREE.MeshStandardMaterial({
    color: 0x20211f,
    roughness: 0.72,
    metalness: 0.18,
    bumpMap: bumpTexture,
    bumpScale: 0.015,
  });
  const boneAccentMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    roughness: 0.32,
    metalness: 0.12,
  });
  const brushedMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0x888983,
    roughness: 0.2,
    metalness: 0.88,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    bumpMap: bumpTexture,
    bumpScale: 0.008,
  });
  const cobaltTrajectoryMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    emissive: 0x526bff,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.45,
  });
  const amberAxisMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    emissive: 0xf0a65a,
    emissiveIntensity: 0.3,
    roughness: 0.28,
    metalness: 0.35,
  });
  const translucentPlaneMat = new THREE.MeshPhysicalMaterial({
    color: 0x454642,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.68,
    transparent: true,
    opacity: 0.72,
    thickness: 0.4,
    ior: 1.48,
    depthWrite: false,
  });
  const edgeLineMat = new THREE.LineBasicMaterial({
    color: 0xf8f7f2,
    transparent: true,
    opacity: 0.55,
  });
  const cobaltEdgeMat = new THREE.LineBasicMaterial({
    color: 0x526bff,
    transparent: true,
    opacity: 0.65,
  });

  materials.push(
    primaryMat,
    boneAccentMat,
    brushedMetalMat,
    cobaltTrajectoryMat,
    amberAxisMat,
    translucentPlaneMat,
    edgeLineMat,
    cobaltEdgeMat
  );

  // Helper to create beveled L-beam segments (Parts 1-4: Primary Silhouette)
  function createLBeam(armA: number, armB: number, thickness: number, depth: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(armA, 0);
    shape.lineTo(armA, thickness);
    shape.lineTo(thickness, thickness);
    shape.lineTo(thickness, armB);
    shape.lineTo(0, armB);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    geo.center();
    geometries.push(geo);
    return geo;
  }

  const beamGeoA = createLBeam(2.4, 2.4, 0.34, 0.34);
  const beamGeoB = createLBeam(2.1, 2.1, 0.3, 0.3);

  // Part 1: Lower-left obsidian structural L-monolith
  const beam1 = new THREE.Mesh(beamGeoA, primaryMat);
  beam1.castShadow = true;
  beam1.receiveShadow = true;
  beam1.position.set(-0.42, 0.0, 0.38);
  const edges1Geo = new THREE.EdgesGeometry(beamGeoA, 20);
  geometries.push(edges1Geo);
  beam1.add(new THREE.LineSegments(edges1Geo, edgeLineMat));

  // Part 2: Upper-right inverted L-monolith that appears coplanar from front but offset in Z
  const beam2 = new THREE.Mesh(beamGeoA, primaryMat);
  beam2.castShadow = true;
  beam2.receiveShadow = true;
  beam2.rotation.z = Math.PI;
  beam2.position.set(0.42, 0.45, -0.42);
  const edges2Geo = new THREE.EdgesGeometry(beamGeoA, 20);
  geometries.push(edges2Geo);
  beam2.add(new THREE.LineSegments(edges2Geo, cobaltEdgeMat));

  // Part 3: Bone-white cantilevered paradox bar passing through the obstructing plane
  const passBarGeo = new THREE.BoxGeometry(3.2, 0.22, 0.22);
  geometries.push(passBarGeo);
  const passBar = new THREE.Mesh(passBarGeo, boneAccentMat);
  passBar.castShadow = true;
  passBar.position.set(0, 0.22, 0);
  passBar.rotation.set(0.0, 0.36, 0.18);

  // Part 4: Orthogonal counter-cantilever
  const counterBeam = new THREE.Mesh(beamGeoB, brushedMetalMat);
  counterBeam.castShadow = true;
  counterBeam.receiveShadow = true;
  counterBeam.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  counterBeam.position.set(0, 0.2, 0);

  // Part 5: Secondary Read — Translucent obstructing architectural datum plane
  const planeGeo = new THREE.BoxGeometry(0.06, 2.85, 2.25);
  geometries.push(planeGeo);
  const datumPlane = new THREE.Mesh(planeGeo, translucentPlaneMat);
  datumPlane.renderOrder = 2;
  datumPlane.position.set(0.08, 0.24, 0);
  const planeEdgesGeo = new THREE.EdgesGeometry(planeGeo);
  geometries.push(planeEdgesGeo);
  datumPlane.add(new THREE.LineSegments(planeEdgesGeo, edgeLineMat));

  // Part 6: Secondary Read — Lathe-turned precision horizon ring
  const lathePoints = [
    new THREE.Vector2(1.55, -0.06),
    new THREE.Vector2(1.66, -0.06),
    new THREE.Vector2(1.68, 0.06),
    new THREE.Vector2(1.55, 0.06),
    new THREE.Vector2(1.55, -0.06),
  ];
  const ringGeo = new THREE.LatheGeometry(lathePoints, 48);
  geometries.push(ringGeo);
  const calibrationRing = new THREE.Mesh(ringGeo, brushedMetalMat);
  calibrationRing.rotation.x = Math.PI / 3;
  calibrationRing.position.set(0, 0.22, 0);

  // Part 7: Secondary Read — TubeGeometry spatial tension arc (Electric Cobalt curiosity line)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, -0.85, 0.45),
    new THREE.Vector3(-0.55, 0.95, 0.65),
    new THREE.Vector3(0.65, 1.15, -0.55),
    new THREE.Vector3(1.35, -0.65, -0.45),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.034, 8, false);
  geometries.push(tubeGeo);
  const tensionArc = new THREE.Mesh(tubeGeo, cobaltTrajectoryMat);

  // Part 8: Accent Detail — Suspended Warm Amber plumb bob & vertical axis needle
  const needleGeo = new THREE.CylinderGeometry(0.018, 0.018, 3.6, 12);
  geometries.push(needleGeo);
  const axisNeedle = new THREE.Mesh(needleGeo, amberAxisMat);
  axisNeedle.position.set(0, 0.3, 0);

  // Part 9: Accent Detail — Contradictory ground shadow bar
  const shadowBarGeo = new THREE.PlaneGeometry(4.2, 0.26);
  geometries.push(shadowBarGeo);
  const shadowBarMat = new THREE.MeshBasicMaterial({
    color: 0xe9e5da,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  materials.push(shadowBarMat);
  const contradictoryShadowBar = new THREE.Mesh(shadowBarGeo, shadowBarMat);
  contradictoryShadowBar.rotation.x = -Math.PI / 2;
  contradictoryShadowBar.rotation.z = -0.28;
  contradictoryShadowBar.position.set(0, -1.32, 0);

  // Part 10: Grounded radial contact shadow disc
  const contactGeo = new THREE.CircleGeometry(2.6, 32);
  geometries.push(contactGeo);
  const contactMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  materials.push(contactMat);
  const contactDisc = new THREE.Mesh(contactGeo, contactMat);
  contactDisc.rotation.x = -Math.PI / 2;
  contactDisc.position.set(0, -1.33, 0);

  // Invisible simplified proxy box for fast raycasting
  const proxyGeo = new THREE.BoxGeometry(3.4, 3.4, 3.4);
  geometries.push(proxyGeo);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  materials.push(proxyMat);
  const clickProxy = new THREE.Mesh(proxyGeo, proxyMat);
  clickProxy.name = 'SignatureObjectProxy';

  group.add(
    beam1,
    beam2,
    passBar,
    counterBeam,
    datumPlane,
    calibrationRing,
    tensionArc,
    axisNeedle,
    contradictoryShadowBar,
    contactDisc,
    clickProxy
  );

  return {
    group,
    clickProxy,
    updateState: ({
      elapsed,
      paradoxSeparation,
      wireframeMix,
      finishMode,
      hoverIntensity,
      cobaltIntensity,
      amberIntensity,
    }) => {
      const sep = paradoxSeparation;

      // Smooth architectural separation of the impossible joints
      beam1.position.set(-0.42 - sep * 0.65, -sep * 0.25, 0.38 + sep * 0.55);
      beam2.position.set(0.42 + sep * 0.65, 0.45 + sep * 0.3, -0.42 - sep * 0.55);
      datumPlane.position.x = 0.08 + Math.sin(elapsed * 0.5) * 0.04;
      calibrationRing.rotation.z = elapsed * 0.08 + sep * 0.9;
      counterBeam.rotation.y = sep * 0.75 + hoverIntensity * 0.25;
      passBar.position.y = 0.22 + hoverIntensity * 0.12;

      // Material finish & wireframe interpolation
      const isWire = finishMode === 'wireframe';
      primaryMat.wireframe = isWire;
      brushedMetalMat.wireframe = isWire;

      if (finishMode === 'graphite') {
        primaryMat.color.setHex(0x3a3b37);
        primaryMat.metalness = 0.62;
        primaryMat.roughness = 0.35;
      } else {
        primaryMat.color.setHex(0x20211f);
        primaryMat.metalness = 0.18;
        primaryMat.roughness = 0.72;
      }

      // Selective Electric Cobalt (#526BFF) & Warm Amber (#F0A65A) accents
      cobaltTrajectoryMat.color.copy(_boneColor).lerp(_cobaltColor, cobaltIntensity * 0.85);
      cobaltTrajectoryMat.emissiveIntensity = 0.15 + cobaltIntensity * 0.65 + hoverIntensity * 0.3;

      amberAxisMat.color.copy(_boneColor).lerp(_amberColor, amberIntensity * 0.9);
      amberAxisMat.emissiveIntensity = 0.15 + amberIntensity * 0.7 + hoverIntensity * 0.25;

      cobaltEdgeMat.color.copy(_softWhiteColor).lerp(_cobaltColor, cobaltIntensity);
      cobaltEdgeMat.opacity = Math.min(1, 0.35 + cobaltIntensity * 0.55 + wireframeMix * 0.3);

      edgeLineMat.opacity = Math.min(1, 0.38 + wireframeMix * 0.55 + hoverIntensity * 0.25);
      contradictoryShadowBar.material.opacity = 0.12 + (1 - sep) * 0.14;
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

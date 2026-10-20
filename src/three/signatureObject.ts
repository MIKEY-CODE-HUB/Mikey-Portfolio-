import * as THREE from 'three';

export type SurfaceFinishMode = 'obsidian' | 'graphite' | 'wireframe';

export interface SignatureImpossibleObject {
  group: THREE.Group;
  clickProxy: THREE.Mesh;
  updateState: (params: {
    elapsed: number;
    foldDepth: number;
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

/**
 * THE FOLD — Signature Impossible Architectural Formation
 *
 * Bends space back into itself through:
 * 1. Monumental nested frames (Outer Bone-White Stone Frame -> Middle Charcoal Folded Frame -> Inner Sanctum Aperture)
 * 2. Architectural planes that hinge and fold at impossible angles
 * 3. A cantilevered bridge connecting the foreground threshold to the distant recessed frame
 * 4. Deep layered spaces visible through a narrow central opening
 * 5. Restrained Electric Cobalt (#526BFF) and Warm Amber (#F0A65A) structural seams
 */
export function createSignatureImpossibleObject(
  bumpTexture: THREE.CanvasTexture,
  contactShadowTexture: THREE.CanvasTexture
): SignatureImpossibleObject {
  const group = new THREE.Group();
  group.name = 'TheFoldSignatureFormation';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Material 1: Bone-White Architectural Stone (#E9E5DA)
  const boneStoneMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    emissive: 0x262522,
    emissiveIntensity: 0.22,
    roughness: 0.34,
    metalness: 0.12,
    bumpMap: bumpTexture,
    bumpScale: 0.012,
  });

  // Material 2: Sculpted Charcoal Concrete (#2B2C29)
  const charcoalConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x2e302c,
    emissive: 0x161715,
    emissiveIntensity: 0.32,
    roughness: 0.52,
    metalness: 0.26,
    bumpMap: bumpTexture,
    bumpScale: 0.018,
  });

  // Material 3: Dark Reflective Obsidian Slab (#181917)
  const obsidianReflectiveMat = new THREE.MeshPhysicalMaterial({
    color: 0x191a18,
    roughness: 0.14,
    metalness: 0.72,
    clearcoat: 0.65,
    clearcoatRoughness: 0.15,
  });

  // Material 4: Brushed Structural Steel
  const brushedSteelMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fa199,
    roughness: 0.22,
    metalness: 0.86,
    clearcoat: 0.4,
    bumpMap: bumpTexture,
    bumpScale: 0.008,
  });

  // Material 5: Electric Cobalt Structural Seam (#526BFF)
  const cobaltSeamMat = new THREE.MeshStandardMaterial({
    color: 0x526bff,
    emissive: 0x526bff,
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.4,
  });

  // Material 6: Warm Amber Inner Aperture Slit (#F0A65A)
  const amberApertureMat = new THREE.MeshStandardMaterial({
    color: 0xf0a65a,
    emissive: 0xf0a65a,
    emissiveIntensity: 0.68,
    roughness: 0.24,
    metalness: 0.3,
  });

  // Crisp Architectural Edge Highlight Materials
  const boneEdgeMat = new THREE.LineBasicMaterial({
    color: 0xf8f7f2,
    transparent: true,
    opacity: 0.86,
  });
  const graphiteEdgeMat = new THREE.LineBasicMaterial({
    color: 0x888983,
    transparent: true,
    opacity: 0.65,
  });
  const cobaltEdgeMat = new THREE.LineBasicMaterial({
    color: 0x526bff,
    transparent: true,
    opacity: 0.92,
  });
  const amberEdgeMat = new THREE.LineBasicMaterial({
    color: 0xf0a65a,
    transparent: true,
    opacity: 0.85,
  });

  materials.push(
    boneStoneMat,
    charcoalConcreteMat,
    obsidianReflectiveMat,
    brushedSteelMat,
    cobaltSeamMat,
    amberApertureMat,
    boneEdgeMat,
    graphiteEdgeMat,
    cobaltEdgeMat,
    amberEdgeMat
  );

  function addMeshWithEdges(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    edgeMat: THREE.LineBasicMaterial,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const edgesGeo = new THREE.EdgesGeometry(geo, 15);
    geometries.push(edgesGeo);
    mesh.add(new THREE.LineSegments(edgesGeo, edgeMat));
    parent.add(mesh);
    return mesh;
  }

  // =========================================================================
  // 1. OUTER MONUMENTAL FRAME (Bone-White Stone & Mitered Return)
  // =========================================================================
  const outerFrameGroup = new THREE.Group();
  // Left monumental pier
  addMeshWithEdges(
    outerFrameGroup,
    new THREE.BoxGeometry(0.42, 3.1, 0.56),
    boneStoneMat,
    boneEdgeMat,
    [-1.68, 0.15, 0.42]
  );
  // Upper cantilevered lintel folding back in Z
  addMeshWithEdges(
    outerFrameGroup,
    new THREE.BoxGeometry(3.78, 0.36, 0.56),
    boneStoneMat,
    boneEdgeMat,
    [0.0, 1.52, 0.42]
  );
  // Right pier (split into an impossible stepped return)
  addMeshWithEdges(
    outerFrameGroup,
    new THREE.BoxGeometry(0.42, 2.35, 0.56),
    boneStoneMat,
    boneEdgeMat,
    [1.68, 0.52, 0.42]
  );
  // Lower threshold sill
  addMeshWithEdges(
    outerFrameGroup,
    new THREE.BoxGeometry(2.85, 0.24, 0.64),
    charcoalConcreteMat,
    boneEdgeMat,
    [-0.45, -1.28, 0.42]
  );
  group.add(outerFrameGroup);

  // =========================================================================
  // 2. MIDDLE NESTED FOLD FRAME (Charcoal Concrete & Hinged Planes)
  // =========================================================================
  const middleFrameGroup = new THREE.Group();
  middleFrameGroup.position.set(0.08, 0.12, -0.38);

  // Nested left wall slab (angled inward to create forced perspective)
  addMeshWithEdges(
    middleFrameGroup,
    new THREE.BoxGeometry(0.32, 2.55, 0.72),
    charcoalConcreteMat,
    boneEdgeMat,
    [-1.08, 0.0, 0.0],
    [0, 0.24, 0]
  );
  // Nested right wall slab (counter-folded)
  addMeshWithEdges(
    middleFrameGroup,
    new THREE.BoxGeometry(0.32, 2.55, 0.72),
    charcoalConcreteMat,
    cobaltEdgeMat,
    [1.08, 0.0, -0.18],
    [0, -0.28, 0]
  );
  // Nested upper soffit plane
  addMeshWithEdges(
    middleFrameGroup,
    new THREE.BoxGeometry(2.48, 0.26, 0.74),
    brushedSteelMat,
    boneEdgeMat,
    [0.0, 1.15, -0.08]
  );
  group.add(middleFrameGroup);

  // =========================================================================
  // 3. INNER SANCTUM APERTURE (Deep Narrow Slit with Warm Amber Core)
  // =========================================================================
  const innerSanctumGroup = new THREE.Group();
  innerSanctumGroup.position.set(0.0, 0.12, -1.15);

  // Flanking dark obsidian monolith slabs forming a narrow vertical threshold slit
  addMeshWithEdges(
    innerSanctumGroup,
    new THREE.BoxGeometry(0.68, 2.25, 0.34),
    obsidianReflectiveMat,
    graphiteEdgeMat,
    [-0.48, 0.0, 0.0],
    [0, 0.12, 0]
  );
  addMeshWithEdges(
    innerSanctumGroup,
    new THREE.BoxGeometry(0.68, 2.25, 0.34),
    obsidianReflectiveMat,
    graphiteEdgeMat,
    [0.48, 0.0, 0.0],
    [0, -0.12, 0]
  );
  // Warm Amber vertical light slit recessed deep inside the narrow opening
  const amberSlitMesh = addMeshWithEdges(
    innerSanctumGroup,
    new THREE.BoxGeometry(0.07, 1.98, 0.12),
    amberApertureMat,
    amberEdgeMat,
    [0.0, 0.02, -0.16]
  );
  group.add(innerSanctumGroup);

  // =========================================================================
  // 4. HINGED ARCHITECTURAL PLANES (Origami-like Folded Wing Surfaces)
  // =========================================================================
  const leftFoldWing = new THREE.Group();
  leftFoldWing.position.set(-1.45, 0.18, 0.15);
  addMeshWithEdges(
    leftFoldWing,
    new THREE.BoxGeometry(0.95, 1.92, 0.14),
    boneStoneMat,
    boneEdgeMat,
    [-0.42, 0.0, 0.0],
    [0.08, 0.48, -0.12]
  );
  group.add(leftFoldWing);

  const rightFoldWing = new THREE.Group();
  rightFoldWing.position.set(1.45, 0.1, 0.05);
  addMeshWithEdges(
    rightFoldWing,
    new THREE.BoxGeometry(1.05, 1.75, 0.14),
    charcoalConcreteMat,
    cobaltEdgeMat,
    [0.46, 0.0, 0.0],
    [-0.08, -0.52, 0.14]
  );
  group.add(rightFoldWing);

  // =========================================================================
  // 5. IMPOSSIBLE SPANNING BRIDGE (Connects Foreground Sill to Recessed Frame)
  // =========================================================================
  const foldBridgeGroup = new THREE.Group();
  // Cantilevered walkway deck cutting diagonally through the nested frames
  addMeshWithEdges(
    foldBridgeGroup,
    new THREE.BoxGeometry(3.45, 0.14, 0.44),
    boneStoneMat,
    boneEdgeMat,
    [0.08, -0.28, -0.12],
    [0.12, -0.42, 0.18]
  );
  // Electric Cobalt structural seam embedded along the bridge parapet
  const cobaltSeamMesh = addMeshWithEdges(
    foldBridgeGroup,
    new THREE.BoxGeometry(3.48, 0.045, 0.06),
    cobaltSeamMat,
    cobaltEdgeMat,
    [0.08, -0.19, 0.08],
    [0.12, -0.42, 0.18]
  );
  // Counter-bridge connecting upper right pier back into the inner sanctum
  addMeshWithEdges(
    foldBridgeGroup,
    new THREE.BoxGeometry(2.35, 0.12, 0.32),
    brushedSteelMat,
    amberEdgeMat,
    [0.32, 0.56, -0.35],
    [-0.08, 0.58, -0.15]
  );
  group.add(foldBridgeGroup);

  // =========================================================================
  // 6. GROUNDED ARCHITECTURAL PLINTH & CONTACT SHADOW
  // =========================================================================
  addMeshWithEdges(
    group,
    new THREE.BoxGeometry(4.4, 0.1, 2.6),
    charcoalConcreteMat,
    graphiteEdgeMat,
    [0, -1.42, -0.2]
  );

  const contactGeo = new THREE.CircleGeometry(3.1, 32);
  geometries.push(contactGeo);
  const contactMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  });
  materials.push(contactMat);
  const contactDisc = new THREE.Mesh(contactGeo, contactMat);
  contactDisc.rotation.x = -Math.PI / 2;
  contactDisc.position.set(0, -1.46, -0.2);
  group.add(contactDisc);

  // Raycast proxy for click-to-inspect & hover feedback
  const proxyGeo = new THREE.BoxGeometry(4.2, 3.3, 3.0);
  geometries.push(proxyGeo);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  materials.push(proxyMat);
  const clickProxy = new THREE.Mesh(proxyGeo, proxyMat);
  clickProxy.name = 'TheFoldObjectProxy';
  clickProxy.userData = { inspectionTargetId: 'the-fold' };
  group.add(clickProxy);

  return {
    group,
    clickProxy,
    updateState: ({
      elapsed,
      foldDepth,
      wireframeMix,
      finishMode,
      hoverIntensity,
      cobaltIntensity,
      amberIntensity,
    }) => {
      const f = foldDepth;

      // 1. Nested Frames Telescope & Counter-Fold as foldDepth changes
      outerFrameGroup.position.z = 0.42 + f * 0.45;
      outerFrameGroup.rotation.y = -f * 0.18 + hoverIntensity * 0.06;

      middleFrameGroup.position.z = -0.38 - f * 0.35;
      middleFrameGroup.rotation.y = f * 0.34 - hoverIntensity * 0.1;
      middleFrameGroup.rotation.z = f * 0.08;

      innerSanctumGroup.position.z = -1.15 - f * 0.65;
      innerSanctumGroup.rotation.y = -f * 0.22;

      // 2. Hinged Wing Planes unfold outward to expose the inner sanctum
      leftFoldWing.rotation.y = -f * 0.58 - hoverIntensity * 0.18;
      leftFoldWing.position.x = -1.45 - f * 0.35;

      rightFoldWing.rotation.y = f * 0.64 + hoverIntensity * 0.2;
      rightFoldWing.position.x = 1.45 + f * 0.35;

      // 3. Impossible Spanning Bridge shifts elevation and angle
      foldBridgeGroup.position.y =
        Math.sin(elapsed * 0.55) * 0.03 + hoverIntensity * 0.08;
      foldBridgeGroup.rotation.y = f * 0.28 + hoverIntensity * 0.12;

      // 4. Traveling light pulse along the Cobalt Seam & Amber Aperture
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.2);
      cobaltSeamMesh.position.x = 0.08 + Math.sin(elapsed * 1.4) * 0.06;

      const isWire = finishMode === 'wireframe';
      boneStoneMat.wireframe = isWire;
      charcoalConcreteMat.wireframe = isWire;
      brushedSteelMat.wireframe = isWire;
      obsidianReflectiveMat.wireframe = isWire;

      if (finishMode === 'graphite') {
        charcoalConcreteMat.color.setHex(0x484a44);
        charcoalConcreteMat.metalness = 0.64;
        charcoalConcreteMat.roughness = 0.3;
      } else {
        charcoalConcreteMat.color.setHex(0x2e302c);
        charcoalConcreteMat.metalness = 0.26;
        charcoalConcreteMat.roughness = 0.52;
      }

      cobaltSeamMat.color
        .copy(_boneColor)
        .lerp(_cobaltColor, 0.65 + cobaltIntensity * 0.35);
      cobaltSeamMat.emissiveIntensity =
        0.55 + cobaltIntensity * 0.75 + hoverIntensity * 0.5 + pulse * 0.2;

      amberApertureMat.color
        .copy(_boneColor)
        .lerp(_amberColor, 0.65 + amberIntensity * 0.35);
      amberApertureMat.emissiveIntensity =
        0.5 + amberIntensity * 0.8 + hoverIntensity * 0.35;

      // Subtle breathing scale on the deep amber aperture slit
      amberSlitMesh.scale.x = 1.0 + f * 1.4 + hoverIntensity * 0.8;

      cobaltEdgeMat.color
        .copy(_softWhiteColor)
        .lerp(_cobaltColor, Math.min(1, cobaltIntensity + hoverIntensity * 0.4));
      cobaltEdgeMat.opacity = Math.min(
        1,
        0.72 + cobaltIntensity * 0.28 + wireframeMix * 0.2
      );

      boneEdgeMat.opacity = Math.min(
        1,
        0.76 + wireframeMix * 0.24 + hoverIntensity * 0.18
      );
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

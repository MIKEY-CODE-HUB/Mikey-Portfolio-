import * as THREE from 'three';

export interface ProceduralTextureSet {
  bumpTexture: THREE.CanvasTexture;
  gridTexture: THREE.CanvasTexture;
  contactShadowTexture: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(renderer: THREE.WebGLRenderer): ProceduralTextureSet {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;

  // 1. Tileable architectural brushed concrete & graphite micro-relief bump/roughness map
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 2) {
      const streak = 118 + ((y * 17) % 24);
      bCtx.fillStyle = `rgb(${streak}, ${streak}, ${streak})`;
      bCtx.fillRect(0, y, 256, 1);
    }
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % 256;
      const y = (i * 139) % 256;
      const val = 100 + (i % 55);
      bCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      bCtx.fillRect(x, y, 2, 2);
    }
  }
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(4, 4);
  bumpTexture.anisotropy = maxAnisotropy;

  // 2. Architectural coordinate grid texture (sRGB albedo)
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 512;
  gridCanvas.height = 512;
  const gCtx = gridCanvas.getContext('2d');
  if (gCtx) {
    gCtx.fillStyle = '#111210';
    gCtx.fillRect(0, 0, 512, 512);
    gCtx.strokeStyle = '#252623';
    gCtx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 64) {
      gCtx.beginPath();
      gCtx.moveTo(i, 0);
      gCtx.lineTo(i, 512);
      gCtx.stroke();
      gCtx.beginPath();
      gCtx.moveTo(0, i);
      gCtx.lineTo(512, i);
      gCtx.stroke();
    }
    gCtx.strokeStyle = '#3A3B37';
    gCtx.lineWidth = 1.5;
    gCtx.strokeRect(0, 0, 512, 512);
    // Subtle coordinate crosshairs
    gCtx.fillStyle = '#888983';
    gCtx.fillRect(254, 248, 4, 16);
    gCtx.fillRect(248, 254, 16, 4);
  }
  const gridTexture = new THREE.CanvasTexture(gridCanvas);
  gridTexture.colorSpace = THREE.SRGBColorSpace;
  gridTexture.wrapS = THREE.RepeatWrapping;
  gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.repeat.set(18, 18);
  gridTexture.anisotropy = maxAnisotropy;

  // 3. Soft radial contact shadow texture
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(6, 7, 6, 0.78)');
    grad.addColorStop(0.5, 'rgba(10, 11, 10, 0.35)');
    grad.addColorStop(1, 'rgba(17, 18, 16, 0.0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);
  }
  const contactShadowTexture = new THREE.CanvasTexture(shadowCanvas);
  contactShadowTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    bumpTexture,
    gridTexture,
    contactShadowTexture,
    dispose: () => {
      bumpTexture.dispose();
      gridTexture.dispose();
      contactShadowTexture.dispose();
    },
  };
}

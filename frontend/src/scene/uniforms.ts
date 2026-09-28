import * as THREE from 'three'

export type SceneUniforms = {
  time: { value: number }
  mouse: { value: THREE.Vector2 }
  resolution: { value: THREE.Vector2 }
  bgColor: { value: THREE.Color }
  colorCyan: { value: THREE.Color }
  colorPurple: { value: THREE.Color }
  colorBlue: { value: THREE.Color }
  colorPeach: { value: THREE.Color }
  colorHotPink: { value: THREE.Color }
  edgeBlurAmount: { value: number }
  uRevealProgress: { value: number }
  uRevealOrigin: { value: THREE.Vector2 }
}

export function createUniforms(
  width: number,
  height: number,
): SceneUniforms {
  return {
    time: { value: 0 },
    mouse: { value: new THREE.Vector2(0.5, 0.5) },
    resolution: { value: new THREE.Vector2(width, height) },
    bgColor: { value: new THREE.Color(0xf6fafe) },
    colorCyan: { value: new THREE.Color(0x00aaff) },
    colorPurple: { value: new THREE.Color(0x8000ff) },
    colorBlue: { value: new THREE.Color(0x0091ff) },
    colorPeach: { value: new THREE.Color(0xff0000) },
    colorHotPink: { value: new THREE.Color(0xff0099) },
    edgeBlurAmount: { value: 0.5 },
    uRevealProgress: { value: 1 },
    uRevealOrigin: { value: new THREE.Vector2(0.72, 0.45) },
  }
}

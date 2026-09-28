import * as THREE from 'three'
import type { SceneUniforms } from './uniforms'

/** Clarix holographic ASCII shell applied via onBeforeCompile. */
export function applyHolographicShader(
  material: THREE.MeshPhysicalMaterial,
  uniforms: SceneUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = uniforms.time
    shader.uniforms.colorCyan = uniforms.colorCyan
    shader.uniforms.colorPurple = uniforms.colorPurple
    shader.uniforms.colorBlue = uniforms.colorBlue
    shader.uniforms.colorPeach = uniforms.colorPeach
    shader.uniforms.colorHotPink = uniforms.colorHotPink
    shader.uniforms.edgeBlurAmount = uniforms.edgeBlurAmount
    shader.uniforms.uRevealProgress = uniforms.uRevealProgress
    shader.uniforms.uRevealOrigin = uniforms.uRevealOrigin
    shader.uniforms.resolution = uniforms.resolution

    shader.vertexShader = `
      varying vec3 vLocalPosition;
    ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
       #ifdef USE_INSTANCING
         vLocalPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
       #else
         vLocalPosition = position;
       #endif
      `,
    )

    shader.fragmentShader = `
      uniform float time;
      uniform float edgeBlurAmount;
      uniform float uRevealProgress;
      uniform vec2 uRevealOrigin;
      uniform vec2 resolution;
      uniform vec3 colorCyan;
      uniform vec3 colorPurple;
      uniform vec3 colorBlue;
      uniform vec3 colorPeach;
      uniform vec3 colorHotPink;
      varying vec3 vLocalPosition;
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
       vec3 vDir = normalize(vViewPosition);
       float fresnel = 1.0 - max(dot(vDir, normal), 0.0);
       float fresnelPow = pow(fresnel, 2.0);

       float wave1 = sin(vLocalPosition.x * 2.0 - time * 1.0);
       float wave2 = cos(vLocalPosition.y * 1.5 + time * 0.8);
       float wave3 = sin(vLocalPosition.z * 2.5 + time * 0.5);
       float combinedWave = (wave1 + wave2 + wave3) / 3.0;
       combinedWave = smoothstep(-0.5, 0.5, combinedWave);

       float wavePeachRaw = sin(vLocalPosition.y * 2.0 - vLocalPosition.x * 1.0 + time * 1.2);
       float wavePeach = wavePeachRaw * 0.5 + 0.5;

       vec3 mixColor = mix(colorBlue, colorCyan, combinedWave);
       vec3 pinkTransition = mix(mixColor, colorHotPink, smoothstep(0.2, 0.8, wavePeach));
       mixColor = mix(pinkTransition, colorPeach, smoothstep(0.5, 0.95, wavePeach));
       mixColor = mix(mixColor, colorPurple, fresnel);

       vec3 glow = colorCyan * fresnelPow * 1.5;

       float distortion = sin(vLocalPosition.x * 2.5 + time * 0.5) * 0.4
         + cos(vLocalPosition.z * 2.0) * 0.4;
       float curvedY = vLocalPosition.y + distortion;
       float lines = fract((curvedY - time * 0.2) * 1.2);
       float lineIntensity = smoothstep(0.2, 0.6, lines) * smoothstep(1.0, 0.6, lines);
       vec3 lineGlow = vec3(0.2, 0.8, 1.0) * lineIntensity * (0.3 + fresnel * 1.0);

       vec3 finalEmission = mixColor * 0.6 + glow + lineGlow;

       float pixelSize = 8.0;
       vec2 localUv = fract(gl_FragCoord.xy / pixelSize) - 0.5;
       float luma = dot(finalEmission, vec3(0.2126, 0.7152, 0.0722));
       float currentSize = clamp(luma * 1.2, 0.05, 0.45);
       float currentRadius = mix(0.0, currentSize, wavePeach);
       float d = length(max(abs(localUv) - (currentSize - currentRadius), 0.0)) - currentRadius;
       float shapeAlpha = smoothstep(1.5 / pixelSize, 0.0, d);

       if (shapeAlpha < 0.1) discard;

       float edgeStart = mix(1.0, 0.7, edgeBlurAmount);
       float edgeEnd = mix(0.99, 0.1, edgeBlurAmount);
       float edgeBlur = smoothstep(edgeStart, edgeEnd, fresnel);

       finalEmission *= 1.2;

       if (uRevealProgress < 0.999) {
         vec2 screenUv = gl_FragCoord.xy / resolution.xy;
         screenUv.x *= resolution.x / resolution.y;
         float distFromCenter2D = distance(screenUv, uRevealOrigin);
         float currentRadius2D = uRevealProgress * 3.0;
         float gridRandom = fract(
           sin(dot(floor(gl_FragCoord.xy / 8.0), vec2(12.9898, 78.233))) * 43758.5453
         );
         float noisyRadius2D = currentRadius2D - gridRandom * 0.15 * (1.0 - uRevealProgress);
         if (distFromCenter2D > noisyRadius2D) discard;
         float revealEdge = smoothstep(noisyRadius2D - 0.05, noisyRadius2D, distFromCenter2D);
         vec3 revealGlow = colorHotPink * revealEdge * 3.0 + colorCyan * pow(revealEdge, 4.0) * 8.0;
         finalEmission += revealGlow;
       }

       gl_FragColor = vec4(
         gl_FragColor.rgb + finalEmission,
         gl_FragColor.a * shapeAlpha * edgeBlur
       );
      `,
    )
  }

  material.needsUpdate = true
}

export function createRobotMaterial(uniforms: SceneUniforms): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x010103,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  })
  applyHolographicShader(material, uniforms)
  return material
}

import * as THREE from 'three'
import type { SceneUniforms } from './uniforms'

/** Soft animated ASCII-grid background extracted from Clarix. */
export function createBackgroundMesh(uniforms: SceneUniforms): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: uniforms.time,
      mouse: uniforms.mouse,
      bgColor: uniforms.bgColor,
      resolution: uniforms.resolution,
      colorCyan: uniforms.colorCyan,
      colorBlue: uniforms.colorBlue,
      colorHotPink: uniforms.colorHotPink,
      colorPeach: uniforms.colorPeach,
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 1.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 mouse;
      uniform vec3 bgColor;
      uniform vec2 resolution;
      uniform vec3 colorCyan;
      uniform vec3 colorBlue;
      uniform vec3 colorHotPink;
      uniform vec3 colorPeach;
      varying vec2 vUv;

      mat2 rotate2d(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }

      void main() {
        float pixelSize = 15.0;
        vec2 screenUv = vUv;
        float aspect = resolution.x / resolution.y;
        vec2 aspectUv = vec2(screenUv.x * aspect, screenUv.y);

        vec2 gridUv = aspectUv * (resolution.y / pixelSize);
        vec2 localUv = fract(gridUv) - 0.5;

        float wave1 = sin(aspectUv.x * 4.0 - time * 0.8);
        float wave2 = cos(aspectUv.y * 3.0 + time * 0.6);
        float combinedWave = smoothstep(-0.8, 0.8, (wave1 + wave2) * 0.5);
        float wavePeach = sin(aspectUv.y * 3.0 - aspectUv.x * 2.0 + time * 0.9) * 0.5 + 0.5;

        vec3 mixColor = mix(colorBlue, colorCyan, combinedWave);
        vec3 pinkTransition = mix(mixColor, colorHotPink, smoothstep(0.1, 0.7, wavePeach));
        mixColor = mix(pinkTransition, colorPeach, smoothstep(0.5, 1.0, wavePeach));
        vec3 lightGridColor = mix(mixColor, vec3(1.0), 0.6);

        float boxSize = 0.3 + sin(time * 2.0 + gridUv.x * 0.2 + gridUv.y * 0.2) * 0.1;
        float radius = 0.12;
        float d = length(max(abs(localUv) - (boxSize - radius), 0.0)) - radius;
        float alpha = smoothstep(0.05, 0.0, d);

        vec2 radialCenter = mix(vec2(0.5, 0.5), mouse, 0.3);
        float radialMask = smoothstep(0.7, 0.1, distance(screenUv, radialCenter));

        vec2 p = aspectUv * 3.0;
        vec2 mouseAspect = vec2(mouse.x * aspect, mouse.y);
        float mouseDist = distance(aspectUv, mouseAspect);

        float noise = 0.0;
        noise += sin(p.x + time * 0.4) * sin(p.y + time * 0.3);
        p *= rotate2d(1.1);
        noise += sin(p.x * 1.5 - time * 0.5) * sin(p.y * 1.5 + time * 0.2);
        p *= rotate2d(2.3);
        noise += sin(p.x * 2.0 + time * 0.3) * sin(p.y * 2.0 - time * 0.4);
        noise += cos(mouseDist * 12.0 - time * 3.0) * smoothstep(0.6, 0.0, mouseDist) * 1.2;

        float blobMask = smoothstep(0.0, 1.5, noise);
        float cursorHighlight = smoothstep(0.2, 0.0, mouseDist);
        float finalMask = clamp((radialMask * blobMask) + (cursorHighlight * 0.5), 0.0, 1.0);
        float finalAlpha = alpha * finalMask * 0.85;

        vec3 finalColor = mix(bgColor, lightGridColor, finalAlpha);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = -1
  mesh.frustumCulled = false
  return mesh
}

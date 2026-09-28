import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { createBackgroundMesh } from './background'
import { createRobotMaterial } from './holographicMaterial'
import { createUniforms, type SceneUniforms } from './uniforms'

export type LangCleanSceneHandle = {
  dispose: () => void
}

/**
 * Minimal Clarix-derived scene: animated light background + holographic robot on the right.
 * Tuned to match mocks/11-a-escolhido.png (robot occupying the right third).
 */
export function mountLangCleanScene(container: HTMLElement): LangCleanSceneHandle {
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight

  const uniforms = createUniforms(width, height)
  const targetMouse = new THREE.Vector2(0.5, 0.5)
  const clock = new THREE.Clock()

  const bgScene = new THREE.Scene()
  bgScene.background = new THREE.Color(0xf6fafe)
  bgScene.add(createBackgroundMesh(uniforms))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  // Hero framing from Clarix — model appears on the right of the viewport.
  camera.position.set(-1.8, -1.0, 6.5)
  camera.lookAt(-1.8, 0.5, 0)

  const rendererBg = new THREE.WebGLRenderer({ antialias: true })
  rendererBg.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  rendererBg.setSize(width, height)
  Object.assign(rendererBg.domElement.style, {
    position: 'absolute',
    inset: '0',
    zIndex: '0',
    pointerEvents: 'none',
  } as CSSStyleDeclaration)
  container.appendChild(rendererBg.domElement)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    zIndex: '1',
    pointerEvents: 'none',
  } as CSSStyleDeclaration)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 1))
  const key = new THREE.DirectionalLight(0xffffff, 2)
  key.position.set(5, 10, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 1)
  fill.position.set(-5, -5, -5)
  scene.add(fill)

  let model: THREE.Object3D | null = null
  let mixer: THREE.AnimationMixer | null = null
  let raf = 0
  let disposed = false

  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  loader.load(
    '/model.glb',
    (gltf) => {
      if (disposed) return
      model = gltf.scene

      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      // Keep the robot clearly smaller than the first T-pose framing.
      if (maxDim > 0) {
        model.scale.setScalar(2.95 / maxDim)
      }

      const boxScaled = new THREE.Box3().setFromObject(model)
      model.position.sub(boxScaled.getCenter(new THREE.Vector3()))

      model.position.set(0.35, -1.95, 4.1)
      model.rotation.set(-0.04, -0.9, -0.1)

      const materialFactory = () => createRobotMaterial(uniforms)
      model.traverse((child) => {
        const mesh = child as THREE.SkinnedMesh
        if (!mesh.isMesh) return
        // One material instance per mesh keeps skinning compile params correct.
        mesh.material = materialFactory()
        mesh.frustumCulled = false
      })

      // Without clips the bind pose is a T-pose — Clarix plays these every frame.
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model)
        for (const clip of gltf.animations) {
          const action = mixer.clipAction(clip)
          action.enabled = true
          action.setEffectiveWeight(1)
          action.play()
        }
      }

      scene.add(model)
      uniforms.uRevealProgress.value = 1

      if (import.meta.env.DEV) {
        Object.assign(window, {
          __langcleanModel: model,
          __langcleanMixer: mixer,
          __langcleanAnims: gltf.animations.map((c) => ({
            name: c.name,
            duration: c.duration,
            tracks: c.tracks.length,
          })),
        })
      }
    },
    undefined,
    (error) => {
      console.error('Failed to load robot model', error)
    },
  )

  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    targetMouse.set(
      (event.clientX - rect.left) / rect.width,
      1 - (event.clientY - rect.top) / rect.height,
    )
  }

  const onResize = () => {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    rendererBg.setSize(w, h)
    renderer.setSize(w, h)
    uniforms.resolution.value.set(w, h)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('resize', onResize)

  const animate = () => {
    raf = requestAnimationFrame(animate)
    const delta = clock.getDelta()
    uniforms.time.value += delta
    uniforms.mouse.value.lerp(targetMouse, delta * 3)
    mixer?.update(delta)

    if (uniforms.uRevealProgress.value < 1) {
      uniforms.uRevealProgress.value = Math.min(1, uniforms.uRevealProgress.value + delta * 0.55)
    }

    rendererBg.render(bgScene, camera)
    renderer.render(scene, camera)
  }
  animate()

  return {
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      draco.dispose()
      rendererBg.dispose()
      renderer.dispose()
      rendererBg.domElement.remove()
      renderer.domElement.remove()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const mat = mesh.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat?.dispose()
        }
      })
      bgScene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const mat = mesh.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat?.dispose()
        }
      })
    },
  }
}

export type { SceneUniforms }

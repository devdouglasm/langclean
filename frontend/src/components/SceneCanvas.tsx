import { useEffect, useRef } from 'react'
import { mountLangCleanScene } from '../scene/mountScene'

export function SceneCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const scene = mountLangCleanScene(host)
    return () => scene.dispose()
  }, [])

  return <div className="scene-canvas" ref={hostRef} aria-hidden="true" />
}

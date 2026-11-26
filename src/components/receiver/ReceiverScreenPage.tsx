import { useEffect, useRef } from 'react'
import { useLang } from '../../contexts/LangContext'

/** MD1T / screen receiver — vendor Final DEMO (device UI unchanged) in TeevoLink chrome. */
export default function ReceiverScreenPage() {
  const { lang } = useLang()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const src = `/xd10/interactive-demo.html?chrome=teevolink&embed=1&lang=${lang}&v=3`

  useEffect(() => {
    const el = iframeRef.current
    if (!el?.contentWindow) return
    const post = () => {
      el.contentWindow?.postMessage({ type: 'teevolink-lang', lang }, '*')
    }
    post()
    el.addEventListener('load', post)
    return () => el.removeEventListener('load', post)
  }, [lang, src])

  return (
    <iframe
      ref={iframeRef}
      key={src}
      title="Receiver screen configuration"
      src={src}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        border: 'none',
        display: 'block',
        background: 'var(--bg3)',
      }}
    />
  )
}
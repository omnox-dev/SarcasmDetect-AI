import { useContext, useEffect } from 'react'
import { ModeContext } from '../context/ModeContext'

export default function ModeTheme() {
  const { mode } = useContext(ModeContext)

  useEffect(() => {
    if (mode === 'social_media') {
      document.body.classList.add('social-media-mode')
    } else {
      document.body.classList.remove('social-media-mode')
    }
  }, [mode])

  return null // This component doesn't render anything
}

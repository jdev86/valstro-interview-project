import { useEffect, useState } from 'react'

export default () => {
  const [appTheme, setAppTheme] = useState('light')

  const toggleTheme = (theme: string) => {
      setAppTheme(theme)
  }

  useEffect(() => {
    const localAppTheme = localStorage.getItem('app-theme')
    if (!localAppTheme) {
        localStorage.setItem('app-theme', 'dark')
    } else {
        setAppTheme(localAppTheme)
    }
  }, [])

  return {
    appTheme,
    toggleTheme,
  }
}
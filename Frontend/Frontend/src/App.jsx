import { useEffect, useState } from 'react'
import "leaflet/dist/leaflet.css";
import LandingPage from './components/LandingPage'
import MapView from './components/MapView'

function App() {
  const [activeScreen, setActiveScreen] = useState("landing")
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false

    const storedTheme = window.localStorage.getItem("women-safety-theme")
    if (storedTheme === "dark") return true
    if (storedTheme === "light") return false

    return false
  })

  useEffect(() => {
    window.localStorage.setItem("women-safety-theme", isDarkMode ? "dark" : "light")
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light"
    document.body.style.backgroundColor = isDarkMode ? "#030303" : "#f8fafc"
  }, [isDarkMode])

  return (
    activeScreen === "map" ? (
      <MapView
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
      />
    ) : (
      <LandingPage
        isDarkMode={isDarkMode}
        onOpenMap={() => setActiveScreen("map")}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
      />
    )
  )
}

export default App

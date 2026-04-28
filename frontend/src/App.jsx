import { useState, useEffect, cloneElement } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Homepage from "./pages/Homepage"
import projects from './Projects'
import DarkModeHeader from './components/DarkModeHeader'
import Footer from './components/Footer'

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true")

  function handleDarkMode(){
    setDarkMode((prevState) => !prevState)
  }

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode))
  }, [darkMode])

  const projectsWithDarkMode = projects.map(project => ({
    ...project, 
    page: cloneElement(project.page, {isDarkMode: darkMode})
   }))

  const projectRoutes = projectsWithDarkMode.map(project => (
    <Route path={project.path} element={project.page} key={project.key} />
  ))
  
  return (
    <div className={`absolute w-full ${darkMode ? "bg-zinc-900 text-white" : ""}`}>
      <Router>
        <DarkModeHeader onDarkMode={handleDarkMode} isDarkMode={darkMode}/>
        <Routes>
          <Route path="/" element={<Homepage isDarkMode={darkMode} />} />
          {projectRoutes}
        </Routes>
        <Footer isDarkMode={darkMode} />
      </Router>
    </div>

  );
}

export default App;
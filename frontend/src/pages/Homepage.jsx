import { Link } from "react-router-dom"
import PageTitles from '../components/PageTitles'
import projects from '../Projects'

export default function Homepage(props) {
  const projectsHTML = projects.map(project => (
    <div className={`2xl:mt-20 lg:mt-10 sm:mt-10 mt-10 mx-auto 2xl:h-56 lg:h-44 sm:h-52 h-32 2xl:w-1/2 sm:w-3/4 w-5/6 flex items-center justify-center rounded-xl shadow-[0_2px_10px_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_15px_0_rgba(0,0,0,0.3)] ${props.isDarkMode? "shadow-blue-500 hover:shadow-blue-500" : ""} ${project.key % 2 == 1 ? "flex-row-reverse" : ""}`} key={project.key}>
      <div className='w-2/3 h-full'>
        <h1 className='2xl:mt-6 lg:mt-4 sm:mt-4 mt-2 h-1/6 sm:text-lg text-xs font-semibold font-Montserrat'>{project.name}</h1>
        <p className='sm:mt-4 mt-2 mx-1 h-2/6 sm:text-base text-xs font-Open_Sans'>{project.description}</p>
        <div className='2xl:mt-1 sm:mt-1 mt-3 mx-auto sm:w-36 w-24 rounded-xl outline sm:outline-offset-8 outline-offset-4 outline-1 outline-gray-600 hover:outline-2 hover:outline-blue-500 hover:cursor-pointer'>
          <Link to={project.path}><h2 className='sm:text-lg text-sm font-Montserrat'>View Project</h2></Link>
        </div>
      </div>
      <div className='w-1/3 h-full'>
        <img src={project.image} className={`h-full w-full ${project.key % 2 == 1 ? "rounded-s-xl" : "rounded-e-xl"}`} alt='machine learning' />
      </div>
    </div>
  ))

  return (
    <>
      <PageTitles />
      <div className='2xl:mt-20 lg:mt-10 sm:mt-10 mt-10 text-center'>
        {projectsHTML}
      </div>
    </>
  )
}
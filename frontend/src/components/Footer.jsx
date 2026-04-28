import github_black from "../assets/images/github-logo-black.svg"
import github_white from "../assets/images/github-logo-white.svg"
import linkedin_black from "../assets/images/linkedin-logo-black.svg"
import linkedin_white from "../assets/images/linkedin-logo-white.svg"

export default function Footer(props){
    return (
        <footer className={`flex items-center justify-center sm:space-x-8 space-x-2 2xl:mt-20 lg:mt-8 sm:mt-10 mt-10 2xl:h-28 lg:h-16 sm:h-16 h-16 border-t-2 border-solid ${props.isDarkMode ? "border-slate-700" : ""}`}>
            <h1 className="sm:text-base text-xs">© 2024 Dospinescu Daniel</h1>
            <a href="https://github.com/dospix" target="_blank"><img src={props.isDarkMode ? github_white : github_black} className="sm:w-16 w-11 sm:h-16 h-11" alt="github link"/></a>
            <a href="https://www.linkedin.com/in/daniel-dospinescu-ba7285239/" target="_blank"><img src={props.isDarkMode ? linkedin_white : linkedin_black} className="sm:w-10 w-7 sm:h-10 h-7" alt="linkedin link"/></a>
        </footer>
    )
}
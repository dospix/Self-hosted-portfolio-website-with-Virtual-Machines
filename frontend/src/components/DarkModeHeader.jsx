import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import sun_blue from "../assets/images/sun-blue.png"
import sun_gray from "../assets/images/sun-gray.png"
import moon_blue from "../assets/images/moon-blue.png"
import moon_gray from "../assets/images/moon-gray.png"
import back_arrow_black from "../assets/images/back-arrow-black.svg"
import back_arrow_white from "../assets/images/back-arrow-white.svg"
import back_arrow_blue from "../assets/images/back-arrow-blue.svg"

export default function DarkModeHeader(props){
    let location = useLocation()
    const [backArrowImage, setBackArrowImage] = useState(props.isDarkMode ? back_arrow_white : back_arrow_black)

    function HandleBackArrowImage(isHoveredOn){
        if (isHoveredOn) 
            setBackArrowImage(back_arrow_blue)
        else 
            setBackArrowImage(props.isDarkMode ?  back_arrow_white : back_arrow_black)
    }

    useEffect(() => {
        HandleBackArrowImage(false)
      }, [props.isDarkMode, location])
    
    return (
        <div className="flex items-center 2xl:mt-12 sm:mt-6 mt-6">
            {/*Hide the back arrow on the homepage*/}
            <div className={`2xl:ml-40 lg:ml-16 md:ml-7 sm:ml-5 ml-3  ${window.location.pathname == "/" ? "hidden" : ""}`}>
                <Link to=".."><img src={backArrowImage} onMouseOver={() => HandleBackArrowImage(true)} onMouseLeave={() => HandleBackArrowImage(false)} className="h-11 w-11" /></Link>
            </div>
            <div className="flex ml-auto 2xl:mr-40 lg:mr-20 sm:mr-5 mr-3 sm:w-40 w-fit">
                <img src={props.isDarkMode ? sun_gray : sun_blue} className="sm:h-8 h-7 sm:w-8 w-7" alt="sun" />
                <div onClick={props.onDarkMode} className="my-auto mx-2 sm:w-16 w-11 sm:h-5 h-4 bg-gray-400 rounded-3xl hover:cursor-pointer">
                    <div className={`sm:h-5 h-4 sm:w-5 w-4 bg-gray-700 rounded-full ${props.isDarkMode ? "ml-auto" : ""}`}></div>
                </div>
                <img src={props.isDarkMode ? moon_blue : moon_gray} className="sm:h-8 h-7 sm:w-8 w-7" alt="moon" />
            </div>
        </div>
    )
}
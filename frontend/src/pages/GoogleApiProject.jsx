import { useState, useEffect } from "react"
import star from "../assets/images/star.png"
import half_star from "../assets/images/half-star.png"
import no_cover_image from "../assets/images/no-cover-image.png"
import open_book from "../assets/images/open-book.png"
import open_book_white from "../assets/images/open-book-white.png"

const BOOK_SUBJECTS_INSIDE_FORM = ["literature", "adventure", "history", "science", "self-help", "business", "health", "education"]

// Returns an object with all of the subjects and whether they are checked or not, and the HTML for the checkboxes with the subjects that will be displayed on the page
function handleBookSubjects(formData, handleFormChange){
  let bookSubjectsObject = {}
  if(sessionStorage.getItem("bookProjectFormData") !== null)
    bookSubjectsObject = JSON.parse(sessionStorage.getItem("bookProjectFormData")).subjects
  else
    BOOK_SUBJECTS_INSIDE_FORM.forEach(subject => bookSubjectsObject[subject] = false)
  
  const bookSubjectsHtmlElements = BOOK_SUBJECTS_INSIDE_FORM.map(subject => (
    <div className="mt-6 flex items-center" key={subject}>
      <input
        type="checkbox"
        className="w-4 h-4"
        id={subject}
        name={subject}
        checked={formData[subject]}
        onChange={handleFormChange}
      />
      <label className="pb-1 pl-3 select-none md:text-3xl text-2xl" htmlFor={subject}>{subject}</label>
    </div>
  ))

  return [bookSubjectsObject, bookSubjectsHtmlElements]
}

function shortenStringWithoutCuttingWords(string, preferredSize){
  if(string && string.length > preferredSize){
    let whiteSpaceIndex = preferredSize
    while(string[whiteSpaceIndex].trim() != "")
        whiteSpaceIndex -= 1
    string = string.slice(0, whiteSpaceIndex) + "..."
  }

  return string
}

function convertBookObjectToHtml(book){
  let bookData = book.volumeInfo

  bookData.description = shortenStringWithoutCuttingWords(bookData.description, 250)

  bookData.authors = bookData.authors ? bookData.authors.slice(0, 2).join(", ") : "authors not found"

  const stars = []
  if(bookData.averageRating){
      // round to nearest multiple of 0.5
      bookData.averageRating = Math.round(bookData.averageRating * 2) / 2

      let needsHalfStar = bookData.averageRating % 1 == 0.5
      let starCount = Math.floor(bookData.averageRating)
      
      while(starCount){
          stars.push(<img key={starCount} className="mb-3 mr-1 sm:w-6 w-4 sm:h-6 h-4" src={star} />)
          starCount -= 1
      }
      if(needsHalfStar)
          stars.push(<img key={0.5} className="mb-3 sm:w-4 w-2 sm:h-6 h-4" src={half_star} />)
  }

  let previewButton = null
  switch(book.accessInfo.viewability){
      case "ALL_PAGES":
          previewButton = <a className="sm:w-28 w-20 py-1 mx-auto block rounded-2xl bg-blue-500 sm:text-base text-sm text-white" href={bookData.previewLink} target="_blank">View Book</a>
          break
      case "PARTIAL":
          previewButton = <a className="sm:w-32 w-24 py-1 mx-auto block rounded-2xl bg-blue-500 sm:text-base text-sm text-white" href={bookData.previewLink} target="_blank">View Preview</a>
          break
      // The remaining value shold be "NO_PAGES"
      default:
          previewButton = <div className="sm:w-28 w-20 py-1 mx-auto block rounded-2xl bg-slate-400 sm:text-base text-sm text-white">No Preview available</div>
  }
  
  return (
      <div className="lg:mx-48 sm:mx-20 mx-2 my-10 flex" key={book.id}>
          <img className="sm:w-1/6 w-1/4 sm:h-auto h-1/3 self-center" src={bookData.imageLinks ? bookData.imageLinks.thumbnail.replace("http", "https") : no_cover_image} alt="book cover" />
          <div className="w-full px-5">
              <h1 className="mb-4 sm:text-2xl text-xl">{bookData.title}</h1>
              <h2 className="mb-4 sm:text-xl text-lg">{bookData.subtitle}</h2>
              <p className="font-Open_Sans sm:text-base text-sm">{bookData.description}</p>
          </div>
          <div className="sm:w-1/5 w-1/3 self-center text-center">
              <h1 className="mb-3 sm:text-xl text-lg">{bookData.authors}</h1>
              <div className="flex justify-center">
                  {stars}
              </div>
              <p className="mb-3">{bookData.ratingsCount ? bookData.ratingsCount + " reviews" : "no reviews"}</p>
              {previewButton}
          </div>
      </div>
  )
}

export default function GoogleApiProject(props) {
  const initialBookSubjects = {}
  BOOK_SUBJECTS_INSIDE_FORM.forEach(subject => initialBookSubjects[subject] = false)
  const [formData, setFormData] = useState(sessionStorage.getItem("bookProjectFormData") !== null ? JSON.parse(sessionStorage.getItem("bookProjectFormData")) : {
    titleKeywords: "",
    authorKeywords: "",
    previewFilter: "none",
    ...initialBookSubjects
  })

  function handleFormChange(event) {
    const {name, value, type, checked} = event.target

    setFormData(prevFormData => ({
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value
      }))
  }

  useEffect(() => {
    sessionStorage.setItem("bookProjectFormData", JSON.stringify(formData))
  }, [formData])
  
  const [bookSubjectsObject, bookSubjectsHtmlElements] = handleBookSubjects(formData, handleFormChange)
  useEffect(() => {
    setFormData(prevFormData => ({ ...prevFormData, ...bookSubjectsObject }));
  }, [])

  const [booksDisplayed, setBooksDisplayed] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  function handleFormSubmit(event) {
    event.preventDefault()

    setIsLoading(true)
    setBooksDisplayed([])
    
    fetch("/google-api-project/submit", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then(response => response.json())
      .then(data => setBooksDisplayed(data.length ? data.map(book => convertBookObjectToHtml(book)) 
                                      : <h1 className="w-fit mx-auto mb-40 text-3xl font-Montserrat text-red-400 select-none">No books found! Try to remove some keywords/subjects.</h1>))
      .then(() => setIsLoading(false))
      .catch(error => {
        console.error('Error:', error);
      })
  }
    
  return (
  <>
    <div className='lg:mt-20 md:mt-16 sm:mt-14 mt-12 mx-2 text-center'>
      <h1 className='md:text-3xl text-2xl font-semibold font-Montserrat'>Book Recommendations Using Google Books API</h1>
    </div>

    <div className='mt-12 2xl:mx-80 xl:mx-44 lg:mx-16 md:mx-10 mx-5 md:text-2xl sm:text-xl text-lg font-Open_Sans'>
      <p className="lg:inline">The data from the form below is sent to the Flask server, which makes the request to the Google Books API. </p>
      <p className="lg:inline lg:mt-1 md:mt-3 mt-5">A random sample of books is taken from the results, which is ordered by the number of ratings and then returned to the client side for rendering. </p>
      <p className="lg:inline lg:mt-1 md:mt-3 mt-5">To prevent form values from being accidentally erased they are saved in sessionStorage as they are inputed.</p>
    </div>

    <div className='lg:mt-20 md:mt-16 sm:mt-14 mt-10 mx-2 flex items-center justify-center text-center'>
      <h1 className="md:text-3xl text-2xl font-Montserrat">What type of book would you like us to recommend?</h1>
    </div>

    <form onSubmit={handleFormSubmit} className="mx-auto sm:mt-8 mt-10 lg:mb-28 mb-20 xl:w-1/2 lg:w-2/3 w-5/6 flex justify-center flex-col font-Open_Sans">
      <label className="p-2 md:text-3xl text-2xl" htmlFor="titleKeywords">Title keywords:</label>
      <input 
        type="text"
        className="ml-2 mb-6 p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-md text-black"
        placeholder='E.g. Alice Wonderland, can be blank'
        id="titleKeywords"
        name="titleKeywords"
        value={formData.titleKeywords}
        onChange={handleFormChange}
        maxLength="100"
      />

      <label className="p-2 md:text-3xl text-2xl" htmlFor="authorKeywords">Author keywords:</label>
      <input 
        type="text"
        className="ml-2 mb-6 p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-md text-black"
        placeholder='E.g. Lewis Carroll, can be blank'
        id="authorKeywords"
        name="authorKeywords"
        value={formData.authorKeywords}
        onChange={handleFormChange}
        maxLength="100"
      />

      <label className="p-2 md:text-3xl text-2xl" htmlFor="previewFilter">Preview filter:</label>
      <select 
        className="ml-2 mb-10 p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-lg text-black"
        id="previewFilter"
        name="previewFilter"
        value={formData.previewFilter}
        onChange={handleFormChange}
      >
        <option className="text-center md:text-2xl sm:text-xl text-lg" value="none">no filter</option>
        <option className="text-center md:text-2xl sm:text-xl text-lg" value="partial">part of the book must be previewable</option>
        <option className="text-center md:text-2xl sm:text-xl text-lg" value="full">the entire book must be previewable</option>
      </select>

      <h1 className="ml-2 md:text-3xl text-2xl">Book subjects:</h1>
      <div className="h-fit ml-2 mb-6 grid sm:grid-cols-3 grid-cols-2">
        {bookSubjectsHtmlElements}
      </div>

      <button className="w-52 h-12 sm:mt-8 mt-3 self-center rounded-xl bg-blue-500 text-xl text-white">Recommend Books</button>
    </form>
    
    <div className={`${isLoading ? "" : "hidden"} mb-32 flex items-center justify-center`}>
        <h1 className="md:text-3xl text-2xl font-Montserrat">Loading books...</h1>
        <img className="w-5 ml-6 animate-spin" src={props.isDarkMode ? open_book_white : open_book} alt="loading books" />
    </div>
    

    {booksDisplayed}
  </>
  )
}
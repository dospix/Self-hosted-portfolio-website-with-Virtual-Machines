import { useState, useEffect } from "react"
import carManufacturerToModelMap from "../CarManufacturerToModel.json"
import residuals_plot_black from "../assets/images/residuals-black.png"
import residuals_plot_white from "../assets/images/residuals-white.png"
import outliers_before_plot_black from "../assets/images/outliers-before-black.png"
import outliers_before_plot_white from "../assets/images/outliers-before-white.png"
import outliers_after_plot_black from "../assets/images/outliers-after-black.png"
import outliers_after_plot_white from "../assets/images/outliers-after-white.png"
import correlation_heatmap_black from "../assets/images/correlation-heatmap-black.png"
import correlation_heatmap_white from "../assets/images/correlation-heatmap-white.png"

export default function UsedCarsMachineLearningProject(props) {
    const [predictedCarPrice, setPredictedCarPrice] = useState(null)

    const [currFormPage, setCurrFormPage] = useState(1)
    const [invalidCarModel, setInvalidCarModel] = useState(false)
    function handleCurrFormPageChange(pageToSwitchTo){
        if(currFormPage == 1 && !carManufacturerToModelMap[formData.manufacturer].includes(formData.carModel)){
            setInvalidCarModel(true)
            return
        }
        setCurrFormPage(pageToSwitchTo)
        setInvalidCarModel(false)
    }

    const initialManufacturer = Object.keys(carManufacturerToModelMap)[0]
    const [formData, setFormData] = useState(sessionStorage.getItem("carProjectFormData") !== null ? JSON.parse(sessionStorage.getItem("carProjectFormData")) : {
        manufacturer: initialManufacturer,
        carModel: "",
        type: "unknown",
        size: "-1",
        condition: "-1",
        status: "clean",
        manufacturingYear: "2000",
        odometer: "0",
        drive: "unknown",
        transmission: "manual",
        cylinders: "-1",
        fuel: "gas"
    })

    useEffect(() => {
      sessionStorage.setItem("carProjectFormData", JSON.stringify(formData))
    }, [formData])

    function handleFormChange(event) {
        let {name, value, type, checked} = event.target
        if(["manufacturingYear", "odometer"].includes(name)){
            if(value > 10000000 || value < -10000000)
                return
            // Below are measures to prevent the condition above from being bypassed
            else if(value.length == 0)
                value = "0"
            value = String(parseInt(value))
        }
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value
            }
        ))
        if(name == "manufacturer")
            setFormData(prevFormData => ({
                ...prevFormData,
                ["carModel"]: ""
                }
            ))
    }

    function handleFormSubmit(event) {
        event.preventDefault()
    
        fetch("/used-cars-machine-learning-project/submit", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(data => setPredictedCarPrice(data["price"]))
        .catch(error => {
        console.error('Error:', error);
        })
    }

    return (
    <>
        <div className='mt-12 md:mt-20 mx-4 text-center'>
            <h1 className='text-xl md:text-3xl font-semibold font-Montserrat'>Predicting Used Car Prices Using Machine Learning & Neural Networks</h1>
        </div>

        <div className='mt-10 mx-4 flex items-center justify-center text-center'>
            <h1 className="text-xl md:text-3xl font-Montserrat">Enter some information about the car whose price you would like to predict</h1>
        </div>

        <form onSubmit={handleFormSubmit} className="mx-1 sm:mx-auto mt-14 sm:w-11/12 lg:w-5/6 2xl:2/3 font-Open_Sans">
            <div className={`${currFormPage != 1 ? "hidden" : "grid"} grid-cols-2 gap-y-8 lg:gap-y-16 gap-x-10 lg:gap-x-32`}>
                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="manufacturer">Manufacturer:</label>
                    <select 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleFormChange}
                    >
                        {Object.keys(carManufacturerToModelMap).map(manufacturer => (
                            <option className="text-center md:text-3xl text-md" key={manufacturer} value={manufacturer}>{manufacturer}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="carModel">Car model:</label>
                    <input 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md text-center md:text-3xl text-md text-black" 
                        id="carModel"
                        name="carModel"
                        type="text"
                        list="model"
                        value={formData.carModel}
                        onChange={handleFormChange} 
                    />
                    <datalist id="model">
                        {carManufacturerToModelMap[formData.manufacturer].map(model => (
                            <option className="text-center md:text-3xl text-md" key={model} value={model}>{model}</option>
                        ))}
                    </datalist>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="type">Vehicle type:</label>
                    <select 
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="unknown">unknown</option>
                        <option className="text-center md:text-3xl text-md" value="convertible">convertible</option>
                        <option className="text-center md:text-3xl text-md" value="coupe">coupe</option>
                        <option className="text-center md:text-3xl text-md" value="sedan">sedan</option>
                        <option className="text-center md:text-3xl text-md" value="truck">truck</option>
                        <option className="text-center md:text-3xl text-md" value="pickup">pickup</option>
                        <option className="text-center md:text-3xl text-md" value="offroad">offroad</option>
                        <option className="text-center md:text-3xl text-md" value="SUV">SUV</option>
                        <option className="text-center md:text-3xl text-md" value="van">van</option>
                        <option className="text-center md:text-3xl text-md" value="mini-van">mini-van</option>
                        <option className="text-center md:text-3xl text-md" value="hatchback">hatchback</option>
                        <option className="text-center md:text-3xl text-md" value="wagon">wagon</option>
                        <option className="text-center md:text-3xl text-md" value="bus">bus</option>
                        <option className="text-center md:text-3xl text-md" value="other">other</option>
                    </select>
                </div>
                
                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="size">Vehicle size:</label>
                    <select 
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="size"
                        name="size"
                        value={formData.size}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="-1">unknown</option>
                        <option className="text-center md:text-3xl text-md" value="0">sub-compact</option>
                        <option className="text-center md:text-3xl text-md" value="1">compact</option>
                        <option className="text-center md:text-3xl text-md" value="2">mid-size</option>
                        <option className="text-center md:text-3xl text-md" value="3">full-size</option>
                    </select>
                </div>
            </div>
            
            <div className={`${currFormPage != 2 ? "hidden" : "grid"} grid-cols-2 gap-y-8 lg:gap-y-16 gap-x-10 lg:gap-x-32`}>
                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="condition">Car condition:</label>
                    <select 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="-1">unknown</option>
                        <option className="text-center md:text-3xl text-md" value="0">salvage</option>
                        <option className="text-center md:text-3xl text-md" value="1">fair</option>
                        <option className="text-center md:text-3xl text-md" value="2">good</option>
                        <option className="text-center md:text-3xl text-md" value="3">excellent</option>
                        <option className="text-center md:text-3xl text-md" value="4">like new</option>
                        <option className="text-center md:text-3xl text-md" value="5">new</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="status">Vehicle status:</label>
                    <select 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="clean">clean</option>
                        <option className="text-center md:text-3xl text-md" value="salvage">salvage</option>
                        <option className="text-center md:text-3xl text-md" value="rebuilt">rebuilt</option>
                        <option className="text-center md:text-3xl text-md" value="missing">missing</option>
                        <option className="text-center md:text-3xl text-md" value="lien">lien</option>
                        <option className="text-center md:text-3xl text-md" value="parts only">parts only</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="manufacturingYear">Manufacturing year:</label>
                    <input 
                        type="number"
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md text-center md:text-3xl text-md text-black"
                        id="manufacturingYear"
                        name="manufacturingYear"
                        value={formData.manufacturingYear}
                        onChange={handleFormChange}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="odometer">Odometer (miles):</label>
                    <input 
                        type="number"
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md text-center md:text-3xl text-md text-md text-black"
                        id="odometer"
                        name="odometer"
                        value={formData.odometer}
                        onChange={handleFormChange}
                    />
                </div>
            </div>
            
            <div className={`${currFormPage != 3 ? "hidden" : "grid"} grid-cols-2 gap-y-8 lg:gap-y-16 gap-x-10 lg:gap-x-32`}>
                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="drive">Drive:</label>
                    <select 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="drive"
                        name="drive"
                        value={formData.drive}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="unknown">unknown</option>
                        <option className="text-center md:text-3xl text-md" value="4wd">four-wheel drive</option>
                        <option className="text-center md:text-3xl text-md" value="fwd">front-wheel drive</option>
                        <option className="text-center md:text-3xl text-md" value="rwd">rear-wheel drive</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="transmission">Transmission:</label>
                    <select 
                        className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="transmission"
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="manual">manual</option>
                        <option className="text-center md:text-3xl text-md" value="automatic">automatic</option>
                        <option className="text-center md:text-3xl text-md" value="other">other</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="cylinders">Nr of cylinders:</label>
                    <select 
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="cylinders"
                        name="cylinders"
                        value={formData.cylinders}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="-1">unknown</option>
                        <option className="text-center md:text-3xl text-md" value="3">3 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="4">4 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="5">5 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="6">6 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="8">8 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="10">10 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="12">12 cylinders</option>
                        <option className="text-center md:text-3xl text-md" value="0">other</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="fuel">Fuel type:</label>
                    <select 
                        className="ml-2 mb-10 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-3xl text-md text-black"
                        id="fuel"
                        name="fuel"
                        value={formData.fuel}
                        onChange={handleFormChange}
                    >
                        <option className="text-center md:text-3xl text-md" value="gas">gas</option>
                        <option className="text-center md:text-3xl text-md" value="diesel">diesel</option>
                        <option className="text-center md:text-3xl text-md" value="hybrid">hybrid</option>
                        <option className="text-center md:text-3xl text-md" value="electric">electric</option>
                        <option className="text-center md:text-3xl text-md" value="other">other</option>
                    </select>
                </div>
            </div>
            
            <div className="flex mt-4 md:mt-10">
                <div 
                    onClick={currFormPage != 1 ? () => handleCurrFormPageChange(1) : null}
                    className={`ml-16 md:ml-52 py-2 px-7 border-2 ${props.isDarkMode ? "border-white" : "border-black"} ${currFormPage == 1 ? "bg-blue-500 text-white" : "cursor-pointer"} rounded-xl select-none`}
                >
                    1
                </div>
                <div 
                    onClick={currFormPage != 2 ? () => handleCurrFormPageChange(2) : null}
                    className={`mx-auto py-2 px-7 border-2 ${props.isDarkMode ? "border-white" : "border-black"} ${currFormPage == 2 ? "bg-blue-500 text-white" : "cursor-pointer"} rounded-xl select-none`}
                >
                    2
                </div>
                <div 
                    onClick={currFormPage != 3 ? () => handleCurrFormPageChange(3) : null}
                    className={`mr-16 md:mr-52 py-2 px-7 border-2 ${props.isDarkMode ? "border-white" : "border-black"} ${currFormPage == 3 ? "bg-blue-500 text-white" : "cursor-pointer"} rounded-xl select-none`}
                >
                    3
                </div>
            </div>

            <h1 className={`${invalidCarModel ? "" : "hidden"} mt-8 md:mt-16 text-center text-base md:text-2xl font-medium font-Montserrat text-red-600`}>Please enter a valid car model (click one of the options from the dropdown menu)</h1>

            <button className={`${currFormPage != 3 ? "hidden" : "block"} w-52 h-12 mt-12 md:mt-20 mx-auto rounded-xl bg-blue-500 text-xl text-white`}>Predict car price</button>

            <h1 className={`${predictedCarPrice === null ? "hidden" : ""} mt-8 md:mt-16 text-center text-lg md:text-2xl font-medium font-Montserrat`}>The predicted price of your car is <span className="text-xl md:text-3xl text-green-500">${predictedCarPrice}</span></h1>
        </form>

        <div className='mt-10 md:mt-20 flex flex-col'>
            <h1 className="self-center text-2xl md:text-4xl font-medium font-Montserrat">Model creation process</h1>
        </div>

        <div className='mt-10 flex flex-col'>
            <h1 className="self-center text-xl md:text-3xl font-medium font-Montserrat">Model performance</h1>

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The model used to predict car prices is a neural network with an R^2 score of 0.907. 
                It uses a batch size of 128, 183 epochs, the MSELoss loss function, 0.0048 learning rate and the RMSprop optimizer. 
                It has the following layers:
            </p>
            <ul className="mt-2 mx-12 md:mx-16 text-base md:text-xl font-Open_Sans list-disc">
                <li>nn.Linear(2114, 235),</li>
                <li className="mt-1">nn.ReLU(),</li>
                <li className="mt-1">nn.Dropout(0.306),</li>
                <li className="mt-1">nn.Linear(235, 324),</li>
                <li className="mt-1">nn.ReLU(),</li>
                <li className="mt-1">nn.Dropout(0.265),</li>
                <li className="mt-1">nn.Linear(324, 1)</li>
            </ul>

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The residuals for this neural network are presented below:
            </p>

            <img className="w-5/6 md:w-1/2 mt-10 mx-3 md:mx-32" src={props.isDarkMode ? residuals_plot_white : residuals_plot_black} alt="residuals plot" />

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Out of the 23,092 values tested, 98.5% are within 10,000$ of the correct value, 91.6% are within 5,000$ of the correct value, 
                73.8% are within 2,500$ of the correct value, 39.7% are within 1,000$ of the correct value and 20.8% are within 500$ of the correct value.
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                These are great scores considering the dataset that was used to train the model required heavy cleaning, 
                resulting in some inconsistent entries that could only be removed manually still being present, 
                and that the model can predict the price of over 2000 car models.
            </p>
        </div>

        <div className='mt-16 flex flex-col'>
            <h1 className="self-center text-xl md:text-3xl font-medium font-Montserrat">Preparing the dataset</h1>
        
            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Cleaning the data</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                All irrelevant columns were removed. Irrelevant columns are either the ones that can’t be tied to the price (such as id columns) 
                or the ones that are found to have no correlation using a correlation heatmap.
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Once irrelevant columns were removed, so were any duplicate rows, resulting in the number of samples being reduced from 426k down to 247k.
            </p>

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Missing values were replaced wherever possible, however there were some instances in which they had to be removed, 
                resulting in a small reduction from 247k down to 241k. 
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Afterwards string columns were label encoded where it made sense (car condition, number of cylinders, vehicle size).
            </p>

            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Removing outliers</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The dataset had a lot of outliers/inconsistent data, thus removing outliers was done in multiple stages.
            </p>
            <img className="w-11/12 md:w-7/12 mt-10 mx-3 md:mx-32" src={props.isDarkMode ? outliers_before_plot_white : outliers_before_plot_black} alt="outliers before plot" />
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The first stage was only keeping entries within 3 standard deviations for price, entry_year and odometer.
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                In the second stage for each car model, only entries that had a price within 2 standard deviations for that particular car model were kept.
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Other ways of removing outliers were tested, however this wielded the best results. 
                After all stages the number of samples dropped from 241k down to 200k.
            </p>
            <img className="w-11/12 md:w-7/12 mt-10 mx-3 md:mx-32" src={props.isDarkMode ? outliers_after_plot_white : outliers_after_plot_black} alt="outliers after plot" />

            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Further cleaning the data</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Removing outliers didn’t eliminate all inconsistent data from the dataset, 
                which is why all cars objectively better than another car but with lower price were removed.
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                A car is defined as objectively better than another if for each of its quantifiable columns it has a better value (lower odometer, better condition etc.) 
                and if all its non-quantifiable columns are the same (same model, same transmission etc.). 
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                There are some edge cases that can bypass this filter, however these cases can only be removed manually. 
                After removing objectively better but cheaper cars, the number of samples dropped to 158k.
            </p>

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Since the car model is the most important feature when it comes to predicting a car’s price, all car models with a frequency less than 10 were removed, 
                resulting in a steep drop from 158k down to 115k.
            </p>
 
            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Last steps in data preparation</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                A correlation heatmap was created, which is used in the beginning to eliminate irrelevant columns. 
                The number of cylinders has the lowest correlation to price within the kept features, 
                however after testing I determined that it was able to make a difference in the price prediction models.
            </p>
            <img className="w-11/12 md:w-7/12 mt-10 mx-3 md:mx-32" src={props.isDarkMode ? correlation_heatmap_white : correlation_heatmap_black} alt="correlation heatmap" />

            <p className="mt-10 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">Finally, the remaining string columns are one-hot encoded.</p>
        </div>

        <div className='mt-16 flex flex-col'>
            <h1 className="self-center text-xl md:text-3xl font-medium font-Montserrat">Picking the most optimal model</h1>

            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Hyperparameter tuning in phases</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                Because it was too time intensive to pick hyperparameters using a complete grid search, picking hyperparameters was done in 3 phases.
            </p>
            <ul className="mt-2 mx-8 md:mx-16 text-base md:text-xl font-Open_Sans list-disc">
                <li>The first phase was testing 1,000 samples with different hyperparameter configurations of linear regression, K neighbors regression, 
                Support vector regression, Random forest regression and Gradient boosting regression. The top 100 configurations advanced to the next phase.</li>
                <li className="mt-2">The second phase took the winning configurations from the previous phase and used 10,000 samples to test them. 
                The top 5 configurations entered the last phase.</li>
                <li className="mt-2">In the last phase the remaining configurations were tested on all 115,000 samples, and the best configuration was picked.</li>
            </ul>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The winner was the Gradient boosting regressor with (learning_rate=0.1, max_depth=None, max_features="sqrt", 
                min_samples_leaf=2, min_samples_split=10, n_estimators=500). The R^2 score of this model is 0.902.
            </p>

            <h1 className="mt-10 mx-3 md:mx-10 text-lg md:text-2xl font-medium font-Montserrat">Tuning hyperparameters for a neural network</h1>

            <p className="mt-4 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The scikit learn model that won the previous stages was compared with a pytorch neural network optimized for this dataset. 
                To tune the hyperparameters of the neural network the library optuna was used. 
            </p>
            <p className="mt-2 mx-3 md:mx-10 text-base md:text-xl font-Open_Sans">
                The winning neural network is the one described in the “Model performance” section, which had a better R^2 score than the scikit learn model, 
                which is why it is used as the final model for predicting used car prices.
            </p>
        </div>
    </>
    )
}
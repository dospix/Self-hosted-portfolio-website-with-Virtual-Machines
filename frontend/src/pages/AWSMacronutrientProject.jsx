import { useState, useEffect, useRef } from "react"
import ingredients from "../data/ingredients.json"
import example_meals_white from "../assets/images/example-meals-white.png"
import example_meals_black from "../assets/images/example-meals-black.png"
import avocado_loading from "../assets/images/avocado-loading.png"
import plus from "../assets/images/plus.png"
import delete_x from "../assets/images/delete-x.png"

export default function MySQLProject(props){
    const BORDER_COLOR = props.isDarkMode ? "border-white" : "border-black"
    const MAX_INGREDIENT_ROW_LIMIT = 25
    
    const foodItems = new Set(ingredients.ingredients)

    const [currFoodItem, setCurrFoodItem] = useState("")
    const [currAmount, setCurrAmount] = useState(0)
    const [currFoodData, setCurrFoodData] = useState(null)
    // This is a boolean, but starts as null because there is a useEffect that runs every time it is false
    const [fetchingFoodData, setFetchingFoodData] = useState(null)
    // This is a representation of all food items tracked for the final macronutrient calculation, each array inside represents a row in the table.
    // Each row will have 5 items, representing the food item served for: breakfast, first snack, lunch, second snack or dinner.
    // For meals that don't have a food item in a row, the value corresponding to the meal will be null, otherwise it will be an object.
    // The last item in a column is a button used to add the current ingredient in the respective cell, which is why the array starts with 5 "add_button" strings.
    // Example object: 
    // {
    //     "calories": 44.1,
    //     "carbohydrates": 0.23,
    //     "fat": 2.98,
    //     "fetch_queue_length": 1,
    //     "fiber": 0,
    //     "food_name": "egg",
    //     "measure": "30g",
    //     "protein": 3.77,
    //     "saturated_fat": 0.93,
    //     "starch": 0,
    //     "sugars": 0.23
    // }
    const [ingredientTableRows, setIngredientTableRows] = useState([["add_button", "add_button", "add_button", "add_button", "add_button"]])
    const [totalMacronutrients, setTotalMacronutriets] = useState({
        "calories": 0,
        "carbohydrates": 0,
        "fat": 0,
        "fiber": 0,
        "protein": 0,
        "saturated_fat": 0,
        "starch": 0,
        "sugars": 0
    })
    const [rememberedIngredients, setRememberedIngredients] = useState({})
    
    // Used for initiating a fetch only if a newer fetch hasn't been initiated in a 100 millisecond timeframe
    const foodItemInfoFetchCounter = useRef(0)
    function calculateMacronutrients(event){
        event.preventDefault()
        if(fetchingFoodData)
            return
        setCurrFoodData(null)
        foodItemInfoFetchCounter.current += 1
        let currFoodItemInfoFetchCounter = foodItemInfoFetchCounter.current
        if(!(isValidFoodItem(currFoodItem) && isValidAmount(currAmount)))
            return

        setFetchingFoodData(true)
        setTimeout(() => {
            if(!(currFoodItem in rememberedIngredients) && currFoodItemInfoFetchCounter == foodItemInfoFetchCounter.current)
                fetch("/asw-macronutrient-project/get-food-item-info", {
                    method: "POST",
                    body: JSON.stringify({
                        "foodItem": currFoodItem,
                        "currAmount": 100
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    }
                })
                .then(response => response.json())
                .then(responseJson => {
                    if(currFoodItemInfoFetchCounter == foodItemInfoFetchCounter.current){
                        setRememberedIngredients(prev => {
                            let newRememberedIngredients = JSON.parse(JSON.stringify(prev))
                            newRememberedIngredients[responseJson["food_name"]] = responseJson
    
                            return newRememberedIngredients
                        })
                    }
                })
                .catch(error => console.error('Error:', error))
                .finally(() => setFetchingFoodData(false))
            else setFetchingFoodData(false)
        }, 100)
    }
    useEffect(() => {
        if(fetchingFoodData == false){
            let rememberedIngredient = JSON.parse(JSON.stringify(rememberedIngredients[currFoodItem]))
            for(const macronutrient_type in rememberedIngredient)
                if(["calories", "carbohydrates", "fat", "fiber", "protein", "saturated_fat", "starch", "sugars"].includes(macronutrient_type))
                    rememberedIngredient[macronutrient_type] = Number((rememberedIngredient[macronutrient_type] / 100 * currAmount).toFixed(2))
            
            // convert from "100 g/ml" to "currAmountg/ml"
            let measurementType = rememberedIngredient["measure"].replace(/[0-9.]/g, '')
            rememberedIngredient["measure"] = currAmount.toString() + measurementType
            setCurrFoodData({ ...rememberedIngredient })
        }
    }, [fetchingFoodData])

    function isValidFoodItem(foodItem){
        return foodItems.has(foodItem + "|g") || foodItems.has(foodItem + "|ml")
    }
    function isValidAmount(amount){
        const lessThanThreeDecimalsRegex = /^\d+(\.\d{1,2})?$/
        return amount > 0 && lessThanThreeDecimalsRegex.test(amount)
    }

    function handleFormChange(event) {
        let {name, value} = event.target

        if(name == "currFoodItem")
            setCurrFoodItem(value)
        else if(name == "currAmount")
            if(value <= 0 || isNaN(value))
                setCurrAmount(0)
            if(!isValidAmount(value))
                return
            else if(value > 10000)
                setCurrAmount(10000)
            else setCurrAmount(parseFloat(value))
    }

    function addCurrFoodDataToFinalTable(ingredientMeal) {
        let columnIndex = null
        switch (ingredientMeal) {
            case "breakfast":
                columnIndex = 0
                break
            case "first snack":
                columnIndex = 1
                break
            case "lunch":
                columnIndex = 2
                break
            case "second snack":
                columnIndex = 3
                break
            case "dinner":
                columnIndex = 4
                break
            default:
                throw new Error("invalid meal")
        }

        for(let row = 0; row < ingredientTableRows.length; row++)
            if(ingredientTableRows[row][columnIndex] == "add_button"){
                if(row == MAX_INGREDIENT_ROW_LIMIT)
                    return
                setIngredientTableRows(prev => {
                    const newTableRows = JSON.parse(JSON.stringify(prev))
                    newTableRows[row][columnIndex] = currFoodData
                    if(newTableRows.length > row + 1)
                        newTableRows[row + 1][columnIndex] = "add_button"
                    else {
                        newTableRows.push([null, null, null, null, null])
                        newTableRows[row + 1][columnIndex] = "add_button"
                    }
                    return newTableRows
                })
                break
            }
        
        setTotalMacronutriets(prev => {
            const newTotalMacronutrients = JSON.parse(JSON.stringify(prev))
            newTotalMacronutrients["calories"] += currFoodData["calories"]
            newTotalMacronutrients["carbohydrates"] += currFoodData["carbohydrates"]
            newTotalMacronutrients["fat"] += currFoodData["fat"]
            newTotalMacronutrients["fiber"] += currFoodData["fiber"]
            newTotalMacronutrients["protein"] += currFoodData["protein"]
            newTotalMacronutrients["saturated_fat"] += currFoodData["saturated_fat"]
            newTotalMacronutrients["starch"] += currFoodData["starch"]
            newTotalMacronutrients["sugars"] += currFoodData["sugars"]

            return newTotalMacronutrients
        })
    }

    function removeFoodDataFromFinalTable(rowIndex, cellIndex) {
        setTotalMacronutriets(prev => {
            const newTotalMacronutrients = JSON.parse(JSON.stringify(prev))
            newTotalMacronutrients["calories"] = Math.abs(newTotalMacronutrients["calories"] - ingredientTableRows[rowIndex][cellIndex]["calories"])
            newTotalMacronutrients["carbohydrates"] = Math.abs(newTotalMacronutrients["carbohydrates"] - ingredientTableRows[rowIndex][cellIndex]["carbohydrates"])
            newTotalMacronutrients["fat"] = Math.abs(newTotalMacronutrients["fat"] - ingredientTableRows[rowIndex][cellIndex]["fat"])
            newTotalMacronutrients["fiber"] = Math.abs(newTotalMacronutrients["fiber"] - ingredientTableRows[rowIndex][cellIndex]["fiber"])
            newTotalMacronutrients["protein"] = Math.abs(newTotalMacronutrients["protein"] - ingredientTableRows[rowIndex][cellIndex]["protein"])
            newTotalMacronutrients["saturated_fat"] = Math.abs(newTotalMacronutrients["saturated_fat"] - ingredientTableRows[rowIndex][cellIndex]["saturated_fat"])
            newTotalMacronutrients["starch"] = Math.abs(newTotalMacronutrients["starch"] - ingredientTableRows[rowIndex][cellIndex]["starch"])
            newTotalMacronutrients["sugars"] = Math.abs(newTotalMacronutrients["sugars"] - ingredientTableRows[rowIndex][cellIndex]["sugars"])

            return newTotalMacronutrients
        })

        setIngredientTableRows(prev => {
            const newTableRows = JSON.parse(JSON.stringify(prev))
            let columnMaxIndex = rowIndex
            for(let row = rowIndex + 1; newTableRows[row - 1][cellIndex] != "add_button"; row++){
                columnMaxIndex = row
                newTableRows[row - 1][cellIndex] = newTableRows[row][cellIndex]
            }
            newTableRows[columnMaxIndex][cellIndex] = null

            // If the last row is empty after removing an element then delete the row
            let allColumnsNull = true
            for(let currColumnIndex = 0; currColumnIndex < newTableRows[columnMaxIndex].length; currColumnIndex++)
                if(newTableRows[columnMaxIndex][currColumnIndex] != null)
                    allColumnsNull = false
            if(allColumnsNull)
                newTableRows.pop()

            return newTableRows
        })
    }

    return (
        <>
            <div className="mt-12 md:mt-16 mx-4 text-center">
                <h1 className="text-xl md:text-3xl font-semibold font-Montserrat">AWS Macronutrient Calculator Project</h1>
            </div>

            <p className="mt-12 mx-4 md:mx-12 lg:mx-24 text-xs sm:text-sm md:text-xl font-Open_Sans">
                This project displays the macronutrients present in the meals you consume throughout the day or within a single ingredient. <br />
                The macronutrient data of the ingredients is stored in an AWS DynamoDB database. Initially, AWS Lambda was used to perform some calculations, but ultimately, I decided to handle those calculations on the server due to the AWS requests taking too long to complete. <br />
                The macronutrient data used for this project was sourced from the U.S. Department of Agriculture's <a className="text-blue-500 hover:text-blue-700 hover:underline" href="https://fdc.nal.usda.gov">FoodData Central</a>. <br />
                Below is an example of a final meal table, along with the macronutrients present:
            </p>

            <img className="mt-10 mx-auto w-full md:w-11/12 lg:w-3/4" src={props.isDarkMode ? example_meals_black : example_meals_white} alt="final meal table example" />

            <div className='mt-14 mx-4 flex items-center justify-center text-center'>
                <h1 className="text-xl md:text-3xl font-Montserrat">Enter the food item and quantity whose macronutrients you would like to see</h1>
            </div>

            <form onSubmit={calculateMacronutrients} className="mx-auto mt-12 w-5/6 sm:w-3/4 lg:w-1/2 xl:w-5/12 flex justify-center flex-col font-Open_Sans">
                <label className="p-1 md:p-2 md:text-3xl text-lg" htmlFor="currFoodItem">Select food item:</label>
                <input 
                    className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md text-center md:text-3xl text-md text-black" 
                    id="currFoodItem"
                    name="currFoodItem"
                    type="text"
                    list="foodItems"
                    value={currFoodItem}
                    onChange={handleFormChange}
                    maxLength="50"
                />
                <datalist id="foodItems">
                    {[...foodItems].map(foodItem => (
                        <option className="text-center md:text-3xl text-md" key={foodItem.split("|")[0]} value={foodItem.split("|")[0]}>{foodItem.split("|")[0]}</option>
                    ))}
                </datalist>

                <label className="mt-6 p-1 md:p-2 md:text-3xl text-lg" htmlFor="currAmount">Select amount{foodItems.has(currFoodItem + "|g") ? " in grams" : foodItems.has(currFoodItem + "|ml") ? " in milliliters" : ""}:</label>
                <input 
                    type="number"
                    className="ml-2 p-1 md:p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md text-center md:text-3xl text-md text-black"
                    id="currAmount"
                    name="currAmount"
                    value={currAmount}
                    onChange={handleFormChange}
                />

                <button className="w-64 h-12 mt-16 self-center rounded-xl bg-blue-500 text-base md:text-lg lg:text-xl text-white">Calculate macronutrients</button>
            </form>

            <div className="flex mx-1 sm:mx-auto mt-16 sm:w-11/12">
                <div className="flex items-center w-1/3 sm:w-1/2">
                    <h1 className={`mx-auto sm:ml-auto sm:mr-10 md:mr-20 text-base sm:text-lg md:text-3xl ${currFoodData != null ? "" : "text-red-600"}`}>{currFoodData != null ? currFoodData["food_name"] + " - " + currFoodData["measure"] : fetchingFoodData ? "" : !isValidFoodItem(currFoodItem) ? "invalid food item" : !isValidAmount(currAmount) ? "invalid amount" : "Press the button above to calculate macronutrients"}</h1>
                </div>
                <div className="w-2/3 sm:w-1/2">
                    <table className="mx-auto sm:mr-auto sm:ml-10 md:ml-20 text-sm md:text-xl text-center border-separate border-spacing-0">
                        <tr>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2 rounded-tl-xl`}>Calories: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["calories"].toFixed(2) + " kcal"}</td>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2 rounded-tr-xl`}></td>
                        </tr>
                        <tr>
                            <td rowSpan="3" className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Carbohydrates: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["carbohydrates"].toFixed(2) + " g"}</td>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Sugars: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["sugars"].toFixed(2) + " g"}</td>
                        </tr>
                        <tr>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Fiber: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["fiber"].toFixed(2) + " g"}</td>
                        </tr>
                        <tr>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Starch: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["starch"].toFixed(2) + " g"}</td>
                        </tr>
                        <tr>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Protein: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["protein"].toFixed(2) + " g"}</td>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2`}></td>
                        </tr>
                        <tr>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-y-2 border-l-2 rounded-bl-xl`}>Fat: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["fat"].toFixed(2) + " g"}</td>
                            <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-2 rounded-br-xl`}>Saturated fat: {fetchingFoodData ? <img className="inline w-7 mx-auto animate-spin" src={avocado_loading} alt="loading image" /> : currFoodData == null ? "" : currFoodData["saturated_fat"].toFixed(2) + " g"}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <p className="mt-20 mx-4 md:mx-12 lg:mx-24 text-sm sm:text-md md:text-2xl font-Open_Sans text-center">
                Once you have a food item selected, you can add it to your meal plan below. <br />
                The total macronutrients of your meal plan will update in real time.
            </p>
            
            <table className="mx-1 sm:mx-auto mt-20 text-xs sm:text-sm md:text-xl text-center border-separate border-spacing-0">
                <tr>
                    <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2 rounded-tl-xl`}>Breakfast</td>
                    <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>First snack</td>
                    <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Lunch</td>
                    <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Second snack</td>
                    <td className={`py-1 sm:py-2 px-2 sm:px-4 ${BORDER_COLOR} border-t-2 border-x-2 rounded-tr-xl`}>Dinner</td>
                </tr>
                {ingredientTableRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((tableItem, cellIndex) => {
                            const isOnLastRow = rowIndex == ingredientTableRows.length - 1
                            const isOnLastColumn = cellIndex == 4
                            const isBottomLeftCorner = isOnLastRow && cellIndex == 0
                            const isBottomRightCorner = isOnLastRow && isOnLastColumn
                            let borderStyle = BORDER_COLOR
                            borderStyle += isOnLastRow ? " border-y-2" : " border-t-2"
                            borderStyle += isOnLastColumn ? " border-x-2" : " border-l-2"
                            borderStyle += isBottomLeftCorner ? " rounded-bl-xl" : ""
                            borderStyle += isBottomRightCorner ? " rounded-br-xl" : ""
                            if (tableItem == "add_button")
                                return (
                                    <td key={cellIndex} className={`${currFoodData == null ? "py-4 sm:py-8 px-4 sm:px-8" : "py-1 sm:py-2 px-2 sm:px-4"} ${borderStyle}`}>
                                        <img 
                                            className={`${currFoodData == null ? "hidden" : ""} m-auto w-4 sm:w-8 hover:cursor-pointer`}
                                            src={plus} 
                                            alt="add food item"
                                            onClick={() => {
                                                switch (cellIndex) {
                                                    case 0:
                                                        addCurrFoodDataToFinalTable("breakfast")
                                                        break
                                                    case 1:
                                                        addCurrFoodDataToFinalTable("first snack")
                                                        break
                                                    case 2:
                                                        addCurrFoodDataToFinalTable("lunch")
                                                        break
                                                    case 3:
                                                        addCurrFoodDataToFinalTable("second snack")
                                                        break
                                                    case 4:
                                                        addCurrFoodDataToFinalTable("dinner")
                                                        break
                                                    default:
                                                        throw new Error("invalid meal")
                                                }
                                            }}
                                        />
                                    </td>
                                )
                            else return (
                                    <td key={cellIndex} className={`p-[1px] sm:p-1 md:p-2 ${borderStyle}`}>
                                        {tableItem == null ? <></> : <img className="inline mr-1 md:mr-2 h-2 sm:h-3 md:h-6 hover:cursor-pointer" src={delete_x} onClick={() => removeFoodDataFromFinalTable(rowIndex, cellIndex)} alt="delete ingredient" />}
                                        <span className="">{tableItem == null ? "" : tableItem["food_name"] + " - " + tableItem["measure"]}</span>
                                    </td>
                                )
                        })}
                    </tr>
                ))}
            </table>

            <table className="mt-16 mx-auto text-sm md:text-xl text-center border-separate border-spacing-0">
                <tr>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-l-2 rounded-tl-xl`}>Calories: {totalMacronutrients["calories"].toFixed(2) + " kcal"}</td>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-x-2 rounded-tr-xl`}></td>
                </tr>
                <tr>
                    <td rowSpan="3" className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Carbohydrates: {totalMacronutrients["carbohydrates"].toFixed(2) + " g"}</td>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Sugars: {totalMacronutrients["sugars"].toFixed(2) + " g"}</td>
                </tr>
                <tr>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Fiber: {totalMacronutrients["fiber"].toFixed(2) + " g"}</td>
                </tr>
                <tr>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-x-2`}>Starch: {totalMacronutrients["starch"].toFixed(2) + " g"}</td>
                </tr>
                <tr>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-l-2`}>Protein: {totalMacronutrients["protein"].toFixed(2) + " g"}</td>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-t-2 border-x-2`}></td>
                </tr>
                <tr>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-y-2 border-l-2 rounded-bl-xl`}>Fat: {totalMacronutrients["fat"].toFixed(2) + " g"}</td>
                    <td className={`py-2 px-4 ${BORDER_COLOR} border-2 rounded-br-xl`}>Saturated fat: {totalMacronutrients["saturated_fat"].toFixed(2) + " g"}</td>
                </tr>
            </table>
        </>
    )
}
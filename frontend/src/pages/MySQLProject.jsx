import { useState, useEffect } from "react"
import delete_x from "../assets/images/delete-x.png"
import checkbox_empty from "../assets/images/checkbox-empty.png"
import checkbox_checked from "../assets/images/checkbox-checked.png"
import arrow_left from "../assets/images/arrow-left.png"
import arrow_right from "../assets/images/arrow-right.png"
import arrow_left_white from "../assets/images/arrow-left-white.png"
import arrow_right_white from "../assets/images/arrow-right-white.png"
import plus from "../assets/images/plus.png"

export default function MySQLProject(props){
    const [totalUserTasks, setTotalUserTasks] = useState(0)
    const [totalUserTasksCompleted, setTotalUserTasksCompleted] = useState(0)
    const [longestUserTaskStreak, setlongestUserTaskStreak] = useState(0)
    const [totalUserHabits, setTotalUserHabits] = useState(0)
    const [totalUserHabitsCompleted, settotalUserHabitsCompleted] = useState(0)
    const [longestUserHabitStreak, setlongestUserHabitStreak] = useState(0)

    const [formUsername, setFormUsername] = useState("")
    const [currUser, setCurrUser] = useState("")
    const [howManyTimesRegistered, setHowManyTimesRegistered] = useState(localStorage.getItem("howManyTimesRegistered") !== null ? Number(localStorage.getItem("howManyTimesRegistered")) : 0)
    const registrationLimit = 10

    useEffect(() => {
        localStorage.setItem("howManyTimesRegistered", howManyTimesRegistered)
      }, [howManyTimesRegistered])
    
    const [currDay, setCurrDay] = useState(1)
    const [tasks, setTasks] = useState([])
    const [formTaskToBeAdded, setFormTaskToBeAdded] = useState("")
    const [habits, setHabits] = useState([])
    const [formHabitToBeAdded, setFormHabitToBeAdded] = useState("")
    const [nextDayExists, setNextDayExists] = useState(false)

    function registerAndChangeUser(event){
        event.preventDefault()
        if(formUsername == "")
            return

        setCurrDay(1)

        fetch("/mysql-project/register-user", {
            method: "POST",
            body: JSON.stringify({
                "formUsername": formUsername,
                "reachedRegistrationLimit": howManyTimesRegistered >= registrationLimit
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response => response.json())
        .then(data => {
            setCurrUser(data["currUser"])
            if(data["hasRegistered"])
                setHowManyTimesRegistered(prevState => prevState + 1)
        })
        .catch(error => console.error('Error:', error))
    }

    useEffect(() => {
        refreshNextDayExists()
        refreshTasks()
        refreshHabits()
        updateUserStatistics()
    }, [currUser, currDay])

    function refreshNextDayExists(){
        fetch("/mysql-project/refresh-nextDayExists", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "currDay": currDay
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response => response.json())
        .then(data => {setNextDayExists(data.next_day_exists)})
        .catch(error => console.error('Error:', error))
    }

    function refreshTasks(){
        fetch("/mysql-project/refresh-tasks", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "currDay": currDay
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response => response.json())
        .then(tasks => {setTasks(tasks)})
        .catch(error => console.error('Error:', error))
    }

    function addNewTask(){
        if(formTaskToBeAdded == "" || tasks.length == 15)
            return

        fetch("/mysql-project/add-new-task", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "currDay": currDay,
                "taskIndex": tasks.length == 0 ? 0 : tasks[tasks.length - 1].taskIndex + 1,
                "formTaskToBeAdded": formTaskToBeAdded
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshTasks)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function deleteTask(username, dayIndex, taskIndex){
        fetch("/mysql-project/delete-task", {
            method: "POST",
            body: JSON.stringify({
                "currUser": username,
                "currDay": dayIndex,
                "taskIndex": taskIndex
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshTasks)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function toggleCheckboxTask(username, dayIndex, taskIndex){
        fetch("/mysql-project/toggle-checkbox-task", {
            method: "POST",
            body: JSON.stringify({
                "currUser": username,
                "currDay": dayIndex,
                "taskIndex": taskIndex
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshTasks)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function refreshHabits(){
        fetch("/mysql-project/refresh-habits", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "currDay": currDay
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response => response.json())
        .then(habits => {setHabits(habits)})
        .catch(error => console.error('Error:', error))
    }

    function addNewHabit(){
        if(formHabitToBeAdded == "" || habits.length == 15)
            return

        fetch("/mysql-project/add-new-habit", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "currDay": currDay,
                "habitIndex": habits.length == 0 ? 0 : habits[habits.length - 1].habitIndex + 1,
                "formHabitToBeAdded": formHabitToBeAdded
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshHabits)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function deleteHabit(username, dayIndex, habitIndex){
        fetch("/mysql-project/delete-habit", {
            method: "POST",
            body: JSON.stringify({
                "currUser": username,
                "currDay": dayIndex,
                "habitIndex": habitIndex
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshHabits)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function toggleCheckboxHabit(username, dayIndex, habitIndex){
        fetch("/mysql-project/toggle-checkbox-habit", {
            method: "POST",
            body: JSON.stringify({
                "currUser": username,
                "currDay": dayIndex,
                "habitIndex": habitIndex
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(refreshHabits)
        .then(updateUserStatistics)
        .catch(error => console.error('Error:', error))
    }

    function addNextDay(){
        if(currDay == 50)
            return

        fetch("/mysql-project/add-next-day", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser,
                "dayIndex": currDay + 1
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(() => setCurrDay(prevState => prevState + 1))
        .catch(error => console.error('Error:', error))
    }

    function updateUserStatistics(){
        fetch("/mysql-project/update-user-statistics", {
            method: "POST",
            body: JSON.stringify({
                "currUser": currUser
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response => response.json())
        .then(statistics => {
            setTotalUserTasks(statistics.total_user_tasks)
            setTotalUserTasksCompleted(statistics.total_user_tasks_completed)
            setlongestUserTaskStreak(statistics.longest_user_task_streak)
            setTotalUserHabits(statistics.total_user_habits)
            settotalUserHabitsCompleted(statistics.total_user_habits_completed)
            setlongestUserHabitStreak(statistics.longest_user_habit_streak)
        })
        .catch(error => console.error('Error:', error))
    }

    return (
        <>
            <h1 className='mt-12 mx-1 sm:mx-4 text-lg md:text-2xl lg:text-3xl text-center font-semibold font-Montserrat'>Using MySQL to Store Your Tasks/Habits</h1>

            <div className='mt-24 2xl:mx-80 xl:mx-44 lg:mx-16 md:mx-10 mx-5 md:text-2xl sm:text-xl text-lg font-Open_Sans'>
                <p className="lg:inline">Once you register/log in you will be able to interact with the project. </p>
                <p className="lg:inline lg:mt-1 md:mt-3 mt-5">Your username, along with your tasks and habits will be stored in a MySQL database, which is used when updating the states on the page.</p>
            </div>

            <form onSubmit={registerAndChangeUser} className="mx-auto mt-16 w-11/12 sm:w-1/2 flex justify-center flex-col font-Open_Sans">
                <label className="text-lg md:text-2xl lg:text-3xl text-center font-Montserrat" htmlFor="titleKeywords">Please provide a username</label>
                <input 
                    type="text"
                    className="mx-1 sm:mx-10 lg:mx-32 mt-3 md:mt-6 p-2 border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-md text-black"
                    placeholder=""
                    id="formUsername"
                    name="formUsername"
                    value={formUsername}
                    onChange={event => setFormUsername(event.target.value)}
                    maxLength="32"
                />

                <button className="w-56 h-12 mt-10 self-center rounded-xl bg-blue-500 text-base md:text-lg lg:text-xl text-white">Log in/Register</button>
            </form>

            <div className={howManyTimesRegistered == registrationLimit ? "" : "hidden"}>
                <h1 className="mt-16 mx-4 text-lg md:text-2xl lg:text-3xl text-red-600 text-center font-semibold font-Montserrat">You have registered {howManyTimesRegistered} times. <br /> You can't register any new accounts.</h1>
            </div>

            <h1 className="mt-20 mx-4 text-lg md:text-2xl lg:text-3xl text-center font-semibold font-Montserrat">You are logged in as <span className="text-blue-500">{currUser}</span></h1>

            <div className={currUser == "" ? "my-52" : ""}></div>
            
            <div className={currUser == "" ? "hidden" : ""}>
                <h1 className='mt-12 mx-4 text-lg md:text-2xl lg:text-3xl text-center font-Montserrat'>Day {currDay}</h1>

                <div className="mt-10 mx-auto w-full sm:w-11/12 xl:w-3/5 flex flex-wrap">
                    <div className="w-1/2">
                        <h1 className="mb-8 text-lg md:text-2xl lg:text-3xl text-center font-medium font-Montserrat">Tasks</h1>
                        {tasks.map(task => (
                            <div key={`${task.username} - ${task.dayIndex} - ${task.taskIndex}`} className="mt-4 h-10 flex">
                                <img className="ml-2 md:ml-16 mt-1 h-4 sm:h-8 hover:cursor-pointer" src={delete_x} alt="delete task" onClick={() => deleteTask(task.username, task.dayIndex, task.taskIndex)} />
                                <p className="w-full md:text-2xl sm:text-xl text-md text-center">{task.text}</p>
                                <img 
                                    className="mr-2 md:mr-16 mt-1 h-4 sm:h-8 hover:cursor-pointer" 
                                    src={task.completed ? checkbox_checked : checkbox_empty} 
                                    alt="task checkbox" 
                                    onClick={() => toggleCheckboxTask(task.username, task.dayIndex, task.taskIndex)} 
                                />
                            </div>
                        ))}
                        <div className="mt-10 h-10 flex">
                            <input 
                                type="text"
                                className="ml-2 md:ml-16 p-2 w-full border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-sm text-black"
                                placeholder="Add a new task"
                                id="formTaskToBeAdded"
                                name="formTaskToBeAdded"
                                value={formTaskToBeAdded}
                                onChange={event => setFormTaskToBeAdded(event.target.value)}
                                maxLength="32"
                            />
                            <img className="ml-2 md:ml-6 mr-2 md:mr-16 mt-2 sm:mt-0.5 h-1/2 sm:h-3/4 hover:cursor-pointer" src={plus} alt="add task" onClick={addNewTask}/>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <h1 className='mb-8 text-lg md:text-2xl lg:text-3xl text-center font-medium font-Montserrat'>Habits</h1>
                        {habits.map(habit => (
                            <div key={`${habit.username} - ${habit.dayIndex} - ${habit.habitIndex}`} className="mt-4 h-10 flex">
                                <img className="ml-2 md:ml-16 mt-1 h-4 sm:h-8 hover:cursor-pointer" src={delete_x} alt="delete habit" onClick={() => deleteHabit(habit.username, habit.dayIndex, habit.habitIndex)} />
                                <p className="w-full md:text-2xl sm:text-xl text-md text-center">{habit.text}</p>
                                <img 
                                    className="mr-2 md:mr-16 mt-1 h-4 sm:h-8 hover:cursor-pointer" 
                                    src={habit.completed ? checkbox_checked : checkbox_empty} 
                                    alt="habit checkbox" 
                                    onClick={() => toggleCheckboxHabit(habit.username, habit.dayIndex, habit.habitIndex)} 
                                />
                            </div>
                        ))}
                        <div className="mt-10 h-10 flex">
                            <input 
                                type="text"
                                className="ml-2 md:ml-16 p-2 w-full border-[3px] border-black focus:outline-none focus:border-blue-500 rounded-md md:text-2xl sm:text-xl text-sm text-black"
                                placeholder="Add a new habit"
                                id="formHabitToBeAdded"
                                name="formHabitToBeAdded"
                                value={formHabitToBeAdded}
                                onChange={event => setFormHabitToBeAdded(event.target.value)}
                                maxLength="32"
                            />
                            <img className="ml-2 md:ml-6 mr-2 md:mr-16 mt-2 sm:mt-0.5 h-1/2 sm:h-3/4 hover:cursor-pointer" src={plus} alt="add habit" onClick={addNewHabit}/>
                        </div>
                    </div>
                    <div className="mt-12 w-full flex">
                        <img 
                            className={`ml-auto w-7 sm:w-14 ${currDay == 1 ? "invisible" : "hover:cursor-pointer"}`} 
                            src={props.isDarkMode ? arrow_left_white : arrow_left} 
                            alt="previous day arrow"
                            onClick={currDay > 1 ? () => setCurrDay(prevState => prevState - 1) : () => {}}
                        />
                        <img 
                            className="mr-auto ml-32 sm:ml-48 md:ml-96 w-7 sm:w-14 hover:cursor-pointer" 
                            src={nextDayExists ? (props.isDarkMode ? arrow_right_white : arrow_right) : plus} 
                            alt="next day arrow" 
                            onClick={() => {
                                if(!nextDayExists){
                                    addNextDay();
                                }
                                else{
                                    setCurrDay(prevState => prevState + 1);
                                }
                            }}
                        />
                    </div>
                </div>
                
                <div className="my-28">
                    <h1 className='mx-4 text-lg md:text-2xl lg:text-3xl text-center font-Montserrat'>You completed {totalUserTasksCompleted}/{totalUserTasks} tasks</h1>
                    <h1 className='mt-6 mx-4 text-lg md:text-2xl lg:text-3xl text-center font-Montserrat'>Your longest task streak lasted {longestUserTaskStreak} days</h1>
                    <h1 className='mt-6 mx-4 text-lg md:text-2xl lg:text-3xl text-center font-Montserrat'>You engaged in your habits {totalUserHabitsCompleted}/{totalUserHabits} times</h1>
                    <h1 className='mt-6 mx-4 text-lg md:text-2xl lg:text-3xl text-center font-Montserrat'>Your longest habit streak lasted {longestUserHabitStreak} days</h1>
                </div>
            </div>
            
        </>
    )
}
// IMPORTS

import dummyOneCallAPIData from "./dummyOneCallAPIData.js";
import { createCurrentWeatherDiv } from "./current-weather.js";
import { createComingDaysSection } from "./coming-days.js";
import "../sass/style.scss";


// GLOBAL VARIABLES

const APIkey = "be9f3e7fb99ef3d5a6cdca04ec93f7de";

export const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]
const domElems = {
    searchInput: document.querySelector(".search-input"),
    mainElem: document.querySelector("main"),
    searchButtonImg: document.querySelector(".search-button img"),
    cursor: document.querySelector(".cursor"),
}


// FUNCTIONS

/*
issue: background image behind .search-bar and .current-weather needs to reach until .coming-days because of parallax
using `height: 100vh` isn't enough on viewports with a height < .search-bar + .current-weather
solution: check where .coming-days starts and set that as the background image's height
*/
const setBgImgHeight = () => {
    const comingDaysBgCnt = document.querySelector(".coming-days-bg-cnt");
    document.documentElement.style.setProperty("--comingDaysOffsetTop", comingDaysBgCnt.offsetTop + 50 + "px");
}
window.onload = setBgImgHeight();



const removeWeekSection = () => {
    const days = document.querySelectorAll(".day");
    
    for (const day of days) {
        if (day.classList.contains("template")) {
            continue ;
        }
        day.remove();
    }
}


const removeErrorMessage = () => {
    const errorMessageP = document.querySelector(".error-message");

    if (errorMessageP) {
        errorMessageP.remove();
        domElems.mainElem.style.display = "block";
    }
}


const showErrorMsg = msg => {
    const errorMsg = document.createElement("p");
    errorMsg.classList.add("error-message");
    errorMsg.textContent = msg;
    
    document.body.insertBefore(errorMsg, document.body.children[2]);
    
    domElems.mainElem.style.display = "none";
}


const parseOneCallAPIData = weatherData => {
    const currentWeatherData = [];
    
    currentWeatherData["summary"] = weatherData.current.weather[0].main;
    currentWeatherData["description"] = weatherData.current.weather[0].description;
    currentWeatherData["dateObject"] = new Date(weatherData.current.dt * 1000);
    currentWeatherData["temperature"] = weatherData.current.temp;
    currentWeatherData["humidity"] = weatherData.current.humidity;
    currentWeatherData["precip"] = weatherData.current.pop;
    currentWeatherData["iconName"] = weatherData.current.weather[0].icon;
    currentWeatherData["wind-speed"] = weatherData.current.wind_speed; // meter/sec
    currentWeatherData["wind-direction"] = weatherData.current.wind_deg;

    return (currentWeatherData);
}


const parse5day3hourAPIData = weatherData => {
    if (weatherData.cod !== "200") {
        showErrorMsg(weatherData.message);
        return ;
    }

    const comingDaysData = [];

    for (const listItem of weatherData.list) {
        const item = {};
        item["summary"] = listItem.weather[0].main;
        item["description"] = listItem.weather[0].description;
        item["dateObject"] = new Date(listItem.dt * 1000);
        item["temperature"] = listItem.main.temp;
        item["humidity"] = listItem.main.humidity;
        item["clouds"] = listItem.clouds.all;
        item["precip"] = listItem.pop;
        item["iconName"] = listItem.weather[0].icon;
        item["wind-speed"] = listItem.wind.speed; // meter/sec
        item["wind-direction"] = listItem.wind.deg;
        comingDaysData.push(item);
    }

    return (comingDaysData);
}


const fetchOneCallAPIData = async data5d3h => {
    let dataOneCallAPI;
    const lat = data5d3h.city.coord.lat;
    const lon = data5d3h.city.coord.lon;

    await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${APIkey}`)
        .then(response => response.json())
        .then(data => dataOneCallAPI = data);

    return (dataOneCallAPI);
}


const fetch5day3hourAPIData = async (locationToDisplay) => {
    removeWeekSection();
    removeErrorMessage();

    let data5d3h;
    
    await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${locationToDisplay}&units=metric&appid=${APIkey}`)
        .then(response => response.json())
        .then(data => data5d3h = data)
    
        return (data5d3h);
};


const getUserLocation = async () => {
    let location = false;
    let apiKey = 'eb617bdb9e2e2a192a199ff5311d9b78163925f757dfee0bf7bf7e64';

    await fetch(`https://api.ipdata.co?api-key=${apiKey}`)
        .then(response => response.json())
        .then(data => location = data.city)
        .catch((error) => {
            console.error('Error:', error);
        });

    return (location);
}


const getLocationToDisplay = async (isPageLoad) => {
    let locationToDisplay;
    if (isPageLoad) {
        locationToDisplay = await getUserLocation();
        if (locationToDisplay === false) {
            locationToDisplay = domElems.searchInput.value;
        }
        domElems.searchInput.value = locationToDisplay;
    } else {
        locationToDisplay = domElems.searchInput.value;
    }

    return (locationToDisplay);
};


async function processSearch(isPageLoad = false) {
    const locationToDisplay = await getLocationToDisplay(isPageLoad);
    const data5d3hAPI = await fetch5day3hourAPIData(locationToDisplay);

    if (data5d3hAPI.cod !== "200") {
        showErrorMsg(data5d3hAPI.message);
        return ;
    }

    const dataOneCallAPI = await fetchOneCallAPIData(data5d3hAPI);
    const currentWeatherData = parseOneCallAPIData(dataOneCallAPI);
    
    // TESTING ---
    // const useDummyOneCallAPIData = false;
    // const currentWeatherData = useDummyOneCallAPIData ?
    // parseOneCallAPIData(dummyOneCallAPIData) :
    // parseOneCallAPIData(dataOneCallAPI);
    // ---
    
    createCurrentWeatherDiv(currentWeatherData, dataOneCallAPI);
    const comingDaysData = parse5day3hourAPIData(data5d3hAPI);
    createComingDaysSection(comingDaysData);
};


// run search without triggering an event to not start with an empty page
window.onload = processSearch(true);


// EVENT LISTENERS

domElems.searchInput.addEventListener("focus", () => {
    domElems.cursor.style.display = "none";
    domElems.searchButtonImg.style.opacity = "1";
})

domElems.searchInput.addEventListener("blur", () => {
    domElems.cursor.style.display = "inline";
    domElems.searchButtonImg.style.opacity = ".5";
})

document.querySelector(".search-button").addEventListener("click", processSearch);

window.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        domElems.searchInput.blur();
        processSearch();
    }
});

window.addEventListener("scroll", () => {
    const scrolledPx = window.scrollY;
    const background = document.querySelector(".background");
    background.style.top = - (scrolledPx * .5) + "px";
})

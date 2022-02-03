// IMPORTS

import dummyOneCallAPIData from "./dummyOneCallAPIData.js";
import { getLocationInfo } from "./getLocationInfo.js";
import { createCurrentWeatherDiv } from "./current-weather.js";
import { createComingDaysSection } from "./coming-days.js";
import "../sass/style.scss";


// GLOBAL VARIABLES

export const APIkey = "be9f3e7fb99ef3d5a6cdca04ec93f7de";

export const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

export const domElems = {
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
            continue;
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


const parse5day3hourAPIData = weatherData => {
    if (weatherData.cod !== "200") {
        showErrorMsg(weatherData.message);
        return;
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


const fetch5day3hourAPIData = async (locationToDisplay) => {
    let data5d3h;

    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${locationToDisplay.lat}&lon=${locationToDisplay.lon}&appid=${APIkey}`)
        .then(response => response.json())
        .then(data => data5d3h = data)

    return (data5d3h);
};


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


const fetchOneCallAPIData = async searchedLocation => {
    let dataOneCallAPI;

    await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${searchedLocation.lat}&lon=${searchedLocation.lon}&units=metric&appid=${APIkey}`)
        .then(response => response.json())
        .then(data => dataOneCallAPI = data);

    return (dataOneCallAPI);
}


const processSearch = async (isPageLoad = false) => {
    removeWeekSection();
    removeErrorMessage();

    const searchedLocationInfo = await getLocationInfo(isPageLoad);
    if (searchedLocationInfo.error) {
        showErrorMsg(searchedLocationInfo.error);
        return;
    }

    const dataOneCallAPI = await fetchOneCallAPIData(searchedLocationInfo);
    const currentWeatherData = parseOneCallAPIData(dataOneCallAPI);
    createCurrentWeatherDiv(searchedLocationInfo, currentWeatherData, dataOneCallAPI);

    const data5d3hAPI = await fetch5day3hourAPIData(searchedLocationInfo);
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

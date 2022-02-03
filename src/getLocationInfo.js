import { APIkey, domElems } from "./index.js";

const getCoordinates = async location => {
    let error = false;

    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location.city}&appid=${APIkey}`)
        .then(response => response.json())
        .then(data => {
            location.lat = data[0].lat;
            location.lon = data[0].lon;
            location.country = data[0].country;
            location.name = data[0].name;
            location.state = data[0].state;
        })
        .catch((e) => {
            console.error('Error:', e);
            error = true;
        });

    if (error) {
        location.error = "Location not found";
    }
};


const tryGetUserLocation = async () => {
    let location = {
        userLocationRetrieved: false,
    };

    let ipdataAPIkey = 'eb617bdb9e2e2a192a199ff5311d9b78163925f757dfee0bf7bf7e64';

    await fetch(`https://api.ipdata.co?api-key=${ipdataAPIkey}`)
        .then(response => response.json())
        .then(data => {
            location.userLocationRetrieved = true;
            location.city = data.city;
            location.country = data.country_code;
            location.name = data.city;
            location.lat = data.latitude;
            location.lon = data.longitude;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    return (location);
}


export const getLocationInfo = async (isPageLoad) => {
    let location = {
        userLocationRetrieved: false,
    };

    if (isPageLoad) {
        location = await tryGetUserLocation();
        if (location.userLocationRetrieved === true) {
            domElems.searchInput.value = location.city;
            return (location);
        }
    }

    location.city = domElems.searchInput.value;
    await getCoordinates(location);

    return (location);
};

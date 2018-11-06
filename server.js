'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/location', (request, response) => {
  getLocation(request.query.data)
    .then(res => response.send(res))
    .catch(error => handleError(error, response));
})

app.get('/weather', getWeather);

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function getLocation(query){
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API}`;
    return superagent.get(url)
        .then(res => {
            return new Location(res.body.results[0].geometry.location.lat, res.body.results[0].geometry.location.lng)
        })
}

// Previous code from class 6, refactor this as shown below in two steps
// function searchToLatLong(query) {
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

//   return superagent.get(url)
//     .then(res => {
//       return {
//         search_query: query,
//         formatted_query: res.body.result[0].formatted_address,
//         latitude: res.body.results[0].geometry.location.lat,
//         longitude: res.body.results[0].geometry.location.lng
//       }
//     })
//     .catch(error => handleError(error));
// }

// Refactor into this function, part 1 of 2
function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API}`;

  return superagent.get(url)
    .then(res => {
      return new Location(query, res);
    })
    .catch(error => handleError(error));
}

// Refactor into this model, part 2 of 2
function Location(lat, lng) {
//   this.search_query = query;
//   this.formatted_query = res.body.result[0].formatted_address;
  this.latitude = lat;
  this.longitude = lng;
}

// Previous code from class 6, refactor this as shown below in two steps
// function getWeather(request, response) {
//   const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${request.query.data.latitude},${request.query.data.longitude}`;
//   console.log('url', url);

//   return superagent.get(url)
//     .then(result => {
//       const weatherSummaries = [];

//       result.body.daily.data.forEach(day => {
//         const summary =  {
//           forecast: day.summary,
//           time: new Date(day.time * 1000).toString().slice(0, 15)
//         }

//         weatherSummaries.push(summary);
//       });

//       response.send(weatherSummaries);
//     })
//     .catch(error => handleError(error, response));
// }

// Refactor into this, part 1 of 2
// Note the refactor from .forEach to .map
// It may be beneficial not to demo the refactor from .forEach to .map
function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${request.query.data.latitude},${request.query.data.longitude}`;

  return superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        const summary = new Weather(day);
        weatherSummaries.push(summary);
      });

      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}

// Refactoring will also include the creation of Models, so make sure to review construcor functions
// Part 2 of 2
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

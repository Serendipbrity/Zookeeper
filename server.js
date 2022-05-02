// because it's an npm package we will use require
const express = require('express');
// create a route that the front end can request from
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
// to instantiate/represent the server. assign express() to app variable so we can chain on methods to the express.js server
const app = express();



function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // save animalsArray as filteredResults
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // save personalityTraits as a dedicated array
        // If personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // loop through each trait in the personalityTraits array
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results
    return filteredResults;
}

// findById() takes in the id and array of animals and returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}
// add to route
// the get() method requires two arguments. First is a string that describes the route the client will fetch from. 
// second is a callback function that will execute every time that route is accessed with a GET request
app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
      results = filterByQuery(req.query, results);
  }  
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
        res.send(404);
    }
});
// chain listen() method to make the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
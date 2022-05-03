const fs = require('fs');
// path is a module built into node.js API that provides utilities for working with the file and directory paths. It makes working with our file system more predictable especially with heroku
const path = require('path');

// because it's an npm package we will use require
const express = require('express');
// create a route that the front end can request from
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
// to instantiate/represent the server. assign express() to app variable so we can chain on methods to the express.js server
const app = express();

// parse incoming string or array data so it can be accessed by req.body object. extended: true option inside method informs server that there may besub-array data nested so look deeper into POST
app.use(express.urlencoded({ extended: true }));
// parse incoming json data. takes incoming post data in the form of json and parses it into the req.body object
app.use(express.json());


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
// create a function that accepts the POST routes req.body value and array
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    // method
    fs.writeFileSync(
        // method to join value __dirname (represents the file we execute code in) with the path to the animals.json file
        path.join(__dirname, './data/animals.json'),
        // convert array with json.stringify() so we can save array data as json. null and 2 are arguments which keep data formatted. null argument means we dont edit any existing data. 2 creates white space between values to make it more readable
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    // return finished code to post route for response
    return animal;
}

//function to validate if new animal data from req.body has a key that exists and is the right type of data
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !=='string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false
    }
    return true;
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
// a second route for a second type of GET request. This is a more specific request
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
        res.send(404);
    }
});

// set up new route on server that accepts data to be used or stored server side
app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();
    //if any data in req.body is inccorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        // response method to relay message to client. 400 range error means user error not server
        res.status(400).send('The animal is not properly formatted.');
    } else {
    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);
    // req.body is where our incoming content will be
    res.json(req.body);
    }
});
// chain listen() method to make the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
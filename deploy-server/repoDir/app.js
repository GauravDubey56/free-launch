const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

let requestCount = 0;

app.get('/', (req, res) => {
    requestCount++;
    console.log(`Request Count: ${requestCount}`);
    console.log('Query Params:', req.query);
    res.send('GET request received');
});

app.post('/', (req, res) => {
    requestCount++;
    console.log(`Request Count: ${requestCount}`);
    console.log('Request Body:', req.body);
    res.send('POST request received');
});

app.put('/', (req, res) => {
    requestCount++;
    console.log(`Request Count: ${requestCount}`);
    console.log('Request Body:', req.body);
    res.send('PUT request received');
});

app.get('/reqCount', (req, res) => {    
    res.send(`Request Count: ${requestCount}`);
});

app.post('/reset', (req, res) => {
    requestCount = 0;
    res.send('Request Count has been reset');
});

app.get('/bajaj', (req, res) => {
    res.send('Bajaj');
});


app.get('/riya', (req, res) => {
    res.send('riya');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
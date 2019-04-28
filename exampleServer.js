var express = require('express');

var app = express();

app.use('/a-wc-router/examples', express.static('examples'));
app.use('/a-wc-router/build', express.static('build'));
app.use('/a-wc-router/src', express.static('src'));

function spaHandler(req, res) {
    res.sendFile(`${__dirname}/examples/${req.params.example}/index.html`);
};

function main(req, res) {
    res.sendFile(`${__dirname}/examples/index.html`);
};

app.get('/a-wc-router/examples/', main);
app.get('/a-wc-router/examples/index.html', main);
app.get('/a-wc-router/examples/:example', spaHandler);
app.get('/a-wc-router/examples/:example/*', spaHandler);

app.listen(process.env.PORT || 3000);
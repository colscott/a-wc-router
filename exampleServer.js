var express = require('express');

var app = express();

app.use('/routing-wc/examples', express.static('examples'));
app.use('/routing-wc/build', express.static('build'));
app.use('/routing-wc/src', express.static('src'));

function spaHandler(req, res) {
    res.sendFile(`${__dirname}/examples/${req.params.example}/index.html`);
};

function main(req, res) {
    res.sendFile(`${__dirname}/examples/index.html`);
};

app.get('/routing-wc/examples/', main);
app.get('/routing-wc/examples/index.html', main);
app.get('/routing-wc/examples/:example', spaHandler);
app.get('/routing-wc/examples/:example/*', spaHandler);

app.listen(process.env.PORT || 3000);
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

app.get('/app/examples/', main);
app.get('/app/examples/index.html', main);
app.get('/app/examples/:example', spaHandler);
app.get('/app/examples/:example/*', spaHandler);

app.listen(process.env.PORT || 3000);
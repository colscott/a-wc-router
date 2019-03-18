var express = require('express');

var app = express();

app.use('/examples', express.static('examples'));
app.use('/build', express.static('build'));
app.use('/src', express.static('src'));

function spaHandler(req, res) {
    res.sendFile(`${__dirname}/examples/${req.params.example}/index.html`);
};

app.get('/app/examples/:example', spaHandler);
app.get('/app/examples/:example/*', spaHandler);

app.listen(process.env.PORT || 3000);
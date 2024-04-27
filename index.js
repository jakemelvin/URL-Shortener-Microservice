require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
var { MongoClient } = require('mongodb');
const dns = require('dns');
const urlParser = require('url');



// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('url-shortener');
const urls = db.collection('urls');
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  const dnslookup = dns.lookup(urlParser.parse(url).hostname, async (err, adress) => {
    if (!adress) { return res.json({ error: 'invalid url' }); } else {
      const nombreUrl = await urls.countDocuments({})
      const urlDoc = {
        url: url,
        short_url: nombreUrl
      }
      const results = await urls.insertOne(urlDoc);
      res.status(200).json({ original_url: url, short_url: nombreUrl })
      console.log(results)
    }
  })
})
app.get('/api/shorturl/:short',  async(req, res) =>{
  const urlToFind = req.params.short;
  const longUrl = await urls.findOne({ short_url: +urlToFind });
  console.log(longUrl)
  res.redirect(longUrl.url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

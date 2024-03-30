require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlparser = require('url');

// Configs 2
const { MongoClient } = require('mongodb');

// Basic Configuration
const port = process.env.PORT || 3000;

// On this line I hid my MongoDb Password
const url = 'mongodb+srv://gadrawingz:............@cluster0.cwzjxfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const client = new MongoClient(url);

const db = client.db("url-shortener");
const urls = db.collection("urls");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// My first API endpoint
app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  
  dns.lookup(
    urlparser.parse(req.body.url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid Url" });
      } else {
        const urlCount = await urls.countDocuments({});
        const urlDoc = {
          url,
          short_url: urlCount,
        };

        const result = await urls.insertOne(urlDoc);
        console.log(result);
        res.json({ original_url: url, short_url: urlCount });
      }
    },
  );
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
});


// Last Line (I am not concerned)
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

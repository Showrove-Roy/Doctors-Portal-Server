const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Doctors Portals server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.in3ib7y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.listen(port, () => {
  console.log(`Doctors portals server is running on port ${port}`);
});

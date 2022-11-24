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

const run = async () => {
  try {
    // Treatments collection
    const appointmentOptionsCollection = client
      .db("doctors_Portal")
      .collection("appointmentOptions");

    // Users Booking collections
    const bookingsCollection = client
      .db("doctors_Portal")
      .collection("bookings");

    // Users info collections
    const userInfoCollection = client
      .db("doctors_Portal")
      .collection("userInfo");

    // get all appointment Options
    app.get("/appointment", async (req, res) => {
      const date = req.query.date;
      const options = await appointmentOptionsCollection.find({}).toArray();
      const bookingQuery = { appointment_date: date };
      const alradyBooked = await bookingsCollection
        .find(bookingQuery)
        .toArray();
      options.forEach((option) => {
        const optionBooked = alradyBooked.filter(
          (book) => book.treatment_name == option.name
        );

        const bookedSlots = optionBooked.map((book) => book.time_slot);
        const remainingSlots = option.slots.filter(
          (slot) => !bookedSlots.includes(slot)
        );
        option.slots = remainingSlots;
      });

      res.send(options);
    });

    // get single user booking data using email address
    app.get("/bookings", async (req, res) => {
      const date = req.query.date;
      const email = req.query.email;
      const query = { appointment_date: date, email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    // post single booking
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const query = {
        appointment_date: booking.appointment_date,
        email: booking.email,
        treatment_name: booking.treatment_name,
      };

      const alradyBooked = await bookingsCollection.find(query).toArray();
      if (alradyBooked.length) {
        const message = `You already have booked ${booking.treatment_name} service on ${booking.appointment_date}`;
        return res.send({ acknowledged: false, message });
      }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // post user info
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userInfoCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
};

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Doctors portals server is running on port ${port}`);
});

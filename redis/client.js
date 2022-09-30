const { createClient } = require("redis")
const moment = require("moment")

const client = createClient({
  socket: {
    port: 8000,
  },
})

client
  .connect()
  .then(() => console.log("connected to redis locally"))
  .catch((err) => console.log(err.message, ">did not connect"))

module.exports = client

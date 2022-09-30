const startApp = async (connectDB, PORT = process.env.PORT || 4000) => {
  try {
    await connectDB()
    console.log("db connected")
    console.log(`server is running at PORT ${PORT}`)
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = startApp

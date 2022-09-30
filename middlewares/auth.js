const jwt = require("jsonwebtoken")
const auth = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]
    if (!token) {
      return res.status(401).json({
        authorization: false,
        message: "No token Found",
      })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decodedToken
    return next()
  } catch (error) {
    res.status(401).json({ authorization: false, message: error.message })
  }
}

module.exports = auth

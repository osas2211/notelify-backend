module.exports = authenticationFailed = (response, message) => {
  return response.status(401).send({
    authenticated: false,
    message: `User authentication failed: ${message}`,
  })
}

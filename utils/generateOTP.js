const otpGenerator = require("otp-generator")

module.exports.generateOTP = (
  length = 10,
  options = {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: false,
  }
) => {
  const otp = otpGenerator.generate(length, options)

  return otp
}

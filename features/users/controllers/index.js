const axios = require("axios").default
const userModel = require("../model")
const noteModel = require("../../notes/models/index")
const bcrypt = require("bcrypt")
const generateToken = require("../../../utils/generateToken")
const { generateOTP } = require("../../../utils/generateOTP")
const authenticationFailed = require("../../../utils/authenticationFailed")
const { sendEmail } = require("../../../utils/email")
const {
  EmailVerificationTemplate,
} = require("../../../utils/verifyemail_template")
const { config } = require("dotenv")
const { createAvatar } = require("@dicebear/avatars")
const style = require("@dicebear/adventurer-neutral")

/********************************* AUTHENTICATION CONTROLS *********************************/

// POST User Sign Up
const signUp = async (req, res) => {
  const { name, userName, password, email } = req.body
  const otp = generateOTP(15)
  try {
    const encryptedPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({
      name,
      userName,
      password: encryptedPassword,
      email,
      otp: otp,
      avatarURL: createAvatar(style, { dataUri: true }),
    })
    const token = await generateToken({ userName, id: String(user._id) })
    user.token = token

    // Send Email Verification Message.
    const htmlBody = EmailVerificationTemplate(
      `
      ${process.env.BASE_URL}/user/email/verify/${user._id}/${otp}
    `,
      name
    )
    await sendEmail(email, "Verify Email Address", htmlBody)
    res.status(201).json({ userCreated: true, user })
  } catch (err) {
    res.status(400).json({ userCreated: false, message: err.message })
  }
}

// GET Verify Email
const verifyEmail = async (req, res) => {
  const { userID, otp } = req.params

  try {
    const user = await userModel.findById(userID)
    if (user.verified === true) {
      return res
        .status(200)
        .json({ email_verified: true, message: "user is already verified" })
    }
    if (user && user.otp === otp) {
      await user.updateOne({
        $set: { verified: true, otp: user.token.slice(0, 10) },
      })
      return res.status(200).json({ email_verified: true })
    } else {
      return res
        .status(400)
        .json({ email_verified: false, message: "invalid parameters" })
    }
  } catch (error) {
    res.status(400).json({ email_verified: false, message: error.message })
  }
}

// POST User Sign In
const signIn = async (req, res) => {
  const { userName, password } = req.body
  try {
    const user = await userModel.findOne({ userName }).populate("notes")
    if (!user) return authenticationFailed(res, "User does not exist")
    const result = await bcrypt.compare(password, user.password)
    if (!result) return authenticationFailed(res, "Password is incorrect")
    const token = await generateToken({ userName, id: String(user._id) })
    user.token = token
    await user.save()
    return res.status(200).json({ authenticated: true, user })
  } catch (error) {
    return res
      .status(400)
      .json({ authenticated: false, message: error.message })
  }
}

/********************************* IN-APP CONTROLS *********************************/

const getUser = async (req, res) => {
  const userID = req.user.id
  try {
    const user = await userModel.findById(userID).populate("notes")
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const getUsers = async (req, res) => {
  const body = req.body
  try {
    const users = await userModel.find({ _id: body.users })
    if (users?.length !== undefined) return res.status(200).json({ users })
    return res.status(200).json({ users: [users] })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const updateProfile = async (req, res) => {
  const userID = req.user.id
  const image = req.file
  try {
    const user = await userModel.findByIdAndUpdate(
      userID,
      { $set: { avatarURL: image.path } },
      { new: true }
    )

    return res.status(200).json({ success: true, image })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res) => {
  const userID = req.user.id
  const generatedOTP = generateOTP(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  })
  try {
    const user = await userModel.findByIdAndUpdate(userID, {
      $set: { otp: generatedOTP },
    })
    const htmlBody = `
      <p style="text-transform: capitalize;">Hello, ${user.name}</p>
      <p>Your password reset pin is down below.</p>
      <h2>${generatedOTP}</h2>
      <p>If you didn't ask to reset your password, you can ignore this mail.</p>
      <div>
        <p>Best Regards,</p>
        <p>Notelify.</p>
      </div>
    `
    await sendEmail(user.email, "Reset Password", htmlBody)
    res.status(200).json({
      success: true,
      message: `Password Reset pin sent to your email ${user.email}`,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const verifyPasswordResetPin = async (req, res) => {
  const userID = req.user.id
  const { password, otp } = req.body
  try {
    const user = await userModel.findById(userID)
    const encryptedPassword = await bcrypt.hash(password, 10)
    if (user && user.otp === otp) {
      await user.updateOne({
        $set: { password: encryptedPassword, otp: user.token.slice(0, 10) },
      })
      return res.status(200).json({ password_reset: true })
    } else {
      return res
        .status(400)
        .json({ password_reset: false, message: "invalid otp" })
    }
  } catch (error) {
    res.status(400).json({ password_reset: false, message: error.message })
  }
}

const deleteAccount = async (req, res) => {
  const userID = req.user.id
  try {
    const user = await userModel.findById(userID)

    //Delete all user notes
    user.notes.forEach(async (noteID) => {
      try {
        await axios.delete(`${process.env.BASE_URL}/notes/${noteID}`, {
          headers: req.headers,
        })
      } catch (error) {
        console.log(error)
      }
    })

    //Leave all notes user is collaborating on.
    user.collab_notes.forEach(async (noteID) => {
      try {
        await axios.post(
          `${process.env.BASE_URL}/notes/${noteID}/leave-collaboration`,
          {},
          { headers: req.headers }
        )
      } catch (error) {
        console.log(error)
      }
    })

    // Delete User
    await user.delete()
    res.status(200).json({ deleted: true, message: "user has been deleted" })
  } catch (error) {
    res.status(400).json({ deleted: false, message: error.message })
  }
}

const userControls = {
  signUp,
  verifyEmail,
  signIn,
  getUser,
  getUsers,
  updateProfile,
  resetPassword,
  verifyPasswordResetPin,
  deleteAccount,
}

module.exports = userControls

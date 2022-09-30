const express = require("express")
const userControls = require("../controllers")
const router = express.Router()
const auth = require("../../../middlewares/auth")
const multer = require("multer")
const cloudinaryStorage = require("../../../utils/cloudinary_setup")
const upload = multer({ storage: cloudinaryStorage("notes_profile_images") })

router.post("/signup", userControls.signUp)
router.get("/email/verify/:userID/:otp", userControls.verifyEmail)
router.post("/signin", userControls.signIn)
router.get("/", auth, userControls.getUser)
router.post("/", userControls.getUsers)
router.put(
  "/update-profile",
  auth,
  upload.single("image"),
  userControls.updateProfile
)
router.post("/reset-password", auth, userControls.resetPassword)
router.post(
  "/reset-password/verify-pin",
  auth,
  userControls.verifyPasswordResetPin
)
router.delete("/delete", auth, userControls.deleteAccount)

module.exports = router

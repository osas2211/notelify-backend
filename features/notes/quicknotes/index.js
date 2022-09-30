const express = require("express")
const userModel = require("../../users/model")
const auth = require("../../../middlewares/auth")
const router = express.Router()

/************************  ROUTES and CONTROLLERS ************************/

// POST create quickNote
router.post("/quick-note", async (req, res) => {
  const userID = req.user.id
  const text = req.body.text
  try {
    if (text !== "") {
      const user = await userModel.findByIdAndUpdate(
        userID,
        {
          $push: { quicknotes: { body: text } },
        },
        { new: true }
      )
      res.status(200).json({
        created: true,
        user: user.quicknotes,
      })
    }
  } catch (error) {
    res.status(400).json({ created: false, message: error.message })
  }
})

// POST create quickNote
router.get("/quicknotes", async (req, res) => {
  const userID = req.user.id
  try {
    const user = await userModel.findById(userID)
    res.status(200).json({
      quicknotes: user.quicknotes,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update quickNote
router.put("/quick-note/:id", async (req, res) => {
  const quickNoteID = req.params.id
  const userID = req.user.id
  const text = req.body.text
  try {
    const user = await userModel.findById(userID)
    const quicknotes = user.quicknotes.map((quicknote) => {
      if (quicknote._id == quickNoteID) {
        quicknote.body = text
      }
      return quicknote
    })
    user.quicknotes = quicknotes
    await user.save()
    res.status(200).json({
      updated: true,
      user: user.quicknotes,
    })
  } catch (error) {
    res.status(400).json({ updated: false, message: error.message })
  }
})

// DELETE delete quicknote
router.delete("/quick-note/:id", async (req, res) => {
  const quickNoteID = req.params.id
  const userID = req.user.id
  try {
    const user = await userModel.findByIdAndUpdate(
      userID,
      {
        $pull: { quicknotes: { _id: quickNoteID } },
      },
      { new: true }
    )
    await user.save()
    res.status(200).json({
      deleted: true,
      user: user.quicknotes,
    })
  } catch (error) {
    res.status(400).json({ deleted: false, message: error.message })
  }
})

module.exports = router

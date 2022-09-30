const express = require("express")
const noteControls = require("../controllers")
const router = express.Router()

router.post("/create-note", noteControls.createNote)
router.get("/notes/:noteID", noteControls.getNote)
router.get("/notes", noteControls.getNotes)
router.get("/collab-notes", noteControls.getCollabNotes)
router.delete("/notes/:noteID", noteControls.deleteNote)
router.post("/notes/invite", noteControls.inviteCollaborator)
router.post("/notes/:noteID/accept-invitation", noteControls.acceptInvitation)
router.post("/notes/:noteID/reject-invitation", noteControls.rejectInvitation)
router.post(
  "/notes/:noteID/leave-collaboration",
  noteControls.leaveCollaboration
)

module.exports = router

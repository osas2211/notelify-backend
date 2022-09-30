const noteModel = require("../models")
const userModel = require("../../users/model")
const { sendEmail } = require("../../../utils/email")
const { invitationEmail } = require("../../../utils/invitationEmail_template")

const updateFunc = async (id, field, content, request, response) => {
  const note = await noteModel.findById(id)
  // if (String(note.owner) === request.user.id) {
  //   await note.updateOne(
  //     { $set: { [field]: content, last_edited: new Date().toISOString() } },
  //     { new: true }
  //   )
  //   note[field] = content
  //   return response.status(200).json({ updated: true, note: note })
  // } else {
  //   return response
  //     .status(401)
  //     .json({ updated: false, message: "Unauthorized Request" })
  // }
  await note.updateOne(
    { $set: { [field]: content, last_edited: new Date().toISOString() } },
    { new: true }
  )
  note[field] = content
  return response.status(200).json({ updated: true, note: note })
}

// ****************************** CRUD CONTROLS ******************************

// POST Create a Note
const createNote = async (req, res) => {
  const userID = req.user.id
  const { label, imgUrl, textContent } = req.body
  try {
    const note = await noteModel.create({
      label,
      imgUrl,
      textContent,
      owner: userID,
      last_edited: new Date().toISOString(),
    })
    await userModel.findByIdAndUpdate(userID, {
      $push: { notes: note.id },
    })
    res.status(201).json({ created: true, note })
  } catch (error) {
    res.status(400).json({ created: false, message: error.message })
  }
}

//GET Get Note
const getNote = async (req, res) => {
  const noteID = req.params.noteID
  try {
    const note = await noteModel.findById(noteID)
    res.status(200).json({ success: true, note })
  } catch (error) {
    res.status(404).json({ success: false, message: error.message })
  }
}

//GET Get Notes
const getNotes = async (req, res) => {
  try {
    const notes = await noteModel.find({ owner: req.user.id }).sort("-created") //.populate("owner")
    return res.status(200).json({ success: true, notes })
  } catch (error) {
    res.status(404).json({ success: false, message: error.message })
  }
}

//GET Get Notes
const getCollabNotes = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).populate("collab_notes")
    //.populate("owner")
    return res.status(200).json({ success: true, notes: user.collab_notes })
  } catch (error) {
    res.status(404).json({ success: false, message: error.message })
  }
}

// PUT Update Note
const updateNote = async (req, res) => {
  const { label, textContent, imgUrl, favourite, archive } = req.body
  const noteID = req.params.noteID
  try {
    if (label) {
      return await updateFunc(noteID, "label", label, req, res)
    }
    if (textContent) {
      return await updateFunc(noteID, "textContent", textContent, req, res)
    }
    if (favourite !== undefined) {
      return await updateFunc(noteID, "favourite", favourite, req, res)
    }
    if (archive !== undefined) {
      return await updateFunc(noteID, "archive", archive, req, res)
    }
  } catch (error) {
    res.status(400).json({ updated: false, message: error.message })
  }
}

// DELETE Delete Note
const deleteNote = async (req, res) => {
  const noteID = req.params.noteID
  try {
    const note = await noteModel.findById(noteID)
    const owner = note.owner
    if (String(owner) === req.user.id) {
      const collaborators = note.collaborators

      // remove note ref from owner's notes
      await userModel.findByIdAndUpdate(owner, { $pull: { notes: noteID } })

      // remove note ref from collaborators collab_notes.
      await userModel.updateMany(
        { _id: collaborators },
        { $pull: { collab_notes: noteID } }
      )

      // delete note
      await noteModel.findByIdAndDelete(noteID)
      res.status(200).json({ deleted: true })
    } else {
      res.status(401).json({ deleted: false, message: "Unauthorized request." })
    }
  } catch (error) {
    res.status(400).json({ deleted: false, message: error.message })
  }
}

// *************************** COLLABORATION CONTROLS ***************************

// PUT Invite Collaborators
const inviteCollaborator = async (req, res) => {
  const ownerID = req.user.id
  const userName = req.body.userName
  const noteID = req.body.noteID
  try {
    const owner = await userModel.findById(ownerID)
    const user = await userModel.findOne({ userName })
    const note = await noteModel.findById(noteID)
    const isInvited = user.invitations.some((invitation) => {
      if (String(invitation.noteID) === noteID) return true
      else return false
    })
    const isCollaborator = note.collaborators.includes(String(user._id))
    const htmlBody = invitationEmail(
      `
      ${process.env.BASE_URL}/notes/${note._id}/accept-invitation
    `,
      user.name,
      owner.userName,
      note.label
    )

    //send invitation only if the noteID does not appear in user invitations
    //or user is not a note collaborator
    if (isCollaborator) {
      return res.status(400).json({
        invitation_sent: false,
        message: "User is already a Collaborator",
      })
    }
    if (!isInvited) {
      // add invitation to user's invitations
      await user.updateOne(
        {
          $push: {
            invitations: {
              ownerID: ownerID,
              noteID: noteID,
              ownerUserName: owner.userName,
              label: note.label,
              ownerImg: owner.avatarURL,
            },
          },
        },
        { new: true }
      )
      // send Email
      await sendEmail(user.email, "Invitation - Note Collaboration", htmlBody)

      owner.password = null
      owner.token = null
      return res
        .status(200)
        .json({ invitation_sent: true, message: "Invitation sent" })
    }
    return res.status(400).json({
      invitation_sent: false,
      message: "User has already been Invited",
    })
  } catch (error) {
    res.status(400).json({ invitation_sent: false, message: error.message })
  }
}

// POST Accept Invitation
const acceptInvitation = async (req, res) => {
  const noteID = req.params.noteID
  const userID = req.user.id
  try {
    const user = await userModel.findById(userID)
    const note = await noteModel.findById(noteID)
    const isCollaborator = note.collaborators.includes(String(user._id))
    const isInvited = user.invitations.some((invitation) => {
      if (String(invitation.noteID) === noteID) return true
      else return false
    })

    if (isCollaborator) {
      return res.status(400).json({
        accepted: false,
        message: "You're already a Collaborator",
      })
    }
    if (isInvited) {
      // Add note to collab notes
      await user.updateOne(
        {
          $push: { collab_notes: noteID },
          // remove invitation since it's now accepted
          $pull: { invitations: { noteID: noteID } },
        },
        { new: true }
      )

      // add collaborator to notes collaborators
      await note.updateOne(
        {
          $push: { collaborators: userID },
        },
        { new: true }
      )
      user.password = null
      user.token = null
      return res
        .status(200)
        .json({ accepted: true, message: "You've accepted this invitation" })
    }
    return res.status(400).json({
      accepted: false,
      message: "You've not been invited to collaborate in this note",
    })
  } catch (error) {
    res.status(400).json({ accepted: false, message: error.message })
  }
}

const rejectInvitation = async (req, res) => {
  const userID = req.user.id
  const noteID = req.params.noteID
  try {
    await userModel.findByIdAndUpdate(userID, {
      $pull: { invitations: { noteID: noteID } },
    })
    res.status(200).json({ success: true, message: "Invitation rejected" })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const leaveCollaboration = async (req, res) => {
  const userID = req.user.id
  const noteID = req.params.noteID
  try {
    await userModel.findByIdAndUpdate(userID, {
      $pull: { collab_notes: noteID },
    })
    await noteModel.findByIdAndUpdate(noteID, {
      $pull: { collaborators: userID },
    })
    res.status(200).json({
      success: true,
      message: "You've left this note as a collaborator",
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const noteControls = {
  createNote,
  getNote,
  getNotes,
  getCollabNotes,
  updateNote,
  deleteNote,
  inviteCollaborator,
  acceptInvitation,
  rejectInvitation,
  leaveCollaboration,
}

module.exports = noteControls

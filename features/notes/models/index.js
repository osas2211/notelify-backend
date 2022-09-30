const { Schema, model } = require("mongoose")

const noteSchema = new Schema({
  label: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  textContent: {
    type: String,
  },
  favourite: {
    type: Boolean,
    default: false,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: String,
    default: new Date().toISOString(),
  },
  last_edited: {
    type: String,
    default: new Date().toISOString(),
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
})

module.exports = model("Note", noteSchema)

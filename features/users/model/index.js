const { Schema, model } = require("mongoose")

const reference_notes = {
  type: Schema.Types.ObjectId,
  ref: "Note",
}

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email already exist"],
  },
  userName: {
    type: String,
    maxLength: [20, "username characters must not exceed 20"],
    minLength: [4, "username characters must not be below 4"],
    required: [true, "userName is required"],
    unique: [true, "userName already exist"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
  },
  avatarURL: {
    type: String,
    default: "",
  },

  notes: [reference_notes],
  collab_notes: [reference_notes],
  quicknotes: [
    new Schema({
      body: {
        type: String,
        min: [5, "total characters must be more than 5"],
        max: [300, "total characters must be less than 300"],
      },
      created: {
        type: String,
        default: new Date().toISOString(),
      },
    }),
  ],

  invitations: [
    new Schema({
      noteID: {
        type: String,
      },
      ownerID: {
        type: String,
      },
      ownerUserName: {
        type: String,
      },
      label: {
        type: String,
      },
      ownerImg: {
        type: String,
      },
    }),
  ],

  token: {
    type: String,
  },
  otp: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: "light",
  },
})

module.exports = model("User", userSchema)

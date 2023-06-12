const contactSchema = new (require("mongoose").Schema)(
    {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      mobile: {
        type: Number,
        required: false,
      },
      subject: {
        type: String,
        required: false,
      },
      message: { type: String, required: false },
    },
    {
      timestamps: true,
    }
  );
  
  const Contact = require("mongoose").model("Contact", contactSchema);
  
  module.exports = Contact;
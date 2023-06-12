const mailSchema = new (require("mongoose").Schema)(
    {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      
      message: { type: String, required: false },
    },
    {
      timestamps: true,
    }
  );
  
  const Mail = require("mongoose").model("Mail", mailSchema);
  
  module.exports = Mail;
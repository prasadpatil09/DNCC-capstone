import mongoose from 'mongoose';

const contactschema = new mongoose.Schema({
  contactname: { type: String, required: true },
  contactmail: { type: String, required: true },
  contactmessage: { type: String, required: true }
});

const Contact = mongoose.model("Contact", contactschema);

export { Contact };

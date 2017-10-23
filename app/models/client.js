import mongoose, {Schema} from 'mongoose';

const ClientSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  }
});

class ClientClass {
}

ClientSchema.loadClass(ClientClass);

export const ClientModel = mongoose.model('Client', ClientSchema);

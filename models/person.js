const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(`Error connecting to mongoDB: ${err}`))

const personSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name must be at least 3 characters'],
    minLength: 3
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{8}/.test(v)
      },
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'User phone number is required'],
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
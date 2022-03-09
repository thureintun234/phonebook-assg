require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

morgan.token('data', (req, res) => {
  return JSON.stringify(req.body)
})

// logger middleware
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  const html = `
  <p>Phonebooks has info for ${persons.length} people</p>
  <p>${new Date().toUTCString()}</p>
  `
  response.send(html)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const updatedPerson = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(id, updatedPerson, { new: true, runValidators: true, context: 'query' })
    .then(result => {
      response.json(result)
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body) {
    return response.status(400).send('Please provide contact info')
  }

  let checkDuplicateName;
  Person.findOne({ name: body.name }).then(result => {
    checkDuplicateName = result
  })
  if (checkDuplicateName) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save()
    .then(returnedPerson => {
      response.json(returnedPerson)
    })
    .catch(err => next(err))
})


// middlewares
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, request, response, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return response.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
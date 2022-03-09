const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

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
  response.json(persons)
})

app.get('/info', (request, response) => {
  const html = `
  <p>Phonebooks has info for ${persons.length} people</p>
  <p>${new Date().toUTCString()}</p>
  `
  response.send(html)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body);

  if (!body) {
    return response.status(400).send('Please provide contact info')
  }

  const checkDuplicateName = persons.find(person => person.name === body.name)
  if (checkDuplicateName) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
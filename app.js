const express = require('express')
const crypto = require('node:crypto')
const cors = require('node:cors')
const movies = require('./movies')
const { validateMovie, validatePartialMovies } = require('./schemas/movies')

const app = express()
app.use(express.json())
const PORT = process.env.PORT ?? 1234
app.disable('x-powered-by')
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }
  }
}))


app.get('/movies', (req, res) => {

  const { genre } = req.query

  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ msg: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: result.error.message })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }


  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovies(req.body)

  if (result.error) {
    return res.status(400).json({ error: result.error.message })
  }

  const { id } = req.params
  const movieIdx = movies.findIndex(movie => movie.id === id)

  if (movieIdx < 0) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIdx],
    ...result.data
  }

  movies[movieIdx] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {

  const { id } = req.params
  const movieIdx = movies.findIndex(movie => movie.id === id)

  if (movieIdx < 0) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIdx, 1)

  return res.json({ message: 'Movie deleted' })
})


app.listen(PORT, () => {
  console.log(`server listeningon port http://localhost:${PORT}`)
})

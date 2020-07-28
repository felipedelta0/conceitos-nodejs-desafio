const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRequestID (request, response, next) {
  const { id } = request.params

  if (!isUuid(id))
    return response.status(400).send()

  return next()
}

function logRequest (request, response, next) {
  const { method, url } = request

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)

  next()

  console.timeEnd(logLabel)
}

app.use(logRequest)
app.use('/repositories/:id', validateRequestID)

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body
  const repository = { id: uuid(), title, url, techs, likes: 0 }

  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params
  const { title, url, techs } = request.body
  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  if (repositoryIndex < 0)
    return response.status(400).send()

  const repository = { ...repositories[repositoryIndex], id, title, url, techs }

  repositories[repositoryIndex] = repository

  return response.json(repository)
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params
  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  if (repositoryIndex < 0)
    return response.status(400).send()

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", validateRequestID, (request, response) => {
  const { id } = request.params
  const repositoryIndex = repositories.findIndex(repo => repo.id === id)

  if (repositoryIndex < 0)
    return response.status(400).send()

  const likes = ++repositories[repositoryIndex].likes

  return response.json({ likes })
});

module.exports = app;

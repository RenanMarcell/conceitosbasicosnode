const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const validate_repository = (request, response, next) => {
    if (
        !'title' in request.body
        || !'url' in request.body
        || !'techs' in request.body
    ) {
        return response.status(400).json(
            { 'error': 'Repository missing required fields'}
        );
    }
    next();
}

const find_repository = (req, res, next) => {
    let repository_found = false;
    repositories.forEach((project, idx) => {
        if (project.id === req.params.id) {
            req.index = idx;
            repository_found = true;
        }
    });

    if (!repository_found) return res.status(400).json(
        { 'error': 'Repository not found'}
    );

    return next();
};

app.get("/repositories", (request, response) => response.send(repositories));

app.post("/repositories", validate_repository, (request, response) => {
    const { title, url, techs } = request.body;
    const repository = {
        title,
        url,
        techs,
        likes: 0,
        id: uuid()
    }
    repositories.push(repository);
    return response.status(202).send(repository);
});

app.put("/repositories/:id", find_repository, (request, response) => {
    const { title, url, techs } = request.body;
    repositories[request.index] = { ...repositories[request.index], title, url, techs }
    return response.status(200).send(repositories[request.index]);
});

app.delete("/repositories/:id", find_repository, (request, response) => {
    repositories.splice(request.index, 1);
    return response.status(204).send();
});

app.post("/repositories/:id/like", find_repository, (request, response) => {
    repositories[request.index].likes++;
    return response.status(200).send(repositories[request.index]);
});

module.exports = app;

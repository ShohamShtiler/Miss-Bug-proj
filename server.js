import express from 'express'
import { bugService } from './services/bugService.js'

const app = express()
app.use(express.json())

app.get('/api/bug', (req, res) => {
    bugService.query().then(bugs => res.json(bugs))
})

app.get('/api/bug/save', (req, res) => {
    const bug = req.query
    if (bug.severity) bug.severity = +bug.severity
    bugService.save(bug).then(savedBug => res.json(savedBug))
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    bugService.getById(bugId).then(bug => {
        if (!bug) return res.status(404).send('Bug not found')
        res.json(bug)
    })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    bugService.remove(bugId).then(() => res.send('Bug removed'))
})

app.get('/', (req, res) => {
    res.send('Bug API is running 🚀')
})


app.listen(3030, () => {
    console.log('Server ready at port 3030')
})
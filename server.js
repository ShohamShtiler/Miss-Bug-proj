import express, { json } from 'express'
import { bugService } from './services/bugService.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'
const app = express()

app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.json(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot load bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bug = req.query
    if (bug.severity) bug.severity = +bug.severity
    bugService.save(bug)
        .then(savedBug => res.json(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    var visitedBugs = req.cookies.visitedBugs || []

    if (typeof visitedBugs === "string") {
        try {
            visitedBugs = JSON.parse(visitedBugs)
        } catch {
            visitedBugs = []
        }
    }

    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)

    if (visitedBugs.length > 3) {
        console.log('⚠️ User visited too many bugs:', visitedBugs)
        return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
        maxAge: 7000,
        httpOnly: false
    })

    console.log('✅ User visited Bugs', visitedBugs)


    bugService.getById(bugId).then(bug => {
        if (!bug) return res.status(404).send('Bug not found')
        res.json(bug)
    })
})


app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    bugService.remove(bugId)
        .then(() => res.send('Bug removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

app.get('/', (req, res) => {
    res.send('Bug API is running 🚀')
})


app.listen(3030, () => {
    loggerService.info('Server ready at http://localhost:3030/')
})
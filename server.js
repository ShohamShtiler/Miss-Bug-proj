import express, { json } from 'express'
import { bugService } from './services/bugService.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        pageIdx: +req.query.pageIdx || 0,
        sortBy: req.query.sortBy || '',
        sortDir: req.query.sortDir || 1,
        labels: req.query.labels
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot load bugs')
        })
})

app.post('/api/bug', (req, res) => {
    const bugToSave = req.body

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = req.body

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

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => {
            console.error('Cannot update bug', err)
            res.status(500).send('Cannot update bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            console.error('Cannot get bug', err)
            res.status(500).send('Cannot load bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

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
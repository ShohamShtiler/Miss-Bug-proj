import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bugService.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/userService.js'
import { authService } from './services/authService.js'
import { requiredAuth } from './middlewares/requiredAuth.middleWare.js'


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

app.post('/api/bug', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    const bug = req.body
    delete loggedinUser.username
    bug.creator = loggedinUser

    bugService.save(bug)
        .then(addedBug => res.send(addedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})


app.put('/api/bug', requiredAuth, (req, res, next) => {
    const { loggedinUser } = req
    const bugToSave = req.body
    const bugId = bugToSave._id

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

    bugService.save(bugToSave, loggedinUser)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Had issues:', err)
            res.status(400).send('Cannot save bug')
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

app.delete('/api/bug/:bugId', requiredAuth, (req, res) => {
    const { loggedinUser } = req
    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`Bug id : ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(401).send('Cannot remove bug')
        })
})


app.get('/', (req, res) => {
    res.send('Bug API is running 🚀')
})


app.listen(3030, () => {
    loggerService.info('Server ready at http://localhost:3030/')
})

//* ------------------- Auth API -------------------


app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    // console.log('credentials:', credentials)


    userService.signup(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(401).send('Cannot signup')
        })
})




app.post('/api/auth/login', (req, res) => {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(401).send('Cannot login')
        })
})


app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})



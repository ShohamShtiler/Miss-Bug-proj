import { utilService } from "./utilService.js"
import fs from 'fs'

const BUGS_FILE = 'data/bug.json'
const bugs = utilService.readJsonFile(BUGS_FILE)

export const bugService = {
    query,
    getById,
    remove,
    save
}

export function query(filterBy = {}) {
    var filterBugs = bugs

    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        filterBugs = filterBugs.filter(bug => regex.test(bug.title))
    }

    if (filterBy.minSeverity) {
        const min = +filterBy.minSeverity
        filterBugs = filterBugs.filter(bug => bug.severity >= min)
    }

    if (filterBy.labels) {
        const labels = Array.isArray(filterBy.labels)
          ? filterBy.labels
          : [filterBy.labels]
      
        filterBugs = filterBugs.filter(bug =>
          bug.labels && bug.labels.some(label => labels.includes(label))
        )
      }

    if (filterBy.sortBy) {
        const dir = +filterBy.sortDir || 1
        filterBugs.sort((a, b) => {
            if (a[filterBy.sortBy] > b[filterBy.sortBy]) return dir
            if (a[filterBy.sortBy] < b[filterBy.sortBy]) return -dir
            return 0
        })
    }

    const PAGE_SIZE = 5
    const pageIdx = +filterBy.pageIdx || 0
    const startIdx = pageIdx * PAGE_SIZE
    filterBugs = filterBugs.slice(startIdx, startIdx + PAGE_SIZE)

    return Promise.resolve(filterBugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[idx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugs.unshift(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}
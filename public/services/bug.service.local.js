import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}) {
    return axios.get(BASE_URL, {params: filterBy})
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
    .then(res => res.data)
}

function save(bug) {
    return axios.get(BASE_URL + 'save', {params: bug})
        .then(res => res.data)
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (bugs && bugs.length > 0) return

    bugs = [
        {
            title: "Infinite Loop Detected",
            description: "The app keeps re-rendering the same component endlessly.",
            severity: 4,
            _id: "1NF1N1T3"
        },
        {
            title: "Keyboard Not Found",
            description: "User's keyboard input not recognized on login screen.",
            severity: 3,
            _id: "K3YB0RD"
        },
        {
            title: "404 Coffee Not Found",
            description: "Coffe machine intergration failed.No caffeine available",
            severity: 2,
            _id: "C0FF33"
        },
        {
            title: "Unexpected Response",
            description: "Server returned unexpected JSON format on save.",
            severity: 1,
            _id: "G0053"
        }
    ]
    utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}
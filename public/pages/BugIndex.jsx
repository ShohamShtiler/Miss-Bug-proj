const { useState, useEffect } = React

// import { bugService } from '../services/bug.service.local.js'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(loadBugs, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3)
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onNextPage() {
        setFilterBy(prev => ({ ...prev, pageIdx: prev.pageIdx + 1 }))
    }

    function onPrevPage() {
        setFilterBy(prev => ({ ...prev, pageIdx: Math.max(0, prev.pageIdx - 1) }))
    }

    function onSortChange(ev) {
        setFilterBy(prev => ({ ...prev, sortBy: ev.target.value }))
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />

        <div className="bug-controls">
            <label>Sort by:
                <select value={filterBy.sortBy} onChange={onSortChange}>
                    <option value="createdAt">Created At</option>
                    <option value="severity">Severity</option>
                    <option value="title">Title</option>
                </select>
            </label>

            <button onClick={onPrevPage} disabled={filterBy.pageIdx === 0}>Prev</button>
            <span>Page: {filterBy.pageIdx + 1}</span>
            <button onClick={onNextPage}>Next</button>
        </div>
    </section>
}

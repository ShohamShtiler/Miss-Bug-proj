const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        if (field === 'labels') {
            setFilterByToEdit(prev => {
              const labels = prev.labels || []
              const newLabels = target.checked
                ? [...labels, value]
                : labels.filter(l => l !== value)
              return { ...prev, labels: newLabels }
            })
            return
          }

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity , labels = [] } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input
                    value={txt}
                    onChange={handleChange}
                    type="text"
                    placeholder="By Text"
                    id="txt"
                    name="txt"
                />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input
                    value={minSeverity}
                    onChange={handleChange}
                    type="number"
                    placeholder="By Min Severity"
                    id="minSeverity"
                    name="minSeverity"
                />

                <fieldset>
                    <legend>Labels:</legend>
                    <label>
                        <input
                            type="checkbox"
                            name="labels"
                            value="critical"
                            onChange={handleChange}
                            checked={labels.includes('critical')}
                        />
                        Critical
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="labels"
                            value="UI"
                            onChange={handleChange}
                            checked={labels.includes('UI')}
                        />
                        UI
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="labels"
                            value="backend"
                            onChange={handleChange}
                            checked={labels.includes('backend')}
                        />
                        Backend
                    </label>
                </fieldset>
            </form>
        </section>
    )
}
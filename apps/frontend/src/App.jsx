import { useState } from 'react'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

function App() {
  const [form, setForm] = useState({
    goal: '',
    availableHours: 1,
    mood: '',
  })
  const [quest, setQuest] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function generateQuest(event) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setQuest(null)

    try {
      const response = await fetch(`${apiBaseUrl}/quest/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          availableHours: Number(form.availableHours),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not generate a quest. Please try again.')
      }

      setQuest(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">QuestBoard</p>
        <h1>Turn your goal into a quest.</h1>
        <p className="intro-copy">
          Tell us what you want to accomplish, how much time you have, and how
          you are feeling. We will build a simple plan.
        </p>
      </section>

      <section className="card">
        <form onSubmit={generateQuest}>
          <label>
            Goal
            <input
              name="goal"
              value={form.goal}
              onChange={updateField}
              placeholder="Learn Docker Compose"
              required
            />
          </label>

          <label>
            Available hours
            <input
              name="availableHours"
              type="number"
              min="0"
              step="0.5"
              value={form.availableHours}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Mood
            <input
              name="mood"
              value={form.mood}
              onChange={updateField}
              placeholder="Curious"
              required
            />
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating quest...' : 'Generate quest'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      {quest && (
        <section className="card quest-result">
          <div className="result-heading">
            <p className="eyebrow">Your quest</p>
            <span className={`difficulty difficulty-${quest.difficulty}`}>
              {quest.difficulty}
            </span>
          </div>
          <h2>{quest.questTitle}</h2>
          <p className="goal-label">Goal: {quest.goal}</p>
          <ol>
            {quest.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  )
}

export default App

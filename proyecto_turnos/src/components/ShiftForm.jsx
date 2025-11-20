import React, { useState } from 'react'

export default function ShiftForm({ onAdd }) {
  const [form, setForm] = useState({ driver: '', date: '', start: '', end: '' })

  const parseTime = (t) => {
    const [hh, mm] = t.split(':').map(Number)
    return hh + mm/60
  }

  const calculateHours = (start, end) => {
    if(!start || !end) return 0
    const s = parseTime(start)
    const e = parseTime(end)
    const diff = e - s
    return diff >= 0 ? diff : diff + 24
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const hours = calculateHours(form.start, form.end)
    if(isNaN(hours) || hours <= 0) { alert('Horas inválidas'); return }
    onAdd({ ...form, id: Date.now(), hours })
    setForm({ driver: '', date: '', start: '', end: '' })
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
      <input placeholder="Conductor" value={form.driver} onChange={e=>setForm({...form, driver:e.target.value})} required />
      <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
      <input type="time" value={form.start} onChange={e=>setForm({...form, start:e.target.value})} required />
      <input type="time" value={form.end} onChange={e=>setForm({...form, end:e.target.value})} required />
      <button type="submit" className="btn">Agregar Turno</button>
    </form>
  )
}

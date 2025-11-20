import React, { useState, useMemo } from 'react'
import ShiftForm from './components/ShiftForm'
import ShiftTable from './components/ShiftTable'
import mockShifts from './data/mockShifts'

export default function App(){
  const [shifts, setShifts] = useState(mockShifts)

  const addShift = (shift) => setShifts(prev => [...prev, shift])
  const deleteShift = (id) => setShifts(prev => prev.filter(s => s.id !== id))

  const totalHoursByDriver = useMemo(() => {
    return shifts.reduce((acc, s) => {
      acc[s.driver] = (acc[s.driver] || 0) + s.hours
      return acc
    }, {})
  }, [shifts])

  return (
    <div className="container">
      <h1 style={{color: 'var(--primary)', textAlign:'center'}}>Gestión de Turnos - Conductores</h1>
      <div className="card" style={{marginTop:16}}>
        <ShiftForm onAdd={addShift} />
      </div>

      <div className="card" style={{marginTop:16}}>
        <ShiftTable shifts={shifts} onDelete={deleteShift} totalHours={totalHoursByDriver} />
      </div>
    </div>
  )
}

import React from 'react'

export default function ShiftTable({ shifts, onDelete, totalHours }) {
  const MAX_HOURS = 48

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Conductor</th>
            <th>Fecha</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Horas</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(s => (
            <tr key={s.id}>
              <td>{s.driver}</td>
              <td>{s.date}</td>
              <td>{s.start}</td>
              <td>{s.end}</td>
              <td>{s.hours.toFixed(2)}</td>
              <td>
                <button className="btn btn-danger" onClick={()=>onDelete(s.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{marginTop:16}}>Horas totales por conductor</h3>
      <ul>
        {Object.entries(totalHours).map(([driver, hours])=>(
          <li key={driver} style={{color: hours>MAX_HOURS ? 'var(--danger)' : 'inherit', fontWeight: hours>MAX_HOURS ? 700 : 400}}>
            {driver}: {hours.toFixed(2)} horas {hours>MAX_HOURS && '⚠️ Excede el límite semanal'}
          </li>
        ))}
      </ul>
    </div>
  )
}

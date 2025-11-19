// Utilidades para cálculo de consumo y detección de anomalías

export function computeLPer100(liters, kilometers) {
  if (!kilometers || kilometers <= 0) return 0;
  return Number((liters / (kilometers / 100)).toFixed(3));
}

export function detectAnomaly(expectedLPer100, observedLPer100, tolerancePercent = 30) {
  const deviation = observedLPer100 - expectedLPer100;
  const deviationPercent = expectedLPer100 === 0 ? 100 : (deviation / expectedLPer100) * 100;
  const isAnomaly = Math.abs(deviationPercent) > tolerancePercent;

  let reason = null;
  const possibleCauses = [];
  if (isAnomaly) {
    if (deviationPercent > 0) {
      reason = 'Consumo superior al esperado';
      possibleCauses.push('Fuga de combustible', 'Problema mecánico (inyección/compresión)', 'Conducción ineficiente o sobrecarga');
    } else {
      reason = 'Consumo inferior al esperado';
      possibleCauses.push('Registro erróneo', 'Cambio en condiciones de uso (menos carga)');
    }
  }

  return { isAnomaly, deviationPercent: Number(deviationPercent.toFixed(2)), reason, possibleCauses };
}

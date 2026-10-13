// comisiones.js — Cálculo de comisiones de Dimon Connet
// Regla: 15% a cada parte, independiente del valor del servicio

export function calcularComisiones(valorServicio) {
  const valor = Number(valorServicio) || 0;
  const porcentaje = 15;

  const comisionSolicitante = valor * (porcentaje / 100);
  const comisionProveedor = valor * (porcentaje / 100);

  return {
    valorServicio: valor,
    porcentaje: porcentaje,
    comisionSolicitante: Math.round(comisionSolicitante * 100) / 100,
    comisionProveedor: Math.round(comisionProveedor * 100) / 100,
    totalDimon: Math.round((comisionSolicitante + comisionProveedor) * 100) / 100,
    explicacion: [
      `Valor del servicio acordado: $${valor} — se transfiere completo entre las partes`,
      `Quien solicita paga: $${valor} + $${comisionSolicitante.toFixed(2)} (15% comisión)`,
      `Quien brinda recibe: $${valor} completos y paga $${comisionProveedor.toFixed(2)} de comisión`,
      `Dimon Connet recibe: $${(comisionSolicitante + comisionProveedor).toFixed(2)} en total`
    ]
  };
}

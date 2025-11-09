let conductores = [
  { id: 1, nombre: "Carlos Gómez", licencia: "A12345", vencimiento: "2025-02-20", estado: "Activo" },
  { id: 2, nombre: "Ana Torres", licencia: "B98765", vencimiento: "2024-11-15", estado: "Activo" },
  { id: 3, nombre: "Luis Pérez", licencia: "C65432", vencimiento: "2023-12-01", estado: "Suspendido" }
];

const tablaBody = document.querySelector("#tablaConductores tbody");
const modal = document.getElementById("modal");
const btnAgregar = document.getElementById("btnAgregar");
const form = document.getElementById("formConductor");
const cancelar = document.getElementById("cancelar");
const tituloModal = document.getElementById("tituloModal");
const filtroEstado = document.getElementById("filtroEstado");
const busqueda = document.getElementById("busqueda");

// === Renderizar tabla ===
function renderTabla() {
  const hoy = new Date();
  const alertaDias = 30;

  let filtrados = conductores.filter(c => {
    const texto = busqueda.value.toLowerCase();
    const filtro = filtroEstado.value;
    return (
      (filtro === "Todos" || c.estado === filtro) &&
      (c.nombre.toLowerCase().includes(texto) || c.licencia.toLowerCase().includes(texto))
    );
  });

  tablaBody.innerHTML = "";

  filtrados.forEach(c => {
    const fechaV = new Date(c.vencimiento);
    const diff = (fechaV - hoy) / (1000 * 60 * 60 * 24);
    const alerta = diff < alertaDias ? "alerta" : "";

    const fila = document.createElement("tr");
    fila.className = alerta;
    fila.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.licencia}</td>
      <td>${c.vencimiento}</td>
      <td>${c.estado}</td>
      <td>
        <button onclick="editarConductor(${c.id})">✏️</button>
        <button onclick="suspenderConductor(${c.id})">⛔</button>
        <button onclick="eliminarConductor(${c.id})">🗑️</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

// === Abrir Modal ===
btnAgregar.addEventListener("click", () => {
  form.reset();
  document.getElementById("conductorId").value = "";
  tituloModal.textContent = "Agregar Conductor";
  modal.classList.remove("oculto");
});

cancelar.addEventListener("click", () => modal.classList.add("oculto"));

// === Guardar / Actualizar ===
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("conductorId").value;
  const nuevo = {
    id: id ? Number(id) : Date.now(),
    nombre: nombre.value,
    licencia: licencia.value,
    vencimiento: vencimiento.value,
    estado: estado.value
  };

  const hoy = new Date().toISOString().split("T")[0];
  if (nuevo.vencimiento < hoy) {
    alert("⚠️ La fecha de vencimiento no puede ser anterior a hoy.");
    return;
  }

  if (id) {
    conductores = conductores.map(c => c.id === Number(id) ? nuevo : c);
    alert("✅ Conductor actualizado.");
  } else {
    conductores.push(nuevo);
    alert("✅ Conductor agregado.");
  }

  modal.classList.add("oculto");
  renderTabla();
});

// === Editar ===
window.editarConductor = (id) => {
  const c = conductores.find(c => c.id === id);
  if (c) {
    document.getElementById("conductorId").value = c.id;
    nombre.value = c.nombre;
    licencia.value = c.licencia;
    vencimiento.value = c.vencimiento;
    estado.value = c.estado;
    tituloModal.textContent = "Editar Conductor";
    modal.classList.remove("oculto");
  }
};

// === Suspender / Activar ===
window.suspenderConductor = (id) => {
  conductores = conductores.map(c => {
    if (c.id === id) {
      c.estado = c.estado === "Activo" ? "Suspendido" : "Activo";
    }
    return c;
  });
  renderTabla();
};

// === Eliminar ===
window.eliminarConductor = (id) => {
  if (confirm("¿Seguro que deseas eliminar este conductor?")) {
    conductores = conductores.filter(c => c.id !== id);
    renderTabla();
  }
};

// === Filtros y búsqueda ===
filtroEstado.addEventListener("change", renderTabla);
busqueda.addEventListener("input", renderTabla);

// === Inicializar ===
renderTabla();

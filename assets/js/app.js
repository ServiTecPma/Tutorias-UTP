const animatedItems = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.15 });
animatedItems.forEach((item) => observer.observe(item));
const form = document.getElementById('solicitudForm');
if (form) {
const nivel = document.getElementById('nivel');
const materia = document.getElementById('materia');
const status = document.getElementById('formStatus');
const materiasUniversidad = [
{ value: 'calculo-1', label: 'Cálculo 1' },
{ value: 'calculo-2', label: 'Cálculo 2' },
{ value: 'calculo-3', label: 'Cálculo 3' },
{ value: 'fisica-1', label: 'Física 1' },
{ value: 'fisica-2', label: 'Física 2' },
{ value: 'dla', label: 'DLA' }
];
const materiasSecundaria = [
{ value: 'matematicas-secundaria', label: 'Matemáticas (secundaria)' },
{ value: 'fisica-secundaria', label: 'Física (secundaria)' }
];
function cargarMaterias() {
if (!nivel || !materia) return;
let opciones = '<option value="">Selecciona una materia</option>';
if (nivel.value === 'universitario') {
opciones += materiasUniversidad.map((item) => `<option value="$
{item.value}">${item.label}</option>`).join('');
}
if (nivel.value === 'secundaria') {
opciones += materiasSecundaria.map((item) => `<option value="$
{item.value}">${item.label}</option>`).join('');
}
materia.innerHTML = opciones;
}
nivel.addEventListener('change', cargarMaterias);
form.addEventListener('submit', async (event) => {
event.preventDefault();
status.textContent = 'Enviando solicitud...';
status.className = 'form-status';
const data = new FormData(form);
try {
const response = await fetch('/api/submit', {
  method: 'POST',
body: data
});
const result = await response.json();
if (!response.ok) {
throw new Error(result.error || 'No se pudo enviar la solicitud.');
}
status.textContent = 'Solicitud enviada correctamente. Te contactaremos 
pronto.';
status.className = 'form-status success';
form.reset();
cargarMaterias();
} catch (error) {
status.textContent = error.message || 'Ocurrió un error al enviar la 
solicitud.';
status.className = 'form-status error';
}
});
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
const status = document.getElementById('loginStatus');
loginForm.addEventListener('submit', async (event) => {
event.preventDefault();
status.textContent = 'Validando acceso...';
status.className = 'form-status';
const password = document.getElementById('password').value;
try {
const response = await fetch('/api/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ password })
});
const result = await response.json();
if (!response.ok || !result.ok) {
throw new Error(result.error || 'No se pudo iniciar sesión.');
}
localStorage.setItem('admin_token', password);
window.location.href = '/admin/panel.html';
} catch (error) {
status.textContent = error.message || 'Error de acceso.';
status.className = 'form-status error';
}
});
}
async function cargarPanel() {
const panel = document.getElementById('tablaSolicitudes');
if (!panel) return;
const token = localStorage.getItem('admin_token');
const status = document.getElementById('panelStatus');
if (!token) {
window.location.href = '/admin/login.html';
return;
}
try {
status.textContent = 'Cargando solicitudes...';
status.className = 'form-status';
const response = await fetch('/api/administracion', {
headers: {
'x-admin-token': token
}
});
const result = await response.json();
if (!response.ok) {
throw new Error(result.error || 'No se pudieron cargar las solicitudes.');
}
const tbody = panel.querySelector('tbody');
tbody.innerHTML = '';
result.forEach((item) => {
const tr = document.createElement('tr');
tr.innerHTML = `
        <td>${new Date(item.fecha).toLocaleString()}</td>
        <td>${item.nombre}</td>
        <td>${item.telefono}</td>
        <td>${item.correo}</td>
        <td>${item.nivel}</td>
        <td>${item.materia}</td>
        <td>${item.modalidad}</td>
        <td>
          <select data-id="${item.id}" class="estado-select">
            <option value="pendiente" ${item.estado === 'pendiente' ?
'selected' : ''}>Pendiente</option>
            <option value="contactado" ${item.estado === 'contactado' ?
'selected' : ''}>Contactado</option>
            <option value="hecho" ${item.estado === 'hecho' ? 'selected' : ''}
>Hecho</option>
          </select>
        </td>
      `;
tbody.appendChild(tr);
});
document.querySelectorAll('.estado-select').forEach((select) => {
select.addEventListener('change', async (event) => {
try {
const changeResponse = await fetch('/api/estados', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-admin-token': token
},
body: JSON.stringify({
id: Number(event.target.dataset.id),
estado: event.target.value
})
});
const changeResult = await changeResponse.json();
if (!changeResponse.ok || !changeResult.ok) {
throw new Error(changeResult.error || 'No se pudo actualizar el 
estado.');
}
} catch (error) {
status.textContent = error.message || 'No se pudo actualizar el 
estado.';
status.className = 'form-status error';
}
});
});
status.textContent = `Solicitudes cargadas: ${result.length}`;
status.className = 'form-status success';
} catch (error) {
  status.textContent = error.message || 'Error cargando panel.';
status.className = 'form-status error';
}
}
function logout() {
localStorage.removeItem('admin_token');
window.location.href = '/admin/login.html';
}
cargarPanel();

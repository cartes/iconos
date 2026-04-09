<template>
  <div class="space-y-6">

    <!-- Barra de búsqueda y filtros -->
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Buscador -->
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
        />
      </div>

      <!-- Filtro por rol -->
      <div class="flex gap-2">
        <button
          v-for="f in filtroRoles"
          :key="f.value"
          @click="filtroRol = f.value"
          class="px-3 py-2 rounded-lg text-xs font-bold transition-all"
          :class="filtroRol === f.value
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300'"
        >
          {{ f.label }}
          <span v-if="f.count !== null" class="ml-1 opacity-70">({{ f.count }})</span>
        </button>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-slate-800 dark:text-white">Usuarios del Sistema</h2>
          <p class="text-xs text-slate-400 mt-0.5">Vista de solo lectura — todos los usuarios registrados en agencias</p>
        </div>
        <button
          @click="fetchUsuarios"
          :disabled="loading"
          class="text-xs font-semibold text-primary-500 border border-primary-500/30 px-3 py-1.5 rounded-lg hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="i in 5" :key="i" class="px-5 py-4 flex items-center gap-4">
          <div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div class="h-3 w-56 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div class="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
          <div class="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="px-6 py-10 text-center">
        <div class="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800 text-sm font-medium">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ error }}
        </div>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Usuario</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Rol</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Agencia (Tenant)</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Registrado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-slate-400 italic text-sm">
                {{ busqueda || filtroRol !== 'todos' ? 'No se encontraron usuarios con ese filtro.' : 'No hay usuarios registrados.' }}
              </td>
            </tr>
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Usuario -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0"
                    :class="rolColor(usuario.rol)"
                  >
                    {{ initials(usuario.nombre || usuario.email) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-700 dark:text-slate-200 truncate">{{ usuario.nombre || '(sin nombre)' }}</p>
                    <p class="text-[11px] text-slate-400 truncate">{{ usuario.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Rol -->
              <td class="px-5 py-3.5">
                <span
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                  :class="rolBadge(usuario.rol)"
                >{{ rolLabel(usuario.rol) }}</span>
              </td>

              <!-- Agencia / tenant_id -->
              <td class="px-5 py-3.5">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {{ usuario.tenant_id || '—' }}
                </span>
              </td>

              <!-- Fecha de registro -->
              <td class="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                {{ formatDate(usuario.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pie de tabla con conteo -->
        <div v-if="!loading && usuarios.length > 0" class="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p class="text-xs text-slate-400">
            Mostrando <span class="font-semibold text-slate-600 dark:text-slate-300">{{ usuariosFiltrados.length }}</span>
            de <span class="font-semibold text-slate-600 dark:text-slate-300">{{ usuarios.length }}</span> usuarios
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { centralApiRequest as apiRequest } from '@/api/service';

const usuarios = ref([]);
const loading = ref(true);
const error = ref(null);
const busqueda = ref('');
const filtroRol = ref('todos');

// ── Filtros disponibles ───────────────────────────────────────────────
const filtroRoles = computed(() => [
  { value: 'todos', label: 'Todos', count: usuarios.value.length },
  { value: 'admin', label: 'Admins', count: usuarios.value.filter(u => u.rol === 'admin').length },
  { value: 'usuario', label: 'Usuarios', count: usuarios.value.filter(u => u.rol === 'usuario').length },
]);

// ── Usuarios filtrados ────────────────────────────────────────────────
const usuariosFiltrados = computed(() => {
  let lista = usuarios.value;

  if (filtroRol.value !== 'todos') {
    lista = lista.filter(u => u.rol === filtroRol.value);
  }

  const q = busqueda.value.trim().toLowerCase();
  if (q) {
    lista = lista.filter(u =>
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }

  return lista;
});

// ── Fetch ─────────────────────────────────────────────────────────────
async function fetchUsuarios() {
  loading.value = true;
  error.value = null;
  const res = await apiRequest('super-admin/usuarios');

  if (res.success === false) {
    error.value = res.error || 'Error al cargar los usuarios.';
  } else {
    // La API devuelve un array directo
    usuarios.value = Array.isArray(res) ? res : (res.data || res.usuarios || []);
  }
  loading.value = false;
}

// ── Helpers ───────────────────────────────────────────────────────────
function initials(str = '') {
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
}

function rolLabel(rol) {
  const map = { admin: 'Admin', usuario: 'Usuario', 'super-admin': 'Super Admin' };
  return map[rol] || rol || 'Desconocido';
}

function rolBadge(rol) {
  return {
    admin: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    usuario: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    'super-admin': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  }[rol] || 'bg-slate-100 dark:bg-slate-800 text-slate-500';
}

function rolColor(rol) {
  return {
    admin: 'bg-gradient-to-br from-violet-500 to-purple-600',
    usuario: 'bg-gradient-to-br from-sky-500 to-blue-600',
    'super-admin': 'bg-gradient-to-br from-amber-500 to-orange-500',
  }[rol] || 'bg-gradient-to-br from-slate-400 to-slate-600';
}

onMounted(fetchUsuarios);
</script>

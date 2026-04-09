<template>
  <div class="space-y-6">

    <!-- Sección: Estado del Sistema -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-5 flex items-center gap-4"
        :class="sistemaOk ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800'"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="chequeoLoading
            ? 'bg-slate-100 dark:bg-slate-800'
            : sistemaOk
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : 'bg-rose-50 dark:bg-rose-900/20'"
        >
          <div v-if="chequeoLoading" class="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          <svg v-else-if="sistemaOk" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else class="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">API / Backend</p>
          <p class="font-bold text-slate-800 dark:text-white text-sm mt-0.5">
            {{ chequeoLoading ? 'Verificando...' : sistemaOk ? 'Operativo' : 'Sin conexión' }}
          </p>
          <p v-if="apiEstado?.version" class="text-[11px] text-slate-400 mt-0.5">v{{ apiEstado.version }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Entorno</p>
          <p class="font-bold text-slate-800 dark:text-white text-sm mt-0.5">Producción</p>
          <p class="text-[11px] text-slate-400 mt-0.5">railway.app</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Última revisión</p>
          <p class="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{{ horaActual }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Hora del sistema</p>
        </div>
      </div>
    </div>

    <!-- Sección: Info del Administrador -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h2 class="font-bold text-slate-800 dark:text-white">Sesión Actual</h2>
        <p class="text-xs text-slate-400 mt-0.5">Información del administrador autenticado</p>
      </div>
      <div class="p-6 flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
          {{ inicialesAdmin }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-slate-900 dark:text-white text-base">{{ authStore.user?.nombre || '—' }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ authStore.user?.email }}</p>
          <span class="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            Super Administrador
          </span>
        </div>
      </div>
    </div>

    <!-- Sección: Endpoint API (referencia) -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h2 class="font-bold text-slate-800 dark:text-white">API del Sistema</h2>
        <p class="text-xs text-slate-400 mt-0.5">Endpoints de referencia para administración</p>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="ep in endpoints" :key="ep.path" class="px-6 py-3.5 flex items-center gap-4">
          <span
            class="text-[9px] font-black px-2 py-0.5 rounded font-mono shrink-0"
            :class="{
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': ep.method === 'GET',
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': ep.method === 'POST',
              'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': ep.method === 'PUT',
              'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400': ep.method === 'DELETE',
            }"
          >{{ ep.method }}</span>
          <code class="text-xs text-slate-600 dark:text-slate-300 font-mono flex-1">{{ ep.path }}</code>
          <span class="text-[11px] text-slate-400 hidden sm:inline">{{ ep.desc }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiRequest, centralApiRequest } from '@/api/service';

const authStore = useAuthStore();

const chequeoLoading = ref(true);
const sistemaOk = ref(false);
const apiEstado = ref(null);

// Hora actual formateada
const horaActual = computed(() => {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
});

// Iniciales del admin
const inicialesAdmin = computed(() => {
  const name = authStore.user?.nombre || authStore.user?.email || '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
});

// Endpoints de referencia
const endpoints = [
  { method: 'GET',    path: '/api/super-admin/tenants',          desc: 'Lista de agencias' },
  { method: 'POST',   path: '/api/super-admin/tenants',          desc: 'Crear agencia' },
  { method: 'PUT',    path: '/api/super-admin/tenants/{id}',     desc: 'Actualizar agencia' },
  { method: 'POST',   path: '/api/super-admin/tenants/{id}/suspender', desc: 'Suspender agencia' },
  { method: 'POST',   path: '/api/super-admin/tenants/{id}/activar',   desc: 'Activar agencia' },
  { method: 'GET',    path: '/api/super-admin/usuarios',         desc: 'Lista global de usuarios' },
  { method: 'GET',    path: '/api/super-admin/planes',           desc: 'Lista de planes' },
  { method: 'POST',   path: '/api/super-admin/planes',           desc: 'Crear plan' },
  { method: 'PUT',    path: '/api/super-admin/planes/{id}',      desc: 'Actualizar plan' },
  { method: 'POST',   path: '/api/super-admin/suscripciones',    desc: 'Asignar suscripción' },
  { method: 'PUT',    path: '/api/super-admin/suscripciones/{id}', desc: 'Actualizar suscripción' },
];

async function verificarEstado() {
  chequeoLoading.value = true;
  try {
    const res = await centralApiRequest('estado');
    sistemaOk.value = true;
    apiEstado.value = res;
  } catch {
    sistemaOk.value = false;
  } finally {
    chequeoLoading.value = false;
  }
}

onMounted(verificarEstado);
</script>

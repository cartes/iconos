<template>
  <div class="space-y-6">

    <!-- Header con filtros -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="flex gap-2">
        <button
          v-for="estado in filtros" :key="estado.value"
          @click="filtroActivo = estado.value"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          :class="filtroActivo === estado.value
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-300'"
        >{{ estado.label }} <span v-if="estado.count !== null" class="ml-1 opacity-70">({{ estado.count }})</span></button>
      </div>
      <div class="sm:ml-auto">
        <button @click="loadPagos" class="text-xs font-semibold text-primary-500 border border-primary-500/30 px-3 py-1.5 rounded-lg hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div v-if="loading" class="flex justify-center py-16">
        <div class="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Agencia</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Plan</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Inicio</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Vencimiento</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="filteredTenants.length === 0">
              <td colspan="6" class="px-5 py-12 text-center text-slate-400 italic text-sm">Sin agencias con este estado.</td>
            </tr>
            <tr v-for="t in filteredTenants" :key="t.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-grad-primary rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">{{ (t.nombre || '?').charAt(0) }}</div>
                  <div>
                    <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ t.nombre }}</p>
                    <p class="text-[11px] text-slate-400">{{ t.email || '—' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">{{ t.suscripcion?.plan?.nombre || '—' }}</td>
              <td class="px-5 py-3.5">
                <select
                  v-model="t.suscripcion_estado"
                  @change="actualizarEstado(t)"
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer"
                  :class="estadoClase(t.suscripcion?.estado)"
                >
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                  <option value="trial">Trial</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="sin_plan">Sin Plan</option>
                </select>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatDate(t.suscripcion?.fecha_inicio) }}</td>
              <td class="px-5 py-3.5">
                <span class="text-xs" :class="isVencido(t.suscripcion?.fecha_vencimiento) ? 'text-rose-500 font-bold' : 'text-slate-500'">
                  {{ formatDate(t.suscripcion?.fecha_vencimiento) }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button @click="abrirAsignar(t)" class="text-[10px] font-bold px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 transition-all">
                    {{ t.suscripcion ? 'Editar Plan' : 'Asignar Plan' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Asignar / Editar Plan -->
    <BaseModal :show="showModal" :title="tenantSeleccionado?.suscripcion ? 'Editar Suscripción' : 'Asignar Plan'" @close="showModal = false">
      <form id="asignarForm" @submit.prevent="guardarSuscripcion" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</label>
          <select v-model="form.plan_id" required class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="" disabled>Seleccionar plan...</option>
            <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }} — ${{ p.precio_mensual }}/mes</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</label>
          <select v-model="form.estado" required class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="trial">Trial</option>
            <option value="activa">Activa</option>
            <option value="vencida">Vencida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Inicio</label>
            <input v-model="form.fecha_inicio" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Vencimiento</label>
            <input v-model="form.fecha_vencimiento" type="date" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Notas internas</label>
          <textarea v-model="form.notas" rows="2" class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400" placeholder="Observaciones..." />
        </div>
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl border border-red-200 dark:border-red-800">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancelar</BaseButton>
        <BaseButton form="asignarForm" type="submit" :loading="saving">Guardar</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { centralApiRequest as apiRequest } from '@/api/service';
import BaseModal from '@/components/BaseModal.vue';
import BaseButton from '@/components/BaseButton.vue';

const loading = ref(true);
const saving = ref(false);
const tenants = ref([]);
const planes = ref([]);
const filtroActivo = ref('todos');
const showModal = ref(false);
const tenantSeleccionado = ref(null);
const formError = ref('');

const form = reactive({ plan_id: '', estado: 'activa', fecha_inicio: '', fecha_vencimiento: '', notas: '' });

const filtros = computed(() => [
  { value: 'todos', label: 'Todos', count: tenants.value.length },
  { value: 'activa', label: 'Activos', count: tenants.value.filter(t => t.suscripcion?.estado === 'activa').length },
  { value: 'trial', label: 'Trial', count: tenants.value.filter(t => t.suscripcion?.estado === 'trial').length },
  { value: 'vencida', label: 'Vencidos', count: tenants.value.filter(t => t.suscripcion?.estado === 'vencida').length },
  { value: 'sin_plan', label: 'Sin Plan', count: tenants.value.filter(t => !t.suscripcion).length },
]);

const filteredTenants = computed(() => {
  if (filtroActivo.value === 'todos') return tenants.value;
  if (filtroActivo.value === 'sin_plan') return tenants.value.filter(t => !t.suscripcion);
  return tenants.value.filter(t => t.suscripcion?.estado === filtroActivo.value);
});

const estadoClase = (estado) => {
  const map = {
    activa: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    vencida: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    trial: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    cancelada: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
  };
  return map[estado] || 'bg-slate-100 dark:bg-slate-800 text-slate-500';
};

const isVencido = (fecha) => fecha && new Date(fecha) < new Date();
const formatDate = (d) => d ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

async function loadPagos() {
  loading.value = true;
  const [resTenants, resPlanes] = await Promise.all([
    apiRequest('super-admin/tenants'),
    apiRequest('super-admin/planes'),
  ]);
  tenants.value = (resTenants.tenants || resTenants.data || resTenants || []).map(t => ({
    ...t, suscripcion_estado: t.suscripcion?.estado || 'sin_plan'
  }));
  planes.value = resPlanes.planes || resPlanes.data || resPlanes || [];
  loading.value = false;
}

function abrirAsignar(tenant) {
  tenantSeleccionado.value = tenant;
  const sub = tenant.suscripcion;
  Object.assign(form, {
    plan_id: sub?.plan_id || '',
    estado: sub?.estado || 'activa',
    fecha_inicio: sub?.fecha_inicio?.substring(0, 10) || new Date().toISOString().substring(0, 10),
    fecha_vencimiento: sub?.fecha_vencimiento?.substring(0, 10) || '',
    notas: sub?.notas || '',
  });
  formError.value = '';
  showModal.value = true;
}

async function guardarSuscripcion() {
  saving.value = true;
  formError.value = '';
  const sub = tenantSeleccionado.value?.suscripcion;
  const method = sub ? 'PUT' : 'POST';
  const endpoint = sub ? `super-admin/suscripciones/${sub.id}` : 'super-admin/suscripciones';
  const res = await apiRequest(endpoint, {
    method,
    data: { tenant_id: tenantSeleccionado.value.id, ...form }
  });
  saving.value = false;
  if (res.success) { showModal.value = false; loadPagos(); }
  else formError.value = res.error || 'Error al guardar';
}

async function actualizarEstado(tenant) {
  if (!tenant.suscripcion) return;
  await apiRequest(`super-admin/suscripciones/${tenant.suscripcion.id}`, {
    method: 'PUT',
    data: { estado: tenant.suscripcion_estado }
  });
  loadPagos();
}

onMounted(loadPagos);
</script>

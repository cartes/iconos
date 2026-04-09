<template>
  <div class="space-y-6">

    <!-- Header acciones -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">Gestiona los planes de suscripción disponibles para las agencias.</p>
      <button @click="abrirCrear" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Plan
      </button>
    </div>

    <!-- Grid de planes -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="i in 3" :key="i" class="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="plan in planes" :key="plan.id"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-black text-slate-900 dark:text-white text-lg">{{ plan.nombre }}</h3>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black text-primary-600 dark:text-primary-400">${{ Number(plan.precio_mensual).toLocaleString('es-CL') }}</span>
              <span class="text-xs text-slate-400">/mes</span>
            </div>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="plan.activo ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
          >{{ plan.activo ? 'Activo' : 'Inactivo' }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p class="text-slate-400 mb-0.5">Máx. Usuarios</p>
            <p class="font-bold text-slate-700 dark:text-slate-200">{{ plan.max_usuarios ?? '∞' }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p class="text-slate-400 mb-0.5">Máx. Íconos</p>
            <p class="font-bold text-slate-700 dark:text-slate-200">{{ plan.max_iconos ?? '∞' }}</p>
          </div>
        </div>

        <div class="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <button @click="abrirEditar(plan)" class="flex-1 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">Editar</button>
          <button @click="toggleActivo(plan)" class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all"
            :class="plan.activo ? 'text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'">
            {{ plan.activo ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>

      <div v-if="!loading && planes.length === 0" class="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 italic">
        No hay planes creados aún.
      </div>
    </div>

    <!-- Modal Crear / Editar Plan -->
    <BaseModal :show="showModal" :title="editando ? 'Editar Plan' : 'Nuevo Plan'" @close="cerrarModal">
      <form id="planForm" @submit.prevent="guardarPlan" class="flex flex-col gap-4">
        <BaseInput label="Nombre del Plan" v-model="form.nombre" placeholder="Ej: Pro, Starter, Enterprise" required />
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Precio mensual (CLP)</label>
          <input v-model.number="form.precio_mensual" type="number" min="0" step="100" required
            class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Máx. Usuarios <span class="normal-case font-normal">(vacío = ilimitado)</span></label>
            <input v-model.number="form.max_usuarios" type="number" min="1" placeholder="∞"
              class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Máx. Íconos <span class="normal-case font-normal">(vacío = ilimitado)</span></label>
            <input v-model.number="form.max_iconos" type="number" min="1" placeholder="∞"
              class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <input v-model="form.activo" type="checkbox" id="plan_activo" class="w-4 h-4 rounded accent-primary-600" />
          <label for="plan_activo" class="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">Plan activo (visible para asignar)</label>
        </div>
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl border border-red-200 dark:border-red-800">{{ formError }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="cerrarModal">Cancelar</BaseButton>
        <BaseButton form="planForm" type="submit" :loading="saving">Guardar Plan</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { centralApiRequest as apiRequest } from '@/api/service';
import BaseModal from '@/components/BaseModal.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const loading = ref(true);
const saving = ref(false);
const planes = ref([]);
const showModal = ref(false);
const editando = ref(null); // ID del plan editando, o null si es nuevo
const formError = ref('');

const form = reactive({ nombre: '', precio_mensual: 0, max_usuarios: null, max_iconos: null, activo: true });

async function loadPlanes() {
  loading.value = true;
  const res = await apiRequest('super-admin/planes');
  planes.value = res.planes || res.data || res || [];
  loading.value = false;
}

function abrirCrear() {
  editando.value = null;
  Object.assign(form, { nombre: '', precio_mensual: 0, max_usuarios: null, max_iconos: null, activo: true });
  formError.value = '';
  showModal.value = true;
}

function abrirEditar(plan) {
  editando.value = plan.id;
  Object.assign(form, { nombre: plan.nombre, precio_mensual: plan.precio_mensual, max_usuarios: plan.max_usuarios, max_iconos: plan.max_iconos, activo: !!plan.activo });
  formError.value = '';
  showModal.value = true;
}

function cerrarModal() {
  showModal.value = false;
  formError.value = '';
  editando.value = null;
}

async function guardarPlan() {
  saving.value = true;
  formError.value = '';
  const method = editando.value ? 'PUT' : 'POST';
  const endpoint = editando.value ? `super-admin/planes/${editando.value}` : 'super-admin/planes';
  const res = await apiRequest(endpoint, { method, data: { ...form } });
  saving.value = false;
  if (res.success || res.id) { cerrarModal(); loadPlanes(); }
  else formError.value = res.error || res.message || 'Error al guardar el plan';
}

async function toggleActivo(plan) {
  await apiRequest(`super-admin/planes/${plan.id}`, {
    method: 'PUT',
    data: { ...plan, activo: !plan.activo }
  });
  loadPlanes();
}

onMounted(loadPlanes);
</script>

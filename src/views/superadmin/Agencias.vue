<template>
  <div class="space-y-6">

    <!-- Registrar nueva agencia -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h2 class="font-bold text-slate-800 dark:text-white">Registrar Nueva Agencia</h2>
      </div>
      <div class="p-6">
        <form @submit.prevent="registrarTenant" class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400">Nombre Comercial *</label>
            <input v-model="nuevoTenant.nombre" type="text" placeholder="Ej: Content 360" required :disabled="cargando"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-60" />
          </div>
          <div class="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400">Dominio *</label>
            <input v-model="nuevoTenant.dominio" type="text" placeholder="content360.com" required :disabled="cargando"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-60" />
          </div>
          <div class="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400">Email</label>
            <input v-model="nuevoTenant.email" type="email" placeholder="contacto@agencia.com" :disabled="cargando"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-60" />
          </div>
          <div class="flex-1 min-w-[160px] flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400">Teléfono</label>
            <input v-model="nuevoTenant.telefono" type="tel" placeholder="+56 9 1234 5678" :disabled="cargando"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-60" />
          </div>
          <button type="submit"
            class="shrink-0 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            :disabled="cargando">
            <span v-if="cargando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar
          </button>
        </form>
      </div>
    </div>

    <!-- Listado de tenants -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h2 class="font-bold text-slate-800 dark:text-white">Agencias Registradas <span class="text-slate-400 font-normal">({{ tenants.length }})</span></h2>
        <button @click="fetchTenants" class="text-xs font-semibold text-primary-500 border border-primary-500/30 px-3 py-1.5 rounded-lg hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1.5" :disabled="cargando">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Actualizar
        </button>
      </div>

      <div v-if="cargando" class="flex justify-center py-16">
        <div class="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Agencia</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Dominio</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Email</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="tenants.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-slate-400 italic">No hay agencias registradas.</td>
            </tr>
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-grad-primary rounded-lg flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                    {{ (tenant.nombre || tenant.id)?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-700 dark:text-slate-200">{{ tenant.nombre || '(sin nombre)' }}</p>
                    <p class="text-[11px] text-slate-400">{{ tenant.telefono || '' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">{{ tenant.dominio || '—' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">{{ tenant.email || '—' }}</td>
              <td class="px-5 py-3.5">
                <span :class="[
                  'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase',
                  tenant.estado === 'suspendido'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                ]">{{ tenant.estado || 'activo' }}</span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex justify-end gap-1.5">
                  <button @click="editarTenant(tenant)" class="p-1.5 text-primary-500 border border-primary-500/20 hover:bg-primary-500 hover:text-white rounded-lg transition-all" title="Editar">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button v-if="tenant.estado !== 'suspendido'" @click="suspenderTenant(tenant.id)" class="p-1.5 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg transition-all" title="Suspender">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  </button>
                  <button v-else @click="activarTenant(tenant.id)" class="p-1.5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg transition-all" title="Reactivar">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                  <button @click="borrarTenant(tenant.id)" class="p-1.5 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Eliminar">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar -->
    <BaseModal :show="showEditarTenant" title="Editar Agencia" @close="cerrarEditarTenant">
      <form id="editarTenantForm" @submit.prevent="guardarEdicionTenant" class="flex flex-col gap-4">
        <BaseInput label="Nombre Comercial" v-model="editForm.nombre" required :disabled="cargando" />
        <BaseInput label="Dominio" v-model="editForm.dominio" :disabled="cargando" />
        <BaseInput label="Email" v-model="editForm.email" type="email" :disabled="cargando" />
        <BaseInput label="Teléfono" v-model="editForm.telefono" type="tel" :disabled="cargando" />
        <BaseInput label="Dirección" v-model="editForm.direccion" :disabled="cargando" />
        <div v-if="editError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800">{{ editError }}</div>
        <div v-if="editExito" class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200 dark:border-emerald-800">{{ editExito }}</div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="cerrarEditarTenant" :disabled="cargando">Cancelar</BaseButton>
        <BaseButton form="editarTenantForm" type="submit" :loading="cargando">Guardar Cambios</BaseButton>
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

const tenants = ref([]);
const cargando = ref(false);
const nuevoTenant = reactive({ nombre: '', dominio: '', email: '', telefono: '', direccion: '' });

const showEditarTenant = ref(false);
const editError = ref('');
const editExito = ref('');
const editForm = reactive({ id: '', nombre: '', dominio: '', email: '', telefono: '', direccion: '' });

const fetchTenants = async () => {
  cargando.value = true;
  try {
    const res = await apiRequest('super-admin/tenants');
    if (Array.isArray(res)) {
      tenants.value = res;
    } else {
      tenants.value = res.data || res.tenants || [];
    }
  } catch (err) {
    console.error(err);
  } finally {
    cargando.value = false;
  }
};

const registrarTenant = async () => {
  cargando.value = true;
  try {
    const res = await apiRequest('super-admin/tenants', {
      method: 'POST',
      data: { ...nuevoTenant }
    });
    if (res.success) {
      Object.assign(nuevoTenant, { nombre: '', dominio: '', email: '', telefono: '', direccion: '' });
      await fetchTenants();
    } else {
      alert(`Error: ${res.error || 'Datos inválidos'}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    cargando.value = false;
  }
};

const suspenderTenant = async (id) => {
  if (!confirm('¿Suspender esta agencia?')) return;
  cargando.value = true;
  const res = await apiRequest(`super-admin/tenants/${id}/suspender`, { method: 'POST' });
  if (res.success) await fetchTenants();
  else alert(res.error || 'Error al suspender');
  cargando.value = false;
};

const activarTenant = async (id) => {
  if (!confirm('¿Reactivar esta agencia?')) return;
  cargando.value = true;
  const res = await apiRequest(`super-admin/tenants/${id}/activar`, { method: 'POST' });
  if (res.success) await fetchTenants();
  else alert(res.error || 'Error al activar');
  cargando.value = false;
};

const editarTenant = (tenant) => {
  Object.assign(editForm, { id: tenant.id, nombre: tenant.nombre || '', dominio: tenant.dominio || '', email: tenant.email || '', telefono: tenant.telefono || '', direccion: tenant.direccion || '' });
  editError.value = '';
  editExito.value = '';
  showEditarTenant.value = true;
};

const cerrarEditarTenant = () => {
  showEditarTenant.value = false;
  editError.value = '';
  editExito.value = '';
  Object.assign(editForm, { id: '', nombre: '', dominio: '', email: '', telefono: '', direccion: '' });
};

const guardarEdicionTenant = async () => {
  if (!editForm.nombre.trim()) { editError.value = 'El nombre no puede estar vacío.'; return; }
  editError.value = '';
  editExito.value = '';
  cargando.value = true;
  const res = await apiRequest(`super-admin/tenants/${editForm.id}`, {
    method: 'PUT',
    data: { nombre: editForm.nombre, dominio: editForm.dominio, email: editForm.email, telefono: editForm.telefono, direccion: editForm.direccion }
  });
  cargando.value = false;
  if (res.success) {
    editExito.value = '✓ Agencia actualizada.';
    setTimeout(() => { cerrarEditarTenant(); fetchTenants(); }, 800);
  } else {
    editError.value = res.error || 'Error al actualizar.';
  }
};

const borrarTenant = async (id) => {
  if (!confirm('¿ELIMINAR esta agencia permanentemente?')) return;
  cargando.value = true;
  const res = await apiRequest(`super-admin/tenants/${id}`, { method: 'DELETE' });
  cargando.value = false;
  if (res.success) await fetchTenants();
  else alert(res.error || 'Error al eliminar');
};

onMounted(fetchTenants);
</script>

<template>
  <div class="space-y-6">
    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :sub="stat.sub"
        :icon="stat.icon"
        :color="stat.color"
        :loading="loading"
      />
    </div>

    <!-- Tabla resumen de agencias -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 class="font-bold text-slate-800 dark:text-white text-sm">Agencias Recientes</h2>
        <RouterLink to="/super-admin/agencias" class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">Ver todas →</RouterLink>
      </div>
      <div v-if="loading" class="p-8 flex justify-center">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Agencia</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Plan</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Vencimiento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="t in tenants" :key="t.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-grad-primary rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">{{ (t.nombre || '?').charAt(0) }}</div>
                  <div>
                    <p class="font-semibold text-slate-800 dark:text-white">{{ t.nombre }}</p>
                    <p class="text-[11px] text-slate-400">{{ t.data?.email || '—' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 text-slate-600 dark:text-slate-300 text-xs">{{ t.suscripcion?.plan?.nombre || 'Sin plan' }}</td>
              <td class="px-5 py-3.5">
                <StatusBadge :estado="t.suscripcion?.estado" />
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatDate(t.suscripcion?.fecha_vencimiento) }}</td>
            </tr>
            <tr v-if="!loading && tenants.length === 0">
              <td colspan="4" class="px-5 py-10 text-center text-slate-400 italic text-sm">No hay agencias registradas aún.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { RouterLink } from 'vue-router';
import { centralApiRequest as apiRequest } from '@/api/service';

const loading = ref(true);
const tenants = ref([]);

const stats = computed(() => [
  {
    label: 'Agencias Totales',
    value: tenants.value.length,
    sub: 'registradas',
    color: 'primary',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    label: 'Agencias Activas',
    value: tenants.value.filter(t => !t.suspendido).length,
    sub: 'en operación',
    color: 'emerald',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  },
  {
    label: 'Suscripciones Activas',
    value: tenants.value.filter(t => t.suscripcion?.estado === 'activa').length,
    sub: 'con plan vigente',
    color: 'violet',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
  {
    label: 'En Mora / Sin Plan',
    value: tenants.value.filter(t => !t.suscripcion || t.suscripcion?.estado === 'vencida').length,
    sub: 'requieren atención',
    color: 'rose',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  },
]);

async function loadData() {
  loading.value = true;
  const res = await apiRequest('super-admin/tenants');
  // La API devuelve un array plano directamente
  if (Array.isArray(res)) {
    tenants.value = res;
  } else if (res.success !== false) {
    tenants.value = res.tenants || res.data || [];
  }
  loading.value = false;
}

function formatDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
}

onMounted(loadData);

// ── Sub-components defined inline ──────────────────────────────────
const colorMap = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'text-primary-600 dark:text-primary-400', value: 'text-primary-700 dark:text-primary-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', value: 'text-emerald-700 dark:text-emerald-300' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', value: 'text-violet-700 dark:text-violet-300' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', value: 'text-rose-700 dark:text-rose-300' },
};

const StatCard = defineComponent({
  props: { label: String, value: [String, Number], sub: String, icon: String, color: String, loading: Boolean },
  setup(props) {
    return () => {
      const c = colorMap[props.color] || colorMap.primary;
      return h('div', { class: 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-start gap-4' }, [
        h('div', { class: `w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0 ${c.icon}`, innerHTML: props.icon }),
        props.loading
          ? h('div', { class: 'space-y-2 flex-1' }, [
              h('div', { class: 'h-7 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' }),
              h('div', { class: 'h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse' }),
            ])
          : h('div', {}, [
              h('p', { class: `text-2xl font-black ${c.value}` }, props.value),
              h('p', { class: 'text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight' }, props.label),
              h('p', { class: 'text-[11px] text-slate-400 mt-0.5' }, props.sub),
            ]),
      ]);
    };
  },
});

const estadoConfig = {
  activa: { label: 'Activa', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  vencida: { label: 'Vencida', cls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
  trial: { label: 'Trial', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  cancelada: { label: 'Cancelada', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
};

const StatusBadge = defineComponent({
  props: { estado: String },
  setup(props) {
    return () => {
      const cfg = estadoConfig[props.estado] || { label: 'Sin Plan', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-400' };
      return h('span', { class: `text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}` }, cfg.label);
    };
  },
});
</script>

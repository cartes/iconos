<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de API Keys</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Genera y administra tokens de acceso programático para los tenants.</p>
      </div>
    </div>

    <!-- Alert for New Token -->
    <div 
      v-if="newToken" 
      class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 relative overflow-hidden"
    >
      <div class="absolute top-0 right-0 p-4">
        <button @click="newToken = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 2l-2 2M3 21l2-2m4.5-12.5l2 2m4.5 4.5l2 2M15 3h6v6M9 21H3v-6" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-indigo-900 dark:text-indigo-400">Token Generado con Éxito</h3>
          <p class="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Copia este token ahora. Por seguridad, no se volverá a mostrar.</p>
          
          <div class="mt-4 flex items-center gap-2">
            <div class="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-200 break-all shadow-sm">
              {{ newToken }}
            </div>
            <button 
              @click="copyToken" 
              class="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <svg v-if="copied" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {{ copied ? 'Copiado' : 'Copiar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Section -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-24">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold text-xs">01</span>
            Nueva API Key
          </h2>

          <form @submit.prevent="createApiKey" class="space-y-5">
            <div>
              <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre de la App</label>
              <input 
                v-model="form.app_name" 
                type="text" 
                placeholder="Ej: Mobile App Production" 
                required
                :disabled="loading"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50"
              />
              <p v-if="fieldError('app_name')" class="text-rose-500 text-[10px] font-bold mt-1.5 px-1">{{ fieldError('app_name') }}</p>
            </div>

            <div>
              <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Agencia (Tenant ID)</label>
              <select 
                v-model="form.tenant_id" 
                required
                :disabled="loading || tenantsLoading"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-slate-800 dark:text-slate-200 appearance-none disabled:opacity-50"
              >
                <option value="" disabled>Selecciona una agencia...</option>
                <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.nombre }} ({{ t.id }})</option>
              </select>
              <p v-if="fieldError('tenant_id')" class="text-rose-500 text-[10px] font-bold mt-1.5 px-1">{{ fieldError('tenant_id') }}</p>
            </div>

            <div>
              <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dominios Permitidos</label>
              <input 
                v-model="form.allowed_domains" 
                type="text" 
                placeholder="domain.com, app.local (separados por coma)" 
                :disabled="loading"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50"
              />
              <p class="text-[10px] text-slate-400 mt-2 px-1 italic">Ej: *.midominio.com,localhost</p>
              <p v-if="fieldError('allowed_domains')" class="text-rose-500 text-[10px] font-bold mt-1.5 px-1">{{ fieldError('allowed_domains') }}</p>
            </div>

            <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              {{ error }}
            </div>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              <span v-if="loading" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <template v-else>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Generar API Key
              </template>
            </button>
          </form>
        </div>
      </div>

      <!-- List Section -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Llaves Activas</h2>
            <button @click="fetchApiKeys" class="p-2 text-slate-400 hover:text-primary-500 transition-colors">
              <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                  <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aplicación / Tenant</th>
                  <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dominios</th>
                  <th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creado</th>
                  <th class="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <template v-if="keysLoading && apiKeys.length === 0">
                  <tr v-for="i in 3" :key="i">
                    <td colspan="4" class="px-8 py-6 animate-pulse">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                        <div class="space-y-2">
                          <div class="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                          <div class="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
                
                <tr v-else-if="apiKeys.length === 0">
                  <td colspan="4" class="px-8 py-20 text-center">
                    <div class="flex flex-col items-center gap-3 text-slate-400">
                      <svg class="w-16 h-16 opacity-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M21 2l-2 2M3 21l2-2m4.5-12.5l2 2m4.5 4.5l2 2M15 3h6v6M9 21H3v-6" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      <p class="font-bold text-sm italic">No hay API Keys activas</p>
                    </div>
                  </td>
                </tr>

                <tr 
                  v-for="key in apiKeys" 
                  :key="key.id" 
                  class="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                >
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                        {{ key.app_name?.charAt(0).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ key.app_name }}</h4>
                        <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{{ key.tenant_id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="domain in key.allowed_domains?.split(',')" 
                        :key="domain"
                        class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md"
                      >
                        {{ domain.trim() }}
                      </span>
                      <span v-if="!key.allowed_domains" class="text-[10px] font-bold text-rose-400 italic">Global (sin restricción)</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-xs text-slate-500 dark:text-slate-400">
                    {{ formatDate(key.created_at) }}
                  </td>
                  <td class="px-8 py-6 text-right">
                    <button 
                      @click="revokeApiKey(key.id)"
                      class="px-4 py-2 text-[10px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all outline-none active:scale-95"
                    >
                      REVOCAR
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div class="relative z-10">
            <h3 class="text-xl font-bold mb-2">Seguridad de la API</h3>
            <p class="text-indigo-100 text-sm leading-relaxed max-w-md">
              Las API Keys permiten acceso programático total a los recursos del Tenant. 
              Asegúrate de restringir los dominios permitidos siempre que sea posible.
            </p>
          </div>
          <svg class="absolute bottom-0 right-0 w-32 h-32 opacity-10 -mb-8 -mr-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { centralApiRequest as apiRequest } from '@/api/service'
import { useApiError } from '@/composables/useApiError'

const { error, handleError, clearError, fieldError } = useApiError()

const loading = ref(false)
const keysLoading = ref(false)
const tenantsLoading = ref(false)
const copied = ref(false)
const newToken = ref(null)

const apiKeys = ref([])
const tenants = ref([])

const form = reactive({
  app_name: '',
  tenant_id: '',
  allowed_domains: ''
})

// Fetch Tenants for the select dropdown
const fetchTenants = async () => {
  tenantsLoading.value = true
  try {
    const res = await apiRequest('super-admin/tenants')
    if (Array.isArray(res)) {
      tenants.value = res
    } else if (res.success !== false) {
      tenants.value = res.tenants || res.data || []
    }
  } catch (err) {
    console.error('Error fetching tenants:', err)
  } finally {
    tenantsLoading.value = false
  }
}

// Fetch existing API Keys
const fetchApiKeys = async () => {
  keysLoading.value = true
  try {
    const res = await apiRequest('super-admin/api-keys')
    if (res.success !== false) {
      // If it's paginated, actual keys are in res.data (or res.data.data)
      const data = res.data || res.keys || res || []
      apiKeys.value = Array.isArray(data) ? data : (data.data || [])
    }
  } catch (err) {
    console.error('Error fetching API keys:', err)
  } finally {
    keysLoading.value = false
  }
}

// Create new API Key
const createApiKey = async () => {
  loading.value = true
  clearError()
  newToken.value = null
  
  // Convert comma-separated string to array
  const domainsArray = form.allowed_domains
    ? form.allowed_domains.split(',').map(d => d.trim()).filter(d => d.length > 0)
    : []

  const res = await apiRequest('super-admin/api-keys', {
    method: 'POST',
    data: { 
      name: form.app_name, // Backend expects 'name'
      tenant_id: form.tenant_id,
      allowed_domains: domainsArray // Backend expects array
    }
  })
  
  if (!handleError(res)) {
    newToken.value = res.token
    Object.assign(form, { app_name: '', tenant_id: '', allowed_domains: '' })
    fetchApiKeys()
  }
  
  loading.value = false
}

// Revoke (Delete) API Key
const revokeApiKey = async (id) => {
  if (!confirm('¿Estás seguro de que deseas revocar esta API Key? Esta acción es irreversible.')) return
  
  loading.value = true
  const res = await apiRequest(`super-admin/api-keys/${id}`, { method: 'DELETE' })
  
  if (!handleError(res)) {
    fetchApiKeys()
  }
  
  loading.value = false
}

// Utility: Copy token to clipboard
const copyToken = () => {
  if (!newToken.value) return
  navigator.clipboard.writeText(newToken.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Utility: Format Date
const formatDate = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(date))
}

onMounted(() => {
  fetchApiKeys()
  fetchTenants()
})
</script>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>

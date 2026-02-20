<template>
    <div class="legacy-body">
        <div class="legacy-container">
            <header class="legacy-header">
                <h1>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Panel Administrativo
                </h1>
                <div class="legacy-header-actions">
                    <button @click="toggleTheme" class="icon-btn theme-btn header-btn-icon"
                        :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
                        <!-- Sun Icon -->
                        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            width="20" height="20">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="19.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                        <!-- Moon Icon -->
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"
                            height="20">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                        </svg>
                    </button>
                    <span class="user-info-text">
                        Hola, {{ authStore.user?.email || 'Admin' }}
                    </span>
                    <button class="btn btn-primary logout-btn-legacy" @click="logout" title="Cerrar Sesión">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"
                            height="18">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Salir
                    </button>
                </div>
            </header>

            <main class="legacy-content content">
                <div class="tabs">
                    <button :class="['tab-btn', { 'activo': activeTab === 'dashboard' }]"
                        @click="activeTab = 'dashboard'">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"
                            height="16">
                            <path d="M18 20V10M12 20V4M6 20v-4" />
                        </svg>
                        Dashboard
                    </button>
                    <button :class="['tab-btn', { 'activo': activeTab === 'empresas' }]"
                        @click="activeTab = 'empresas'">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"
                            height="16">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                            <path
                                d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" />
                        </svg>
                        Empresas
                    </button>
                    <button :class="['tab-btn', { 'activo': activeTab === 'usuarios' }]"
                        @click="activeTab = 'usuarios'">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"
                            height="16">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                            <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        Usuarios
                    </button>
                </div>

                <div v-if="loading" class="loading-container">
                    <span class="spinner-large"></span>
                    <p>Sincronizando datos...</p>
                </div>

                <div v-else-if="activeTab === 'dashboard'" class="section activo">
                    <div class="estadisticas">
                        <div class="stat-card tooltip-stat">
                            <h3>{{ companies.length }}</h3>
                            <p>Empresas Activas</p>
                        </div>
                        <div class="stat-card tooltip-stat">
                            <h3>{{ users.length }}</h3>
                            <p>Total Usuarios</p>
                        </div>
                        <div class="stat-card tooltip-stat">
                            <h3>{{users.filter(u => u.rol === 'admin').length}}</h3>
                            <p>Administradores</p>
                        </div>
                    </div>

                    <div class="dashboard-companies">
                        <h3>Empresas Registradas</h3>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th style="width: 150px">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="company in companies.slice(0, 5)" :key="company.id">
                                        <td>
                                            <div class="entity-name">
                                                <span class="avatar">{{ company.nombre.charAt(0) }}</span>
                                                {{ company.nombre }}
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn btn-primary" @click="exploreCompany(company)"
                                                style="padding: 5px 10px; font-size: 12px;">
                                                Explorar
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="companies.length === 0" class="empty-row">
                                        <td colspan="2">No hay empresas registradas</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'empresas'" class="section activo">
                    <div
                        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Gestión de Empresas</h2>
                        <button class="btn btn-success" @click="showAddCompanyModal = true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"
                                height="16">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Nueva Empresa
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>ID</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="company in companies" :key="company.id">
                                    <td>
                                        <div class="entity-name">
                                            <span class="avatar">{{ company.nombre.charAt(0) }}</span>
                                            {{ company.nombre }}
                                        </div>
                                    </td>
                                    <td class="id-cell">{{ company.id }}</td>
                                    <td class="actions-cell">
                                        <button class="btn btn-primary" @click="exploreCompany(company)"
                                            style="padding: 5px 10px; font-size: 12px;">
                                            Explorar
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="companies.length === 0" class="empty-row">
                                    <td colspan="3">No hay empresas registradas</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-else-if="activeTab === 'usuarios'" class="section activo">
                    <div
                        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Gestión de Usuarios</h2>
                        <button class="btn btn-success" @click="showAddUserModal = true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"
                                height="16">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            Nuevo Usuario
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Empresa</th>
                                    <th>Puede Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in users" :key="user.email">
                                    <td class="email">{{ user.email }}</td>
                                    <td class="name">{{ user.nombre }}</td>
                                    <td>
                                        <span :class="['badge', 'badge-' + user.rol]">
                                            {{ user.rol === 'admin' ? 'admin' : 'usuario' }}
                                        </span>
                                    </td>
                                    <td class="empresa-cell">
                                        <span v-if="user.empresaNombre || user.empresa" class="badge badge-empresa">
                                            {{ user.empresaNombre || user.empresa }}
                                        </span>
                                        <span v-else>-</span>
                                    </td>
                                    <td>
                                        <div class="switch-container" v-if="user.rol !== 'admin'">
                                            <label class="switch">
                                                <input type="checkbox" :checked="!!user.puedeEliminar"
                                                    @change="toggleDeletePermission(user, $event.target.checked)">
                                                <span class="slider round"></span>
                                            </label>
                                        </div>
                                        <span v-else class="admin-shield" title="Administrador tiene permisos totales">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                width="18" height="18" color="#dc3545">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="users.length === 0" class="empty-row">
                                    <td colspan="5">No hay usuarios registrados</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>

        <!-- Modals -->
        <BaseModal :show="showAddCompanyModal" title="Nueva Empresa" @close="showAddCompanyModal = false">
            <form @submit.prevent="saveCompany" class="modal-form">
                <BaseInput label="Nombre de la Empresa" v-model="newCompany.nombre" placeholder="Ej. Content 360"
                    required />
                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Guardar Empresa</BaseButton>
                </div>
            </form>
        </BaseModal>

        <BaseModal :show="showAddUserModal" title="Nuevo Usuario" @close="showAddUserModal = false">
            <form @submit.prevent="saveUser" class="modal-form">
                <BaseInput label="Nombre Completo" v-model="newUser.nombre" placeholder="Juan Pérez" required />
                <BaseInput label="Email" type="email" v-model="newUser.email" placeholder="juan@empresa.com" required />
                <BaseInput label="Contraseña" type="password" v-model="newUser.clave" placeholder="••••••••" required />

                <div class="form-group">
                    <label class="label">Rol</label>
                    <select v-model="newUser.rol" class="select-input">
                        <option value="usuario">Usuario Estándar</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <div class="form-group" v-if="newUser.rol === 'usuario'">
                    <label class="label">Empresa</label>
                    <select v-model="newUser.empresaId" class="select-input" required>
                        <option value="" disabled>Selecciona una empresa</option>
                        <option v-for="c in companies" :key="c.id" :value="c.id">
                            {{ c.nombre }}
                        </option>
                    </select>
                </div>

                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Crear Usuario</BaseButton>
                </div>
            </form>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest } from '@/api/service';
import BaseInput from '@/components/BaseInput.vue';
import BaseSwitch from '@/components/BaseSwitch.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const companies = ref([]);
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const activeTab = ref('dashboard');

const showAddCompanyModal = ref(false);
const showAddUserModal = ref(false);

const newCompany = reactive({ nombre: '' });
const newUser = reactive({
    nombre: '',
    email: '',
    clave: '',
    rol: 'usuario',
    empresaId: ''
});

// Theme logic scoped properly
const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateTheme();
};

const updateTheme = () => {
    if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

const logout = () => {
    authStore.clearSession();
    router.push('/login');
};

const fetchData = async () => {
    loading.value = true;
    try {
        const [compRes, userRes] = await Promise.all([
            apiRequest('listarEmpresas', {}, authStore.user),
            apiRequest('listarUsuarios', {}, authStore.user)
        ]);

        if (compRes.success) companies.value = compRes.empresas || [];
        if (userRes.success) users.value = userRes.usuarios || [];
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        isDark.value = savedTheme === 'dark';
    } else {
        isDark.value = false;
    }
    updateTheme();
});

const saveCompany = async () => {
    saving.value = true;
    const res = await apiRequest('crearEmpresa', { nombre: newCompany.nombre }, authStore.user);
    if (res.success) {
        showAddCompanyModal.value = false;
        newCompany.nombre = '';
        fetchData();
    } else {
        alert(res.error);
    }
    saving.value = false;
};

const saveUser = async () => {
    saving.value = true;
    const res = await apiRequest('crearUsuario', { ...newUser }, authStore.user);
    if (res.success) {
        showAddUserModal.value = false;
        Object.assign(newUser, { nombre: '', email: '', clave: '', rol: 'usuario', empresaId: '' });
        fetchData();
    } else {
        alert(res.error);
    }
    saving.value = false;
};

const exploreCompany = (company) => {
    router.push({
        name: 'admin-explore',
        params: { id: company.id, nombre: company.nombre }
    });
};

const toggleDeletePermission = async (user, newValue) => {
    const originalValue = user.puedeEliminar;
    user.puedeEliminar = newValue; // Optimistic update

    try {
        const res = await apiRequest('editarUsuario', {
            targetEmail: user.email,
            datos: { puedeEliminar: newValue }
        }, authStore.user);

        if (!res.success) {
            alert(res.error || 'Error al actualizar permiso');
            user.puedeEliminar = originalValue;
        }
    } catch (e) {
        alert('Error de conexión');
        user.puedeEliminar = originalValue;
    }
};
</script>

<style scoped>
/* LEGACY EXACT STYLES */
.legacy-body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* In case the window is tall */
}

.legacy-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 90vh;
}

:global(.dark) .legacy-container {
    background: #1e1e2d !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
}

:global(.dark) h2 {
    color: #ffffff !important;
}

.legacy-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.legacy-header h1 {
    font-size: 24px;
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 0;
    color: white;
}

.legacy-header-actions {
    display: flex;
    gap: 15px;
    align-items: center;
}

.user-info-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.header-btn-icon {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
}

.header-btn-icon:hover {
    background: rgba(255, 255, 255, 0.1);
}

.btn-primary.logout-btn-legacy {
    background: #fff;
    color: #667eea;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary.logout-btn-legacy:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.legacy-content {
    padding: 30px;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

/* TABS SYSTEM */
.tabs {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0;
}

:global(.dark) .tabs {
    border-bottom-color: var(--color-border);
}

.tab-btn {
    padding: 15px 25px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: #999;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: -2px;
}

.tab-btn.activo {
    color: #667eea;
    border-bottom-color: #667eea;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
}

.tab-btn:hover:not(.activo) {
    color: #667eea;
    background: #fafafa;
}

.section {
    display: none;
}

.section.activo {
    display: block;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* STATS */
.estadisticas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 25px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-card h3 {
    font-size: 32px;
    margin-bottom: 10px;
    color: #ffffff;
}

.stat-card p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
    margin: 0;
    font-weight: 500;
}

/* BUTTONS */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #fff;
    color: #667eea;
    border: 1px solid #e0e0e0;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover {
    background: #218838;
}

/* BADGES */
.badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.badge-admin {
    background: #dc3545;
    color: white;
}

.badge-usuario {
    background: #28a745;
    color: white;
}

.badge-empresa {
    background: #e2e8f0;
    color: #4a5568;
}

:global(.dark) .badge-empresa {
    background: var(--slate-700);
    color: var(--slate-300);
}

/* SWITCH */
.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

/* TABLE OVERRIDES TO MATCH LEGACY */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

table thead {
    background: #f8f9fa;
}

table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
}

table td {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    vertical-align: middle;
}

table tr:last-child td {
    border-bottom: none;
}

.table-responsive {
    overflow-x: auto;
}

.dashboard-companies {
    margin-top: 30px;
}

.dashboard-companies h3 {
    margin-bottom: 15px;
    color: #333;
}

:global(.dark) .dashboard-companies h3 {
    color: var(--color-text-main);
}

/* AVATAR AND TYPOGRAPHY IN TABLES */
.entity-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
}

.avatar {
    width: 32px;
    height: 32px;
    background: var(--slate-100);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-600);
    font-weight: 700;
    font-size: 0.875rem;
}

:global(.dark) .avatar {
    background: var(--slate-800);
    color: var(--primary-400);
}

.id-cell {
    color: #666;
    font-family: monospace;
}

:global(.dark) .id-cell {
    color: var(--color-text-muted);
}

.user-cell {
    display: flex;
    flex-direction: column;
}

.user-cell .name {
    font-weight: 500;
}

.user-cell .email {
    font-size: 0.8125rem;
    color: #666;
}

:global(.dark) .user-cell .email {
    color: var(--color-text-muted);
}

.role-badge {
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.role-badge.admin {
    background: #fee2e2;
    color: #ef4444;
}

.role-badge.usuario {
    background: #dcfce7;
    color: #10b981;
}

.btn-sm {
    padding: 0.4rem 0.75rem;
    font-size: 0.8125rem;
}

.empty-row td {
    text-align: center;
    color: #666;
    padding: 2rem;
}

:global(.dark) .empty-row td {
    color: var(--color-text-muted);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #666;
}

:global(.dark) .loading-container {
    color: var(--color-text-muted);
}

.spinner-large {
    width: 40px;
    height: 40px;
    border: 3px solid var(--slate-200);
    border-top-color: var(--primary-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Form styles inside modals */
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.select-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-main);
    font-family: inherit;
    font-size: 1rem;
}

.modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
}
</style>

<style>
/* UNSCOPED DARK MODE OVERRIDES */
.dark .legacy-container {
    background: #1e1e2d !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
}

.dark .legacy-container h2,
.dark .legacy-container h3,
.dark .legacy-container h4,
.dark .legacy-container .entity-name,
.dark .legacy-container .user-cell .name {
    color: #ffffff !important;
}

.dark table {
    background: #2a2a3c !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}

.dark table thead {
    background: #393952 !important;
}

.dark table th {
    color: #ffffff !important;
    border-bottom-color: #4a4a6a !important;
}

.dark table td {
    border-bottom-color: #4a4a6a !important;
}

.dark .tab-btn {
    color: #a0a0b0 !important;
}

.dark .tab-btn.activo,
.dark .tab-btn:hover:not(.activo) {
    background: #2a2a3c !important;
    color: #8c9eff !important;
}
</style>

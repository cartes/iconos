<template>
    <div class="explorer-layout">
        <TopBar />

        <div class="explorer-container">
            <!-- Sidebar: Folders -->
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>Carpetas</h2>
                    <button @click="showAddFolder = true" class="icon-btn" title="Nueva Carpeta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                </div>

                <nav class="folder-list">
                    <button class="folder-item all" :class="{ active: !selectedFolderId }"
                        @click="selectedFolderId = null">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                        Todas las carpetas
                        <span class="folder-count">{{ icons.length }}</span>
                    </button>

                    <div v-for="folder in folders" :key="folder.id" class="folder-group">
                        <button class="folder-item" :class="{ active: selectedFolderId === folder.id }"
                            @click="selectedFolderId = folder.id">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span class="folder-name">{{ folder.nombre }}</span>
                            <span class="folder-count">{{ iconCountByFolder[folder.id] || 0 }}</span>
                        </button>
                        <div class="folder-actions" v-if="auth.user.puedeEliminar">
                            <button @click="openRenameFolderModal(folder)" class="edit-folder-btn" title="Renombrar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button v-if="(iconCountByFolder[folder.id] || 0) === 0" @click="handleDeleteFolder(folder)"
                                class="delete-folder-btn" title="Eliminar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path
                                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>
            </aside>

            <!-- Main Content: Icons Grid -->
            <main class="main-content">
                <header class="content-header">
                    <div class="breadcrumb">
                        <router-link to="/admin">Empresas</router-link>
                        <span class="separator">/</span>
                        <span class="current">{{ companyName }}</span>
                        <span v-if="selectedFolderName" class="separator">/</span>
                        <span v-if="selectedFolderName" class="folder-tag">{{ selectedFolderName }}</span>
                    </div>

                    <div class="actions">
                        <BaseButton variant="primary" @click="showUpload = true">
                            Agregar Icono
                        </BaseButton>
                    </div>
                </header>

                <div v-if="loading" class="loading-state">
                    <span class="spinner-large"></span>
                    <p>Sincronizando iconos...</p>
                </div>

                <div v-else-if="filteredIcons.length === 0" class="empty-state">
                    <div class="empty-illustration">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                    <h3>No hay iconos aquí</h3>
                    <p>Comienza subiendo un nuevo icono a esta carpeta.</p>
                </div>

                <div v-else class="icons-grid">
                    <div v-for="icon in filteredIcons" :key="icon.id" class="icon-card"
                        @mouseenter="showTooltip(icon, $event)" @mousemove="moveTooltip($event)"
                        @mouseleave="hideTooltip">
                        <div class="icon-preview" @click="copyUrl(icon.url)">
                            <img :src="icon.url" :alt="icon.etiqueta" loading="lazy">
                            <div class="overlay">
                                <span class="copy-hint">Copiar URL</span>
                            </div>
                        </div>
                        <div class="icon-info">
                            <span class="icon-name" :title="icon.etiqueta">{{ icon.etiqueta || '-' }}</span>
                            <div class="icon-actions">
                                <span class="ext-tag">{{ icon.extension }}</span>
                                <button class="edit-icon" @click="openRenameModal(icon)" title="Editar Etiqueta">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button v-if="auth.user.puedeEliminar" @click="handleDeleteIcon(icon)"
                                    class="delete-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Modals -->
        <BaseModal :show="showAddFolder" title="Nueva Carpeta" @close="showAddFolder = false">
            <form @submit.prevent="saveFolder" class="modal-form">
                <BaseInput label="Nombre de la Carpeta" v-model="folderForm.nombre" placeholder="Ej. Social Media"
                    required />
                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Crear Carpeta</BaseButton>
                </div>
            </form>
        </BaseModal>

        <BaseModal :show="showUpload" title="Subir Icono" @close="showUpload = false">
            <form @submit.prevent="saveIcon" class="modal-form">
                <BaseInput label="Nombre del Icono" v-model="iconForm.nombre" placeholder="Ej. Instagram Logo"
                    required />

                <div class="form-group">
                    <label class="label">Carpeta</label>
                    <select v-model="iconForm.carpetaId" class="select-input" required>
                        <option value="" disabled>Selecciona una carpeta</option>
                        <option v-for="f in folders" :key="f.id" :value="f.id">{{ f.nombre }}</option>
                    </select>
                </div>

                <div class="file-upload-area" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                    <input type="file" id="iconFile" class="file-input" @change="handleFileChange" accept="image/*"
                        required />
                    <label for="iconFile" class="file-label">
                        <svg v-if="!iconForm.fileName" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span v-if="!iconForm.fileName">Suelta un archivo aquí o haz clic para subir</span>
                        <span v-else class="file-name">✓ {{ iconForm.fileName }}</span>
                    </label>
                </div>

                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Subir Icono</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Rename Icon Modal -->
        <BaseModal :show="showRenameModal" title="Editar Etiqueta" @close="showRenameModal = false">
            <form @submit.prevent="handleRename" class="modal-form">
                <BaseInput label="Nueva Etiqueta" v-model="renameForm.nombre" required />
                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Actualizar</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Rename Folder Modal -->
        <BaseModal :show="showRenameFolderModal" title="Renombrar Carpeta" @close="showRenameFolderModal = false">
            <form @submit.prevent="handleRenameFolder" class="modal-form">
                <BaseInput label="Nuevo Nombre" v-model="renameFolderForm.nombre" required />
                <div class="modal-actions">
                    <BaseButton type="submit" :loading="saving">Guardar</BaseButton>
                </div>
            </form>
        </BaseModal>

        <!-- Tooltip -->
        <div v-if="tooltip.show" class="custom-tooltip" :style="tooltipStyle">
            {{ tooltip.text }}
        </div>

        <!-- Toast -->
        <div v-if="toast" class="toast">{{ toast }}</div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiRequest } from '@/api/service';
import TopBar from '@/components/TopBar.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSwitch from '@/components/BaseSwitch.vue';

const route = useRoute();
const auth = useAuthStore();

const companyId = route.params.id;
const companyName = route.params.nombre;

const folders = ref([]);
const icons = ref([]);
const selectedFolderId = ref(null);
const loading = ref(false);
const saving = ref(false);
const toast = ref(null);
const isDragging = ref(false);

const showAddFolder = ref(false);
const showUpload = ref(false);

const folderForm = reactive({ nombre: '' });
const iconForm = reactive({ nombre: '', carpetaId: '', fileBase64: '', fileName: '' });

const deletionMode = ref(false);
const showRenameModal = ref(false);
const renameForm = reactive({ id: null, nombre: '' });

const showRenameFolderModal = ref(false);
const renameFolderForm = reactive({ id: null, nombre: '' });

const tooltip = reactive({
    show: false,
    text: '',
    x: 0,
    y: 0
});

const tooltipStyle = computed(() => ({
    top: `${tooltip.y + 15}px`,
    left: `${tooltip.x + 15}px`
}));

const selectedFolderName = computed(() => {
    const f = folders.value.find(f => f.id === selectedFolderId.value);
    return f ? f.nombre : null;
});

const filteredIcons = computed(() => {
    if (!selectedFolderId.value) return icons.value;
    return icons.value.filter(i => i.carpetaId === selectedFolderId.value);
});

const iconCountByFolder = computed(() => {
    const counts = {};
    for (const icon of icons.value) {
        counts[icon.carpetaId] = (counts[icon.carpetaId] || 0) + 1;
    }
    return counts;
});

const fetchData = async () => {
    loading.value = true;
    try {
        const [fResL, iResL] = await Promise.all([
            apiRequest('listarCarpetas', { targetEmpresaId: companyId }, auth.user),
            apiRequest('listarIconos', { targetEmpresaId: companyId }, auth.user)
        ]);
        if (fResL.success) folders.value = fResL.carpetas || [];
        if (iResL.success) icons.value = iResL.iconos || [];
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
};

const handleDrop = (e) => {
    isDragging.value = false;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
};

const processFile = (file) => {
    iconForm.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        iconForm.fileBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
};

const saveFolder = async () => {
    saving.value = true;
    const res = await apiRequest('crearCarpeta', { nombre: folderForm.nombre, targetEmpresaId: companyId }, auth.user);
    if (res.success) {
        showAddFolder.value = false;
        folderForm.nombre = '';
        fetchData();
        showToast('Carpeta creada');
    } else alert(res.error);
    saving.value = false;
};

const saveIcon = async () => {
    saving.value = true;
    const res = await apiRequest('crearIcono', {
        nombre: iconForm.nombre,
        carpetaId: iconForm.carpetaId,
        archivo: iconForm.fileBase64,
        nombreArchivo: iconForm.fileName,
        targetEmpresaId: companyId
    }, auth.user);
    if (res.success) {
        showUpload.value = false;
        Object.assign(iconForm, { nombre: '', carpetaId: '', fileBase64: '', fileName: '' });
        fetchData();
        showToast('Icono subido');
    } else alert(res.error);
    saving.value = false;
};

const handleDeleteFolder = async (folder) => {
    if (confirm(`¿Estás seguro de eliminar la carpeta "${folder.nombre}"?`)) {
        const res = await apiRequest('eliminarCarpeta', { idCarpeta: folder.id, targetEmpresaId: companyId }, auth.user);
        if (res.success) {
            if (selectedFolderId.value === folder.id) selectedFolderId.value = null;
            fetchData();
            showToast('Carpeta eliminada');
        } else alert(res.error);
    }
};

const openRenameFolderModal = (folder) => {
    renameFolderForm.id = folder.id;
    renameFolderForm.nombre = folder.nombre;
    showRenameFolderModal.value = true;
};

const handleRenameFolder = async () => {
    saving.value = true;
    const res = await apiRequest('renombrarCarpeta', {
        idCarpeta: renameFolderForm.id,
        nuevoNombre: renameFolderForm.nombre,
        targetEmpresaId: companyId
    }, auth.user);

    if (res.success) {
        showRenameFolderModal.value = false;
        fetchData();
        showToast('Carpeta renombrada');
    } else alert(res.error);
    saving.value = false;
};

const handleDeleteIcon = async (icon) => {
    if (confirm(`¿Estás seguro de eliminar el icono "${icon.etiqueta || icon.url}"?`)) {
        const res = await apiRequest('eliminarIcono', { iconoId: icon.id, targetEmpresaId: companyId }, auth.user);
        if (res.success) {
            fetchData();
            showToast('Icono eliminado');
        } else alert(res.error);
    }
};

const openRenameModal = (icon) => {
    renameForm.id = icon.id;
    renameForm.nombre = icon.etiqueta;
    showRenameModal.value = true;
};

const handleRename = async () => {
    saving.value = true;
    const res = await apiRequest('editarIcono', {
        idIcono: renameForm.id,
        nuevaEtiqueta: renameForm.nombre,
        targetEmpresaId: companyId
    }, auth.user);

    if (res.success) {
        showRenameModal.value = false;
        fetchData();
        showToast('Etiqueta actualizada');
    } else alert(res.error);
    saving.value = false;
};

const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showToast('URL copiada al portapapeles');
};

const showToast = (msg) => {
    toast.value = msg;
    setTimeout(() => { toast.value = null; }, 2000);
};

const showTooltip = (icon, e) => {
    tooltip.text = icon.etiqueta || '';
    tooltip.x = e.pageX;
    tooltip.y = e.pageY;
    tooltip.show = true;
};

const moveTooltip = (e) => {
    tooltip.x = e.pageX;
    tooltip.y = e.pageY;
};

const hideTooltip = () => {
    tooltip.show = false;
};
</script>

<style scoped>
.explorer-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
}

.explorer-container {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.sidebar {
    width: 320px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    padding: 2rem 0;
}

.sidebar-header {
    padding: 0 1.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sidebar-header h2 {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
}

.icon-btn {
    background: none;
    border: none;
    color: var(--primary-500);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    display: flex;
    transition: all 0.2s;
}

.icon-btn:hover {
    background: var(--slate-100);
}

.icon-btn svg {
    width: 20px;
    height: 20px;
}

.folder-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem;
}

.folder-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 2px;
}

.folder-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
    border: none;
    background: none;
    border-radius: var(--radius-md);
    color: var(--color-text-main);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.folder-name {
    flex: 1;
    line-height: 1.4;
}

.folder-item svg {
    width: 20px;
    height: 20px;
    color: var(--slate-400);
}

.folder-item:hover {
    background: var(--slate-100);
    color: var(--slate-900);
}

.folder-item:hover svg {
    color: var(--slate-600);
}

.folder-item.active {
    background: rgba(79, 70, 229, 0.08);
    color: var(--primary-600);
}

.folder-item.active svg {
    color: var(--primary-600);
}

.folder-count {
    margin-left: auto;
    background: var(--slate-200);
    color: var(--slate-600);
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.125rem 0.45rem;
    border-radius: 9999px;
    min-width: 20px;
    text-align: center;
    line-height: 1.4;
}

.folder-item.active .folder-count {
    background: rgba(79, 70, 229, 0.15);
    color: var(--primary-600);
}

.folder-group {
    display: flex;
    align-items: center;
    padding-right: 0.75rem;
}

.folder-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s;
}

.folder-group:hover .folder-actions,
.folder-actions:focus-within {
    opacity: 1;
}

.delete-folder-btn,
.edit-folder-btn {
    background: none;
    border: none;
    color: var(--slate-400);
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    transition: all 0.2s;
}

.delete-folder-btn:hover {
    color: var(--error-500);
    background: var(--slate-100);
}

.edit-folder-btn:hover {
    color: var(--primary-600);
    background: var(--slate-100);
}

.delete-folder-btn svg,
.edit-folder-btn svg {
    width: 16px;
    height: 16px;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 2.5rem 3rem;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
}

.breadcrumb a {
    color: var(--primary-500);
    font-weight: 500;
}

.breadcrumb .separator {
    color: var(--slate-300);
}

.breadcrumb .current {
    color: var(--slate-900);
    font-weight: 600;
}

@media (prefers-color-scheme: dark) {
    .breadcrumb .current {
        color: white;
    }
}

.folder-tag {
    background: var(--slate-100);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: 600;
    color: var(--primary-600);
}

.icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
}

.icon-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: var(--shadow-sm);
}

.icon-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-400);
}

.icon-preview {
    height: 180px;
    background: var(--slate-50);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    cursor: pointer;
}

@media (prefers-color-scheme: dark) {
    .icon-preview {
        background: rgba(255, 255, 255, 0.02);
    }
}

.icon-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.overlay {
    position: absolute;
    inset: 0;
    background: rgba(79, 70, 229, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.icon-preview:hover .overlay {
    opacity: 1;
}

.copy-hint {
    color: white;
    font-weight: 700;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.icon-info {
    padding: 1rem;
}

.icon-name {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--slate-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
    .icon-name {
        color: white;
    }
}

.icon-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ext-tag {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    background: var(--slate-100);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-weight: 700;
}

@media (prefers-color-scheme: dark) {
    .ext-tag {
        background: var(--slate-800);
    }
}

.delete-icon {
    background: none;
    border: none;
    color: var(--slate-400);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
}

.delete-icon:hover {
    color: var(--error-500);
    background: rgba(239, 68, 68, 0.05);
}

.delete-icon svg {
    width: 16px;
    height: 16px;
}

.toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--slate-900);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translate(-50%, 100%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
}

.empty-illustration {
    width: 64px;
    height: 64px;
    color: var(--slate-300);
    margin-bottom: 1rem;
}

.empty-illustration svg {
    width: 100%;
    height: 100%;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
    color: var(--color-text-muted);
}

.spinner-large {
    width: 40px;
    height: 40px;
    border: 3px solid var(--slate-200);
    border-top-color: var(--primary-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Form styles */
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

.file-upload-area {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: 2rem;
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
}

.file-upload-area:hover,
.file-upload-area.dragging {
    border-color: var(--primary-500);
    background: rgba(79, 70, 229, 0.05);
}

.file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
}

.file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
}

.file-label svg {
    width: 32px;
    height: 32px;
    color: var(--slate-400);
}

.file-name {
    color: var(--success-500);
    font-weight: 700;
}

.modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
}

.deletion-toggle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-right: 1.5rem;
    margin-right: 1.5rem;
    border-right: 1px solid var(--color-border);
}

.toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--slate-500);
    transition: color 0.2s;
}

.toggle-label.active {
    color: var(--error-600);
}

.edit-icon {
    background: none;
    border: none;
    padding: 0.4rem;
    color: var(--slate-400);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.edit-icon:hover {
    color: var(--primary-600);
    background: var(--primary-50);
}

.edit-icon svg {
    width: 18px;
    height: 18px;
}

.icon-preview:hover .overlay {
    opacity: 1;
}

.custom-tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    max-width: 250px;
}

/* BaseSwitch is already styled in its component */
</style>

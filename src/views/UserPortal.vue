<template>
    <div class="portal-layout">
        <TopBar />

        <div class="portal-container">
            <!-- Sidebar: Folders -->
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>Carpetas</h2>
                </div>

                <nav class="folder-list">
                    <button class="folder-item all" :class="{ active: !selectedFolderId }"
                        @click="selectedFolderId = null">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                        <span class="folder-name">Todas las carpetas</span>
                        <span class="folder-count">{{ icons.length }}</span>
                    </button>

                    <div v-for="(folder, index) in folders" :key="folder.id" class="folder-group"
                        :draggable="auth.user.puedeEliminar"
                        @dragstart="auth.user.puedeEliminar && onFolderDragStart($event, index)"
                        @dragover.prevent="auth.user.puedeEliminar && onFolderDragOver($event, index)"
                        @dragenter.prevent="auth.user.puedeEliminar && onFolderDragEnter($event, index)"
                        @drop.prevent="auth.user.puedeEliminar && onFolderDrop($event, index)" @dragend="onDragEnd"
                        :class="{ 'dragging': dragFolderIndex === index, 'drag-over': dragOverFolderIndex === index }">

                        <div v-if="auth.user.puedeEliminar" class="drag-handle tooltip-action"
                            title="Arrastrar para ordenar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="5" r="1.5" />
                                <circle cx="15" cy="5" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" />
                                <circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="19" r="1.5" />
                                <circle cx="15" cy="19" r="1.5" />
                            </svg>
                        </div>

                        <button class="folder-item" :class="{ active: selectedFolderId === folder.id }"
                            @click="selectedFolderId = folder.id">
                            <svg viewBox="0 0 24 24" fill="none" class="folder-icon" stroke="currentColor"
                                stroke-width="2">
                                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span class="folder-name">{{ folder.nombre }}</span>
                            <span class="folder-count">{{ iconCountByFolder[folder.id] || 0 }}</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <!-- Main Content: Icons Grid -->
            <main class="main-content">
                <header class="content-header">
                    <div class="company-info">
                        <span class="label">Empresa</span>
                        <h1>{{ auth.user?.empresa }}</h1>
                    </div>

                    <div v-if="selectedFolderName" class="folder-breadcrumb">
                        <span class="separator">/</span>
                        <span class="folder-tag">{{ selectedFolderName }}</span>
                    </div>
                </header>

                <div v-if="loading" class="loading-state">
                    <span class="spinner"></span>
                    Cargando iconos...
                </div>

                <div v-else-if="filteredIcons.length === 0" class="empty-state">
                    <div class="empty-illustration">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                    <h3>No hay iconos disponibles</h3>
                    <p>Ponte en contacto con tu administrador para subir iconos.</p>
                </div>

                <div v-else class="icons-grid">
                    <div v-for="(icon, index) in filteredIcons" :key="icon.id" class="icon-card"
                        :draggable="auth.user.puedeEliminar"
                        @dragstart="auth.user.puedeEliminar && onIconDragStart($event, index)"
                        @dragover.prevent="auth.user.puedeEliminar && onIconDragOver($event, index)"
                        @dragenter.prevent="auth.user.puedeEliminar && onIconDragEnter($event, index)"
                        @drop.prevent="auth.user.puedeEliminar && onIconDrop($event, index)" @dragend="onDragEnd"
                        :class="{ 'dragging': dragIconIndex === index, 'drag-over': dragOverIconIndex === index }"
                        @mouseenter="showTooltip(icon, $event)" @mousemove="moveTooltip($event)"
                        @mouseleave="hideTooltip">

                        <div v-if="auth.user.puedeEliminar" class="icon-drag-handle">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <circle cx="9" cy="5" r="1.5" />
                                <circle cx="15" cy="5" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" />
                                <circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="19" r="1.5" />
                                <circle cx="15" cy="19" r="1.5" />
                            </svg>
                        </div>

                        <div class="icon-preview" @click="copyUrl(icon.url)">
                            <img :src="icon.url" :alt="icon.etiqueta" loading="lazy">
                            <div class="overlay">
                                <span class="copy-hint">Copiar URL</span>
                            </div>
                        </div>
                        <div class="icon-info">
                            <span class="icon-name" :title="icon.etiqueta">{{ icon.etiqueta || '-' }}</span>
                            <span class="ext-tag">{{ icon.extension }}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Tooltip -->
        <div v-if="tooltip.show" class="custom-tooltip" :style="tooltipStyle">
            {{ tooltip.text }}
        </div>

        <!-- Toast for copy URL -->
        <div v-if="toast" class="toast">{{ toast }}</div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiRequest } from '@/api/service';
import TopBar from '@/components/TopBar.vue';

const auth = useAuthStore();

const folders = ref([]);
const icons = ref([]);
const selectedFolderId = ref(null);
const loading = ref(false);
const toast = ref(null);

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
        const [fRes, iRes] = await Promise.all([
            apiRequest('carpetas'),
            apiRequest('iconos')
        ]);
        if (fRes.success) folders.value = fRes.carpetas || [];
        if (iRes.success) icons.value = iRes.iconos || [];
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.value = 'URL copiada al portapapeles';
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

// --- DRAG AND DROP LOGIC PARA CARPETAS ---
const dragFolderIndex = ref(null);
const dragOverFolderIndex = ref(null);

const onFolderDragStart = (event, index) => {
    dragFolderIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
};
const onFolderDragEnter = (event, index) => {
    dragOverFolderIndex.value = index;
};
const onFolderDragOver = (event, index) => { };
const onFolderDrop = async (event, dropIndex) => {
    if (dragFolderIndex.value !== null && dragFolderIndex.value !== dropIndex) {
        const movedItem = folders.value.splice(dragFolderIndex.value, 1)[0];
        folders.value.splice(dropIndex, 0, movedItem);

        // Recalcular el orden
        folders.value.forEach((folder, idx) => {
            folder.orden = idx + 1;
        });

        const payload = folders.value.map(f => ({ id: f.id, orden: f.orden }));

        try {
            const res = await apiRequest('carpetas/reorder', { method: 'PUT', data: { carpetas: payload } });
            if (!res.success) throw new Error(res.error);
        } catch (error) {
            console.error('Error reordenando carpetas', error);
            fetchData();
        }
    }
    dragFolderIndex.value = null;
    dragOverFolderIndex.value = null;
};

// --- DRAG AND DROP LOGIC PARA ICONOS ---
const dragIconIndex = ref(null);
const dragOverIconIndex = ref(null);

const onIconDragStart = (event, index) => {
    dragIconIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
};
const onIconDragEnter = (event, index) => {
    dragOverIconIndex.value = index;
};
const onIconDragOver = (event, index) => { };
const onIconDrop = async (event, dropIndex) => {
    if (dragIconIndex.value !== null && dragIconIndex.value !== dropIndex) {

        const currentFilteredIcons = [...filteredIcons.value];
        const draggedGlobalIcon = currentFilteredIcons[dragIconIndex.value];
        const destGlobalIcon = currentFilteredIcons[dropIndex];

        const globalDragIndex = icons.value.findIndex(i => i.id === draggedGlobalIcon.id);
        const globalDropIndex = icons.value.findIndex(i => i.id === destGlobalIcon.id);

        const movedItem = icons.value.splice(globalDragIndex, 1)[0];
        icons.value.splice(globalDropIndex, 0, movedItem);

        currentFilteredIcons.splice(dragIconIndex.value, 1);
        currentFilteredIcons.splice(dropIndex, 0, movedItem);

        currentFilteredIcons.forEach((icon, idx) => {
            icon.orden = idx + 1;
        });

        const payload = currentFilteredIcons.map(i => ({ id: i.id, orden: i.orden }));

        try {
            const res = await apiRequest('iconos/reorder', { method: 'PUT', data: { iconos: payload } });
            if (!res.success) throw new Error(res.error);
        } catch (error) {
            console.error('Error reordenando iconos', error);
            fetchData();
        }
    }
    dragIconIndex.value = null;
    dragOverIconIndex.value = null;
};

const onDragEnd = () => {
    dragIconIndex.value = null;
    dragOverIconIndex.value = null;
    dragFolderIndex.value = null;
    dragOverFolderIndex.value = null;
};
</script>

<style scoped>
.portal-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
}

.portal-container {
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
}

.sidebar-header h2 {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
}

.folder-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.75rem;
}

.folder-item {
    width: 100%;
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
    margin-bottom: 2px;
}

.folder-name {
    flex: 1;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.folder-icon {
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

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 2.5rem 3rem;
}

.content-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.company-info .label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
}

.company-info h1 {
    font-size: 2rem;
    color: var(--slate-900);
    letter-spacing: -0.025em;
}

@media (prefers-color-scheme: dark) {
    .company-info h1 {
        color: white;
    }
}

.folder-breadcrumb {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.25rem;
}

.folder-breadcrumb .separator {
    color: var(--slate-300);
}

.folder-tag {
    background: var(--slate-100);
    padding: 0.25rem 1rem;
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
    position: relative;
    /* relative for icons handle */
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icon-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--slate-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (prefers-color-scheme: dark) {
    .icon-name {
        color: white;
    }
}

.ext-tag {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    background: var(--slate-100);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-weight: 700;
}

:global(.dark) .ext-tag {
    background: var(--slate-800);
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

.folder-group {
    display: flex;
    align-items: center;
    padding-right: 0.75rem;
    transition: all 0.2s ease;
}

.folder-group.dragging {
    opacity: 0.5;
    background: var(--slate-100);
    border-radius: var(--radius-md);
}

.folder-group.drag-over {
    border-top: 2px solid var(--primary-500);
    background: rgba(79, 70, 229, 0.05);
}

.drag-handle {
    padding: 0.5rem 0.25rem 0.5rem 0.5rem;
    cursor: grab;
    color: var(--slate-300);
    display: flex;
    align-items: center;
    justify-content: center;
}

.drag-handle:active {
    cursor: grabbing;
}

.drag-handle svg {
    width: 16px;
    height: 16px;
}

.drag-handle:hover {
    color: var(--slate-500);
}

.icon-card.dragging {
    opacity: 0.5;
    transform: scale(0.95);
    box-shadow: none;
}

.icon-card.drag-over {
    border: 2px dashed var(--primary-500);
    opacity: 0.8;
}

.icon-drag-handle {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 10;
    color: var(--slate-400);
    background: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    box-shadow: var(--shadow-sm);
    opacity: 0;
    transition: all 0.2s;
}

:global(.dark) .icon-drag-handle {
    background: var(--slate-800);
    color: var(--slate-300);
}

.icon-card:hover .icon-drag-handle {
    opacity: 1;
}

.icon-drag-handle:active {
    cursor: grabbing;
    transform: scale(0.9);
}
</style>

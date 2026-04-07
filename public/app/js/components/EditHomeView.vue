<template>
    <div class="app-container page-content edit-home-container" style="overflow: hidden;">
        
        <!-- Header -->
        <div class="edit-header">
            <div class="header-left animate-slide-up">
                <h2 class="title">编辑户型</h2>
            </div>

            <!-- Actions Container -->
            <div class="header-actions animate-fade-in-up">
                <button @click="cancelEdit" class="btn-cancel">取消</button>
                <button @click="clearCanvas" class="btn-clear">清空</button>
                <button @click="saveEdit" class="btn-save group">
                    <i data-lucide="check" class="icon"></i>保存
                </button>
            </div>
        </div>

        <!-- Canvas Container -->
        <div class="canvas-container touch-pan-x touch-pan-y" ref="scrollContainer">
            <div class="canvas-scroll-content">
                <!-- Canvas Wrapper -->
                <div :style="{ width: `${1500 * canvasScale}px`, height: `${1500 * canvasScale}px` }" class="canvas-wrapper">
                    <div class="editor-grid-container"
                         :style="{ transform: `scale(${canvasScale})` }"
                         ref="gridRef"
                         @mousedown="startDraw" 
                         @mousemove="draw" 
                         @mouseup="endDraw" 
                         @mouseleave="endDraw"
                         @touchstart="handleTouchStart" 
                         @touchmove="handleTouchMove" 
                         @touchend="endDraw"
                         @touchcancel="endDraw"
                         :class="[(!isEditMode || actionTool === 'move') ? 'cursor-grab' : 'cursor-crosshair', actionTool === 'bg_move' ? 'cursor-move' : '']">
                        
                        <!-- Hint overlay inside canvas -->
                        <div class="canvas-hint">
                            <span class="hint-text">1 Block = 10x10 cm</span>
                        </div>
                        
                        <!-- Background Image Layer -->
                        <div v-if="bgImage" class="bg-image-layer">
                            <img :src="bgImage" 
                                 class="bg-image"
                                 :style="{ 
                                     transform: `translate(${bgConfig.x}px, ${bgConfig.y}px) scale(${bgConfig.scale})`,
                                     opacity: bgConfig.opacity 
                                 }" 
                            />
                        </div>

                        <!-- Main Layer -->
                        <canvas ref="canvasRef" width="1500" height="1500" class="main-canvas"></canvas>
                        <!-- Preview Layer -->
                        <canvas ref="previewCanvasRef" width="1500" height="1500" class="preview-canvas"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating Toolbar -->
        <transition name="slide-up-fade">
            <div v-if="isEditMode" class="floating-toolbar">
                
                <!-- Background Control Panel -->
                <transition name="slide-up-fade">
                    <div v-if="actionTool === 'bg_move'" class="bg-control-panel animate-fade-in-up">
                        <div class="panel-header">
                            <span class="panel-title">临摹底图设置</span>
                            <div class="upload-wrapper group">
                                <input type="file" accept="image/*" class="upload-input" @change="handleBgUpload" />
                                <button class="btn-upload">
                                    <i data-lucide="image" class="icon-small"></i> 
                                    {{ bgImage ? '更换图片' : '上传底图' }}
                                </button>
                            </div>
                        </div>
                        
                        <template v-if="bgImage">
                            <div class="bg-controls">
                                <div class="slider-row">
                                    <i data-lucide="zoom-in" class="icon-small text-muted"></i>
                                    <input type="range" v-model="bgConfig.scale" min="0.1" max="3" step="0.01" class="slider" />
                                    <span class="slider-value">{{ Math.round(bgConfig.scale * 100) }}%</span>
                                </div>
                                <div class="slider-row">
                                    <i data-lucide="eye" class="icon-small text-muted"></i>
                                    <input type="range" v-model="bgConfig.opacity" min="0" max="1" step="0.05" class="slider" />
                                    <span class="slider-value">{{ Math.round(bgConfig.opacity * 100) }}%</span>
                                </div>
                                <div class="bg-hint">在画布上拖拽即可移动底图</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="bg-empty">拖拽或点击上方按钮上传底图</div>
                        </template>
                    </div>
                </transition>

                <!-- Main Tools -->
                <div class="main-tools-panel">
                    <div class="tools-group">
                        <button 
                            v-for="tool in actionTools" 
                            :key="tool.id"
                            @click="actionTool = tool.id"
                            class="tool-btn group"
                            :class="{
                                'active': actionTool === tool.id,
                                'active-bg': tool.id === 'bg_move' && bgImage
                            }"
                        >
                            <i :data-lucide="tool.icon" class="icon-medium"></i>
                            <span class="tooltip">
                                {{ tool.name }}
                                <div class="tooltip-arrow"></div>
                            </span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <div class="materials-group hide-scrollbar">
                        <button 
                            v-for="mat in materials" 
                            :key="mat.id"
                            @click="currentMaterial = mat.id; if(actionTool === 'bg_move' || actionTool === 'move') actionTool = 'brush';"
                            class="tool-btn group"
                            :class="{
                                'active': currentMaterial === mat.id && !['bg_move', 'move'].includes(actionTool),
                                'eraser': mat.id === 'eraser'
                            }"
                        >
                            <i :data-lucide="mat.icon" class="icon-medium"></i>
                            <span class="tooltip">
                                {{ mat.name }}
                                <div class="tooltip-arrow"></div>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Toast Notification -->
        <transition name="fade">
            <div v-if="toastMessage" class="toast-notification">
                <i data-lucide="info" class="icon-toast"></i>
                {{ toastMessage }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions } = useAppStore();

const isEditMode = ref(true);
const canvasRef = ref(null);
const previewCanvasRef = ref(null);
const gridRef = ref(null);
const scrollContainer = ref(null);

let ctx = null;
let previewCtx = null;

const GRID_SIZE = 10;
const COLS = 150; 
const ROWS = 150; 
let gridData = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(null));

// Background Image State
const bgImage = ref(null);
const bgConfig = ref({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0.5
});
let isDraggingBg = false;
let bgDragStartX = 0;
let bgDragStartY = 0;
let bgStartTranslateX = 0;
let bgStartTranslateY = 0;

let backupGridData = null;
let backupImageData = null;
let backupBgImage = null;
let backupBgConfig = null;

const actionTool = ref('brush'); 
const currentMaterial = ref('wall');
const isDrawing = ref(false);
const toastMessage = ref('');

const canvasScale = ref(1);
const areaStats = ref({ details: [], total: 0 });

let startX = -1; let startY = -1;
let lastX = -1; let lastY = -1;

const actionTools = [
    { id: 'move', name: '拖拽视图', icon: 'hand' },
    { id: 'brush', name: '自由画笔', icon: 'pen-tool' },
    { id: 'line', name: '直线连线', icon: 'minus' },
    { id: 'rect', name: '矩形框选', icon: 'square' },
    { id: 'bg_move', name: '临摹底图', icon: 'image' }
];

const materials = [
    { id: 'wall', name: '墙体', color: '#222222', icon: 'layers' },
    { id: 'living_room', name: '客厅', color: '#fdf5e6', icon: 'sofa' },
    { id: 'bedroom', name: '卧室', color: '#fff5e6', icon: 'bed' },
    { id: 'bathroom', name: '卫浴', color: '#eef8ff', icon: 'bath' },
    { id: 'kitchen', name: '厨房', color: '#f8f9fa', icon: 'chef-hat' },
    { id: 'balcony', name: '阳台', color: '#e0e0e0', icon: 'sun' },
    { id: 'corridor', name: '过道', color: '#d4d4d4', icon: 'footprints' },
    { id: 'eraser', name: '橡皮擦', color: 'transparent', icon: 'eraser' }
];

const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('请上传图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        bgImage.value = event.target.result;
        // Reset config
        bgConfig.value = { x: 150, y: 150, scale: 0.8, opacity: 0.5 };
        showToast('底图上传成功，可拖拽或缩放对其');
    };
    reader.readAsDataURL(file);
};

const enterEditMode = () => {
    isEditMode.value = true;
    actionTool.value = 'brush';
    backupGridData = gridData.map(row => [...row]);
    backupImageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
    backupBgImage = bgImage.value;
    backupBgConfig = JSON.parse(JSON.stringify(bgConfig.value));
    showToast('已进入编辑模式');
};

const cancelEdit = () => {
    if(confirm('确定要放弃所有修改吗？')) {
        actions.goBack();
    }
};

const saveEdit = async () => {
    // Generate data
    const result = [];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (gridData[y][x]) {
                result.push({ x, y, type: gridData[y][x] });
            }
        }
    }
    
    const success = await actions.saveFloorPlan({
        name: '我的家',
        grid_data: JSON.stringify(result),
        bg_image_url: bgImage.value,
        bg_config: JSON.stringify(bgConfig.value)
    });
    
    if (success) {
        showToast('户型保存成功');
        setTimeout(() => actions.goBack(), 1000);
    } else {
        showToast('保存失败');
    }
};

const showToast = (msg) => {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = ''; }, 3000);
    nextTick(() => { if (window.lucide) window.lucide.createIcons(); });
};

watch([actionTool, currentMaterial, isEditMode], () => {
    nextTick(() => { if (window.lucide) window.lucide.createIcons(); });
});

const getCoords = (e) => {
    const rect = gridRef.value.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    const rawX = (clientX - rect.left) / canvasScale.value;
    const rawY = (clientY - rect.top) / canvasScale.value;
    const x = Math.floor(rawX / GRID_SIZE);
    const y = Math.floor(rawY / GRID_SIZE);
    return { x, y, rawX, rawY, clientX, clientY };
};

const paintPoint = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    if (currentMaterial.value === 'eraser') {
        gridData[y][x] = null;
        ctx.clearRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    } else {
        gridData[y][x] = currentMaterial.value;
        const mat = materials.find(m => m.id === currentMaterial.value);
        ctx.fillStyle = mat.color;
        ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
};

const applyPoints = (pts) => { pts.forEach(p => paintPoint(p.x, p.y)); };

const getLinePoints = (x0, y0, x1, y1) => {
    const pts = [];
    const dx = Math.abs(x1 - x0); const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1; const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    let cx = x0; let cy = y0;
    while(true) {
        pts.push({x: cx, y: cy});
        if ((cx === x1) && (cy === y1)) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 < dx) { err += dx; cy += sy; }
    }
    return pts;
};

const getRectPoints = (x0, y0, x1, y1) => {
    const pts = [];
    const minX = Math.min(x0, x1); const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1); const maxY = Math.max(y0, y1);
    for (let i = minY; i <= maxY; i++) {
        for (let j = minX; j <= maxX; j++) pts.push({x: j, y: i});
    }
    return pts;
};

const renderPreview = (x0, y0, x1, y1, shape) => {
    previewCtx.clearRect(0, 0, COLS * GRID_SIZE, ROWS * GRID_SIZE);
    let drawPoints = [];
    if (shape === 'line') drawPoints = getLinePoints(x0, y0, x1, y1);
    else if (shape === 'rect') drawPoints = getRectPoints(x0, y0, x1, y1);

    if (currentMaterial.value === 'eraser') {
        previewCtx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    } else {
        const mat = materials.find(m => m.id === currentMaterial.value);
        previewCtx.fillStyle = mat.color;
        previewCtx.globalAlpha = 0.7;
    }

    drawPoints.forEach(p => {
        previewCtx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    previewCtx.globalAlpha = 1.0;

    const w = Math.abs(x1 - x0) + 1;
    const h = Math.abs(y1 - y0) + 1;
    let text = "";
    
    if (shape === 'rect') text = `${w * 10}cm x ${h * 10}cm`;
    else if (shape === 'line') {
        const len = Math.round(Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)) * 10);
        text = `${len}cm`;
    }

    const cx = ((x0 + x1) / 2) * GRID_SIZE + GRID_SIZE/2;
    const cy = ((y0 + y1) / 2) * GRID_SIZE - 8;

    previewCtx.font = "900 14px sans-serif";
    previewCtx.textAlign = "center";
    previewCtx.textBaseline = "bottom";
    previewCtx.strokeStyle = "white";
    previewCtx.lineWidth = 4;
    previewCtx.strokeText(text, cx, cy);
    previewCtx.fillStyle = "#111111";
    previewCtx.fillText(text, cx, cy);
};

const startDraw = (e) => {
    if (!isEditMode.value || actionTool.value === 'move') return;
    
    const { x, y, clientX, clientY } = getCoords(e);
    
    if (actionTool.value === 'bg_move') {
        isDraggingBg = true;
        bgDragStartX = clientX;
        bgDragStartY = clientY;
        bgStartTranslateX = bgConfig.value.x;
        bgStartTranslateY = bgConfig.value.y;
        return;
    }

    isDrawing.value = true;
    startX = x; startY = y;
    lastX = x; lastY = y;
    
    if (actionTool.value === 'brush') paintPoint(x, y);
};

const draw = (e) => {
    if (!isEditMode.value) return;
    const { x, y, clientX, clientY } = getCoords(e);

    if (actionTool.value === 'bg_move' && isDraggingBg) {
        const dx = clientX - bgDragStartX;
        const dy = clientY - bgDragStartY;
        bgConfig.value.x = bgStartTranslateX + dx;
        bgConfig.value.y = bgStartTranslateY + dy;
        return;
    }

    if (!isDrawing.value) return;
    
    if (actionTool.value === 'brush') {
        if (lastX !== -1 && lastY !== -1) applyPoints(getLinePoints(lastX, lastY, x, y));
        else paintPoint(x, y);
    } else if (actionTool.value === 'line' || actionTool.value === 'rect') {
        renderPreview(startX, startY, x, y, actionTool.value);
    }
    
    lastX = x; lastY = y;
};

const endDraw = (e) => {
    isDraggingBg = false;
    if (!isDrawing.value) return;
    isDrawing.value = false;
    
    if (actionTool.value === 'line' || actionTool.value === 'rect') {
        const finalX = lastX !== -1 ? lastX : startX;
        const finalY = lastY !== -1 ? lastY : startY;
        
        previewCtx.clearRect(0, 0, COLS * GRID_SIZE, ROWS * GRID_SIZE);
        
        if (actionTool.value === 'line') applyPoints(getLinePoints(startX, startY, finalX, finalY));
        else if (actionTool.value === 'rect') applyPoints(getRectPoints(startX, startY, finalX, finalY));
    }
    
    startX = -1; startY = -1;
    lastX = -1; lastY = -1;
    
    calculateAreas();
};

const handleTouchStart = (e) => {
    if (!isEditMode.value || actionTool.value === 'move') return;
    e.preventDefault(); startDraw(e);
};

const handleTouchMove = (e) => {
    if (!isEditMode.value || actionTool.value === 'move') return;
    e.preventDefault(); draw(e);
};

const clearCanvas = () => {
    if(confirm('确定要清空整块画布吗？（需保存后生效）')) {
        ctx.clearRect(0, 0, COLS * GRID_SIZE, ROWS * GRID_SIZE);
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) gridData[y][x] = null;
        }
        calculateAreas();
    }
};

const zoomIn = () => { canvasScale.value = Math.min(3, canvasScale.value + 0.1); };
const zoomOut = () => { canvasScale.value = Math.max(0.1, canvasScale.value - 0.1); };

const calculateAreas = () => {
    const counts = {};
    for(let y=0; y<ROWS; y++) {
        for(let x=0; x<COLS; x++) {
            const type = gridData[y][x];
            if(type && type !== 'wall' && type !== 'eraser') {
                counts[type] = (counts[type] || 0) + 1;
            }
        }
    }
    
    const stats = [];
    let total = 0;
    materials.forEach(mat => {
        if (counts[mat.id]) {
            const area = (counts[mat.id] * 0.01).toFixed(1);
            stats.push({ name: mat.name, area, color: mat.color, icon: mat.icon });
            total += parseFloat(area);
        }
    });
    areaStats.value = { details: stats, total: total.toFixed(1) };
    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
    });
};

const autoFit = () => {
    if (!scrollContainer.value) return;
    
    let minX = COLS, maxX = 0, minY = ROWS, maxY = 0;
    let hasData = false;
    for(let y=0; y<ROWS; y++) {
        for(let x=0; x<COLS; x++) {
            if(gridData[y][x]) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                hasData = true;
            }
        }
    }
    
    if(!hasData) {
        canvasScale.value = window.innerWidth < 600 ? 0.3 : 1;
        return;
    }

    const contentWidth = (maxX - minX + 1) * GRID_SIZE;
    const containerWidth = scrollContainer.value.clientWidth;
    const padding = 40;
    
    if (window.innerWidth < 600 || contentWidth + padding > containerWidth) {
        canvasScale.value = Math.min(1, (containerWidth - padding) / contentWidth);
    } else {
        canvasScale.value = 1;
    }
    
    nextTick(() => {
        const scaledMinX = minX * GRID_SIZE * canvasScale.value;
        const scaledMinY = minY * GRID_SIZE * canvasScale.value;
        scrollContainer.value.scrollLeft = Math.max(0, scaledMinX - 20);
        scrollContainer.value.scrollTop = Math.max(0, scaledMinY - 20);
    });
};

const drawRect = (x, y, w, h, toolId) => {
    const mat = materials.find(m => m.id === toolId);
    if (!mat) return;
    ctx.fillStyle = mat.color;
    for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
            gridData[i][j] = toolId;
            ctx.fillRect(j * GRID_SIZE, i * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }
};

const initDemo = () => {
    // If we have data from database, load it
    if (state.floorPlan && state.floorPlan.grid_data) {
        try {
            let data = state.floorPlan.grid_data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
            }
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item && item.y !== undefined && item.x !== undefined) {
                        gridData[item.y][item.x] = item.type;
                        const mat = materials.find(m => m.id === item.type);
                        if (mat) {
                            ctx.fillStyle = mat.color;
                            ctx.fillRect(item.x * GRID_SIZE, item.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                        }
                    }
                });
                
                if (state.floorPlan.bg_image_url) {
                    bgImage.value = state.floorPlan.bg_image_url;
                }
                if (state.floorPlan.bg_config) {
                    let config = state.floorPlan.bg_config;
                    if (typeof config === 'string') {
                        config = JSON.parse(config);
                    }
                    bgConfig.value = config;
                }
                calculateAreas();
                autoFit();
                return;
            }
        } catch (e) {
            console.error('Failed to parse saved floor plan data:', e);
        }
    }

    // Otherwise load default demo data
    const ox = 20; const oy = 20;
    drawRect(ox+24, oy+8, 88, 2, 'wall'); 
    drawRect(ox+24, oy+8, 2, 44, 'wall');
    drawRect(ox+10, oy+52, 2, 54, 'wall');
    drawRect(ox+110, oy+8, 2, 40, 'wall');
    drawRect(ox+104, oy+48, 2, 38, 'wall');
    drawRect(ox+10, oy+104, 34, 2, 'wall');
    drawRect(ox+44, oy+114, 26, 2, 'wall');
    drawRect(ox+70, oy+84, 36, 2, 'wall');  
    drawRect(ox+26, oy+50, 78, 2, 'wall'); 
    drawRect(ox+44, oy+84, 26, 2, 'wall'); 
    drawRect(ox+12, oy+64, 16, 2, 'wall'); 
    drawRect(ox+42, oy+52, 2, 54, 'wall'); 
    drawRect(ox+68, oy+52, 2, 34, 'wall'); 
    drawRect(ox+86, oy+52, 2, 34, 'wall'); 
    drawRect(ox+70, oy+86, 2, 28, 'wall'); 
    drawRect(ox+12, oy+15, 14, 29, 'balcony');
    drawRect(ox+26, oy+10, 65, 40, 'living_room');
    drawRect(ox+91, oy+20, 19, 28, 'living_room');
    drawRect(ox+44, oy+52, 24, 32, 'bedroom');
    drawRect(ox+70, oy+52, 16, 22, 'bathroom');
    drawRect(ox+88, oy+52, 16, 22, 'kitchen');
    drawRect(ox+12, oy+66, 30, 38, 'bedroom');
    drawRect(ox+28, oy+52, 14, 14, 'bedroom');
    drawRect(ox+44, oy+86, 26, 28, 'bedroom');
    drawRect(ox+58, oy+74, 10, 10, 'corridor');
    drawRect(ox+70, oy+74, 34, 10, 'balcony');
    
    calculateAreas();
    autoFit();
};

onMounted(() => {
    ctx = canvasRef.value.getContext('2d', { alpha: true });
    previewCtx = previewCanvasRef.value.getContext('2d', { alpha: true });
    
    // watch for floorPlan data changes from the backend
    watch(() => state.floorPlan, (newVal) => {
        if (newVal) {
            // clear canvas before redrawing
            ctx.clearRect(0, 0, COLS * GRID_SIZE, ROWS * GRID_SIZE);
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) gridData[y][x] = null;
            }
            initDemo();
        }
    }, { deep: true });

    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
        initDemo(); 
        if(scrollContainer.value) {
            scrollContainer.value.scrollLeft = 150;
            scrollContainer.value.scrollTop = 150;
        }
    });
});
</script>

<style scoped lang="scss">
.edit-home-container {
    position: relative;
}

.edit-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    pointer-events: none;

    @media (min-width: 640px) {
        padding: 2rem;
    }
}

.header-left {
    pointer-events: auto;
    .title {
        font-size: 1.875rem; line-height: 2.25rem;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: $color-black;
    }
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    
    @media (min-width: 640px) {
        gap: 1rem;
    }

    button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.25rem;
        border-radius: 9999px;
        font-size: 0.75rem; line-height: 1rem;
        font-weight: 700;
        transition: all 0.3s ease;

        &.btn-cancel {
            background-color: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.6);
            &:hover {
                background-color: rgba(0, 0, 0, 0.1);
                color: $color-black;
            }
        }

        &.btn-clear {
            background-color: rgba(255, 59, 48, 0.1);
            color: $color-danger;
            &:hover {
                background-color: $color-danger;
                color: $color-white;
            }
        }

        &.btn-save {
            background-color: $color-black;
            color: $color-white;
            @include shadow-hover;
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            }
            .icon {
                width: 1rem;
                height: 1rem;
                transition: transform 0.3s ease;
            }
            &:hover .icon {
                transform: scale(1.1);
            }
        }
    }

    @media (min-width: 640px) {
        button {
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
        }
    }
}

.canvas-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    touch-action: pan-x pan-y;
}

.canvas-scroll-content {
    min-width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.canvas-wrapper {
    position: relative;
    transform-origin: center center;
}

.editor-grid-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 1500px;
    height: 1500px;
    transform-origin: 0 0;
    background-color: $color-white;
    background-image: 
        linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), 
        linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 10px 10px;
    box-shadow: 0 0 50px rgba(0,0,0,0.05);

    &.cursor-grab { cursor: grab; }
    &.cursor-grabbing { cursor: grabbing; }
    &.cursor-crosshair { cursor: crosshair; }
    &.cursor-move { cursor: move; }
}

.canvas-hint {
    position: absolute;
    top: 1rem;
    left: 1rem;
    pointer-events: none;
    z-index: 10;
    .hint-text {
        font-size: 0.75rem; line-height: 1rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(0, 0, 0, 0.3);
        background-color: rgba(255, 255, 255, 0.8);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
    }
}

.bg-image-layer {
    @include absolute-inset;
    overflow: hidden;
    pointer-events: none;
    .bg-image {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
    }
}

.main-canvas, .preview-canvas {
    @include absolute-inset;
    pointer-events: none;
}
.preview-canvas {
    z-index: 20;
}

// Toolbar
.floating-toolbar {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 95%;
    max-width: 600px;
    pointer-events: none;

    @media (min-width: 640px) {
        bottom: 2rem;
        gap: 0.75rem;
        width: auto;
    }
}

.bg-control-panel {
    width: 100%;
    @include glassmorphism(rgba(255, 255, 255, 0.8), 24px);
    border-radius: 1.5rem;
    @include shadow-hover;
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 0.75rem;
    pointer-events: auto;

    @media (min-width: 640px) {
        padding: 1.25rem;
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        
        @media (min-width: 640px) {
            margin-bottom: 0.75rem;
        }

        .panel-title {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(0, 0, 0, 0.4);
            
            @media (min-width: 640px) {
                font-size: 0.75rem; line-height: 1rem;
            }
        }
    }

    .upload-wrapper {
        position: relative;
        overflow: hidden;
        .upload-input {
            @include absolute-inset;
            opacity: 0;
            cursor: pointer;
            z-index: 10;
        }
        .btn-upload {
            padding: 0.25rem 0.625rem;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            transition: background-color 0.3s;

            @media (min-width: 640px) {
                padding: 0.25rem 0.75rem;
                font-size: 0.75rem; line-height: 1rem;
            }

            &:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
        }
    }

    .bg-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        
        @media (min-width: 640px) {
            gap: 1rem;
        }

        .slider-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .slider {
                flex: 1;
                accent-color: $color-black;
                height: 0.375rem;
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 9999px;
                appearance: none;
                outline: none;
                cursor: pointer;
            }

            .slider-value {
                font-size: 10px;
                font-weight: 700;
                font-family: $font-mono;
                width: 1.75rem;
                text-align: right;
                flex-shrink: 0;

                @media (min-width: 640px) {
                    font-size: 0.75rem; line-height: 1rem;
                    width: 2rem;
                }
            }
        }

        .bg-hint {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-align: center;
            color: rgba(0, 0, 0, 0.4);
            background-color: rgba(0, 0, 0, 0.05);
            padding: 0.5rem;
            border-radius: 0.75rem;
            margin-top: 0.5rem;

            @media (min-width: 640px) {
                font-size: 10px;
                margin-top: 0.75rem;
            }
        }
    }

    .bg-empty {
        text-align: center;
        padding: 1.25rem 0;
        border: 2px dashed rgba(0, 0, 0, 0.1);
        border-radius: 1rem;
        font-size: 10px;
        color: rgba(0, 0, 0, 0.4);
        font-weight: 700;
        letter-spacing: 0.1em;
        background-color: rgba(0, 0, 0, 0.02);

        @media (min-width: 640px) {
            padding: 1.5rem 0;
            font-size: 0.75rem; line-height: 1rem;
        }
    }
}

.main-tools-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.375rem;
    @include glassmorphism(rgba(255, 255, 255, 0.8), 24px);
    border-radius: 2rem;
    @include shadow-hover;
    border: 1px solid rgba(255, 255, 255, 0.4);
    gap: 0.375rem;
    pointer-events: auto;

    @media (min-width: 640px) {
        flex-direction: row;
        padding: 0.5rem;
        border-radius: 9999px;
        gap: 0.5rem;
        width: auto;
    }
}

.tools-group, .materials-group {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    width: 100%;
    justify-content: space-between;
    padding: 0 0.5rem;

    @media (min-width: 640px) {
        width: auto;
        justify-content: flex-start;
        gap: 0.25rem;
        padding: 0;
    }
}

.materials-group {
    overflow-x: auto;
    padding-bottom: 0.25rem;
    
    @media (min-width: 640px) {
        padding-bottom: 0;
    }
}

.divider {
    width: 100%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 0 0.25rem;

    @media (min-width: 640px) {
        width: 1px;
        height: 2rem;
    }
}

.tool-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    flex-shrink: 0;
    color: rgba(0, 0, 0, 0.5);

    @media (min-width: 640px) {
        width: 2.75rem;
        height: 2.75rem;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: $color-black;
    }

    &.active {
        background-color: $color-black;
        color: $color-white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
        z-index: 10;
    }

    &.active-bg {
        color: $color-primary;
    }

    &.eraser {
        margin-left: 0.25rem;
        
        @media (min-width: 640px) {
            border-left: 1px solid rgba(0, 0, 0, 0.1);
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }

    .tooltip {
        display: none;

        @media (min-width: 640px) {
            display: block;
            position: absolute;
            top: -2.5rem;
            padding: 0.375rem 0.75rem;
            background-color: $color-black;
            color: $color-white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 0.5rem;
            opacity: 0;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transition: opacity 0.2s;

            .tooltip-arrow {
                position: absolute;
                bottom: -0.25rem;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 0.5rem;
                height: 0.5rem;
                background-color: $color-black;
            }
        }
    }

    &:hover .tooltip {
        opacity: 1;
    }
}

.icon-small { width: 0.875rem; height: 0.875rem; }
.icon-medium { width: 1rem; height: 1rem; @media (min-width: 640px) { width: 1.125rem; height: 1.125rem; } }
.text-muted { color: rgba(0, 0, 0, 0.4); }

.toast-notification {
    position: absolute;
    top: 6rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(24px);
    color: $color-white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 0.75rem; line-height: 1rem;
    font-weight: 700;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    pointer-events: none;

    @media (min-width: 640px) {
        top: 7rem;
    }

    .icon-toast {
        width: 1rem;
        height: 1rem;
        color: $color-primary;
    }
}
</style>

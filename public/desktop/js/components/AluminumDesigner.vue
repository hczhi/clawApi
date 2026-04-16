<template>
    <div class="aluminum-designer">
        <header class="ad-header">
            <div class="ad-title-wrapper">
                <h1 class="ad-title">铝型材设计器</h1>
                <p class="ad-subtitle">ALUMINUM PROFILE DESIGNER</p>
            </div>
            <div class="ad-actions">
                <button @click="loadDraft" class="btn-outline">加载草稿</button>
                <button @click="saveDraft" class="btn-primary">保存草稿</button>
            </div>
        </header>

        <div class="ad-layout" style="grid-template-columns: 1fr 300px; position: relative;">
            <!-- Left Panel: Encyclopedia (Absolute positioning over the main canvas) -->
            <div class="ad-sidebar" v-if="showLibrary" style="position: absolute; left: 16px; top: 16px; z-index: 100; max-height: calc(100vh - 120px); overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.1); width: 300px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 12px; transition: all 0.3s ease;">
                <div class="ad-sidebar-header" style="display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: inherit; z-index: 10; padding: 16px;">
                    <h2 class="ad-card-title" style="margin: 0;">型材与配件图鉴</h2>
                    <button @click="toggleLibrary" class="btn-outline" style="border: none; padding: 4px; height: auto;">
                        <i data-lucide="x" class="ad-icon-sm"></i>
                    </button>
                </div>
                <!-- Profiles -->
                <div class="ad-card" style="border: none; box-shadow: none;">
                    <h2 class="ad-card-title">型材规格</h2>
                    <div class="ad-list">
                        <div v-for="profile in profiles" :key="profile.id" class="ad-list-item">
                            <div class="ad-item-header">
                                <h3 class="ad-item-title">{{ profile.name }}</h3>
                                <span class="ad-badge">{{ profile.size }}</span>
                            </div>
                            <p class="ad-item-desc">{{ profile.desc }}</p>
                            <p class="ad-item-meta">壁厚: {{ profile.thickness }}</p>
                        </div>
                    </div>
                </div>

                <!-- Accessories -->
                <div class="ad-card">
                    <h2 class="ad-card-title">常见配件库</h2>
                    <div class="ad-list ad-accessories-list">
                        <div v-for="acc in accessories" :key="acc.id" class="ad-list-item">
                            <div class="ad-item-header">
                                <h3 class="ad-item-title">{{ acc.name }}</h3>
                                <span class="ad-badge">{{ acc.type }}</span>
                            </div>
                            <p class="ad-item-desc">{{ acc.desc }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Canvas -->
            <div class="ad-main">
                <!-- 3D Preview Card -->
                <div class="ad-card ad-preview-card">
                    <div class="ad-preview-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div>
                            <h2 class="ad-card-title">空间视图与平面视图</h2>
                            <span class="ad-preview-tip"><i data-lucide="mouse-pointer-2" class="ad-icon-sm"></i> 拖拽选中部件进行拼搭</span>
                        </div>
                        <button @click="toggleLibrary" class="btn-outline" style="height: 32px; padding: 0 12px; font-size: 12px;">
                            <i data-lucide="book-open" class="ad-icon-sm" style="margin-right: 4px;"></i> 
                            {{ showLibrary ? '隐藏型材库' : '展开型材配件库' }}
                        </button>
                    </div>
                    <div style="display: flex; gap: 16px; height: 60vh; min-height: 500px; width: 100%;">
                        <!-- 3D View -->
                        <div style="flex: 1; position: relative; border-radius: 16px; overflow: hidden;">
                            <div style="position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(255,255,255,0.8); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid rgba(0,0,0,0.1);">3D 自由视角</div>
                            <div class="ad-preview-container" ref="previewContainer" style="width: 100%; height: 100%; border-radius: 0;"></div>
                        </div>
                        <!-- 2D View -->
                        <div style="flex: 1; position: relative; border-radius: 16px; overflow: hidden; background-color: #f0f2f5; border: 1px solid rgba(0,0,0,0.05);">
                            <div style="position: absolute; top: 12px; left: 12px; z-index: 10; display: flex; gap: 4px;">
                                <button @click="set2DView('front')" :class="['view-btn', current2DView === 'front' ? 'active' : '']">正视图</button>
                                <button @click="set2DView('top')" :class="['view-btn', current2DView === 'top' ? 'active' : '']">俯视图</button>
                                <button @click="set2DView('side')" :class="['view-btn', current2DView === 'side' ? 'active' : '']">侧视图</button>
                            </div>
                            <div class="ad-preview-container" ref="preview2dContainer" style="width: 100%; height: 100%; border-radius: 0; background-color: #e8eaed;"></div>
                        </div>
                    </div>
                </div>

                <!-- Edit Selected Beam -->
                <div class="ad-card" v-if="selectedBeamIds.length > 0" style="margin-top: -16px; border-color: #ff6b52; background: rgba(255, 107, 82, 0.05);">
                    <div class="ad-card-header-spaced" style="margin-bottom: 16px;">
                        <h2 class="ad-card-title-lg" style="color: #ff6b52;">
                            {{ selectedBeamIds.length === 1 ? '编辑选中部件' : `已选中 ${selectedBeamIds.length} 个部件` }}
                        </h2>
                        <div style="display: flex; gap: 8px;">
                            <button @click="copySelected" class="btn-outline" style="height: 28px; padding: 0 8px; font-size: 12px; color: #333; border-color: #ccc;">复制 (Ctrl+C)</button>
                            <button @click="pasteBeams" class="btn-outline" style="height: 28px; padding: 0 8px; font-size: 12px; color: #333; border-color: #ccc;">粘贴 (Ctrl+V)</button>
                            <p class="ad-card-subtitle" style="margin:0; line-height: 28px;" v-if="selectedBeamIds.length === 1">ID: {{ selectedBeamIds[0].substring(0,4) }}</p>
                        </div>
                    </div>
                    
                    <div v-if="selectedBeamIds.length === 1 && selectedBeam" class="ad-form-group" style="margin-bottom: 0;">
                        <div style="display: flex; gap: 12px; align-items: flex-end; margin-bottom: 12px;">
                            <div class="ad-input-group" style="flex: 1;">
                                <label class="ad-sublabel">方向 (轴向)</label>
                                <select v-model="selectedBeam.axis" class="ad-input" style="height: 44px; padding: 0 12px; font-size: 14px;">
                                    <option value="x">X轴 (左右横向)</option>
                                    <option value="y">Y轴 (上下立柱)</option>
                                    <option value="z">Z轴 (前后纵向)</option>
                                </select>
                            </div>
                            <div class="ad-input-group" style="flex: 1;">
                                <label class="ad-sublabel">长度 (mm)</label>
                                <input type="number" v-model.number="selectedBeam.length" class="ad-input" style="height: 44px; padding: 0 12px; background: #fff; font-size: 14px;">
                            </div>
                            <button @click="deleteSelected" class="btn-outline" style="height: 44px; color: #ff6b52; border-color: #ff6b52; padding: 0 16px;">删除 (Del)</button>
                        </div>
                        
                        <label class="ad-sublabel">微调坐标 (mm) - 也可在上方3D视图中直接拖拽箭头</label>
                        <div class="ad-grid-3">
                            <div class="ad-input-group">
                                <label class="ad-sublabel" style="font-size: 10px;">X (左右)</label>
                                <input type="number" v-model.number="selectedBeam.x" class="ad-input" style="height: 40px; padding: 0 12px; background: #fff; font-size: 14px;">
                            </div>
                            <div class="ad-input-group">
                                <label class="ad-sublabel" style="font-size: 10px;">Y (高度)</label>
                                <input type="number" v-model.number="selectedBeam.y" class="ad-input" style="height: 40px; padding: 0 12px; background: #fff; font-size: 14px;">
                            </div>
                            <div class="ad-input-group">
                                <label class="ad-sublabel" style="font-size: 10px;">Z (前后)</label>
                                <input type="number" v-model.number="selectedBeam.z" class="ad-input" style="height: 40px; padding: 0 12px; background: #fff; font-size: 14px;">
                            </div>
                        </div>
                    </div>

                    <div v-else class="ad-form-group" style="margin-bottom: 0;">
                        <div v-if="selectedBeamIds.length === 2" style="padding: 12px; background: rgba(255,255,255,0.8); border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px dashed rgba(0,0,0,0.1);">
                            <span class="ad-sublabel" style="margin:0;"><i data-lucide="ruler" class="ad-icon-sm" style="vertical-align: text-bottom; margin-right: 4px;"></i>两部件中心距 (测量):</span>
                            <strong style="color: #ff6b52; font-size: 18px;">{{ measureDistance() }} mm</strong>
                        </div>
                        <button @click="deleteSelected" class="btn-outline" style="width: 100%; height: 44px; color: #ff6b52; border-color: #ff6b52;">删除选中的 {{ selectedBeamIds.length }} 个部件 (Del)</button>
                    </div>
                </div>

                <div class="ad-card sticky-top">
                    <div class="ad-card-header-spaced">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h2 class="ad-card-title-lg">设计参数</h2>
                                <p class="ad-card-subtitle">选择家具模板并设置尺寸，我们将自动计算所需的物料。</p>
                            </div>
                            <button @click="addCustomBeam" class="btn-primary" style="background: #34d399; border-color: #34d399; flex-shrink: 0;">+ 添加一根铝材</button>
                        </div>
                    </div>

                    <!-- Template Selection -->
                    <div class="ad-form-group">
                        <label class="ad-label">家具类型</label>
                        <div class="ad-grid-2">
                            <button v-for="tpl in templates" :key="tpl.id"
                                    @click="selectTemplate(tpl)"
                                    class="ad-template-btn"
                                    :class="{ active: design.templateId === tpl.id }">
                                <div class="ad-icon-wrapper">
                                    <i :data-lucide="tpl.icon" class="ad-icon"></i>
                                </div>
                                <h4 class="ad-template-title">{{ tpl.name }}</h4>
                            </button>
                        </div>
                    </div>

                    <!-- Dimensions -->
                    <div class="ad-form-group">
                        <label class="ad-label">外部尺寸 (毫米 mm)</label>
                        <div class="ad-grid-3">
                            <div class="ad-input-group">
                                <label class="ad-sublabel">宽度 W</label>
                                <input type="number" v-model.number="design.width" class="ad-input">
                            </div>
                            <div class="ad-input-group">
                                <label class="ad-sublabel">深度 D</label>
                                <input type="number" v-model.number="design.depth" class="ad-input">
                            </div>
                            <div class="ad-input-group">
                                <label class="ad-sublabel">高度 H</label>
                                <input type="number" v-model.number="design.height" class="ad-input">
                            </div>
                        </div>
                    </div>

                    <!-- Layer Count (if applicable) -->
                    <div class="ad-form-group" v-if="['shelf', 'shoe_cabinet', 'custom'].includes(design.templateId)">
                        <label class="ad-label">层数 (包含顶层和底层)</label>
                        <div class="ad-counter">
                            <button @click="design.layers = Math.max(2, design.layers - 1)" class="ad-counter-btn">-</button>
                            <span class="ad-counter-val">{{ design.layers }}</span>
                            <button @click="design.layers++" class="ad-counter-btn">+</button>
                        </div>
                    </div>

                    <!-- Profile Selection -->
                    <div class="ad-form-group">
                        <label class="ad-label">主框架型材规格</label>
                        <div class="ad-grid-4">
                            <button v-for="pId in ['2020', '3030', '4040', '4080']" :key="pId"
                                    @click="design.profileId = pId"
                                    class="ad-profile-btn"
                                    :class="{ active: design.profileId === pId }">
                                {{ pId }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: BOM Output -->
            <div class="ad-bom">
                <div class="ad-bom-card sticky-top">
                    <div class="ad-bom-header">
                        <div>
                            <h2 class="ad-bom-title">BOM 物料清单</h2>
                            <p class="ad-bom-subtitle">基于当前参数自动计算的耗材明细</p>
                        </div>
                    </div>

                    <!-- Profiles List -->
                    <div class="ad-bom-section">
                        <h3 class="ad-bom-section-title">型材切割尺寸 ({{ design.profileId }})</h3>
                        <ul class="ad-bom-list">
                            <li v-for="(item, idx) in bom.profiles" :key="idx" class="ad-bom-item">
                                <div class="ad-bom-item-info">
                                    <span class="ad-bom-item-name">{{ item.name }}</span>
                                    <span class="ad-bom-item-meta">长度: {{ item.length }}mm</span>
                                </div>
                                <span class="ad-bom-badge">x{{ item.qty }}</span>
                            </li>
                        </ul>
                        <div class="ad-bom-summary">
                            <span class="ad-bom-summary-label">总长度估算</span>
                            <span class="ad-bom-summary-val">{{ (bom.totalProfileLength / 1000).toFixed(2) }} 米</span>
                        </div>
                    </div>

                    <!-- Accessories List -->
                    <div class="ad-bom-section">
                        <h3 class="ad-bom-section-title">配件与紧固件</h3>
                        <ul class="ad-bom-list">
                            <li v-for="(item, idx) in bom.accessories" :key="idx" class="ad-bom-item">
                                <div class="ad-bom-item-info">
                                    <span class="ad-bom-item-name">{{ item.name }}</span>
                                    <span class="ad-bom-item-meta" v-if="item.desc">{{ item.desc }}</span>
                                </div>
                                <span class="ad-bom-badge">x{{ item.qty }}</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="ad-bom-tip">
                        <p>
                            <strong>温馨提示：</strong>
                            购买铝型材时，商家通常会收取 5%-8% 的切割损耗费。请将此清单直接发给淘宝卖家，让他们帮忙核对并配齐配件（如角件的螺丝可能需要匹配特定型号）。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

const previewContainer = ref(null);
const preview2dContainer = ref(null);
const showLibrary = ref(false);

const toggleLibrary = () => {
    showLibrary.value = !showLibrary.value;
    // Resize Three.js canvases after layout reflow
    setTimeout(() => {
        onWindowResize();
    }, 100);
};

// Three.js variables
let scene, camera, renderer, controls;
let camera2d, renderer2d, controls2d;
let transformControl, transformControl2d;
let frameId;
let aluminumGroup;
const raycaster = new window.THREE.Raycaster();
const mouse = new window.THREE.Vector2();

let isDragging = false;
const current2DView = ref('front');

const profiles = [
    { id: '2020', name: '2020超轻型', size: '20x20mm', thickness: '2mm', desc: '放显示器用，超轻型支架，承重低' },
    { id: '3030', name: '3030轻型', size: '30x30mm', thickness: '3mm', desc: '轻型用，小型置物架，阳台小柜子' },
    { id: '4040', name: '4040标准', size: '40x40mm', thickness: '3~4mm', desc: '家具主框架，书桌，鞋柜，高承重' },
    { id: '4080', name: '4080重型', size: '40x80mm', thickness: '5mm', desc: '重型承重梁，悬浮床主框架' },
    { id: '4041', name: '4041特殊', size: '40x40mm', thickness: '特款', desc: '特殊开孔款式，用于特定连接需求' }
];

const accessories = [
    { id: 'corner_bracket', name: '角件 (角码)', desc: '90度直角连接两根型材，最核心的连接件', type: '连接' },
    { id: 't_nut', name: 'T型螺母/滑块', desc: '放入型材槽内，配合内六角螺栓固定角件等', type: '紧固' },
    { id: 'hex_bolt', name: '内六角螺栓', desc: '配合T型螺母使用，紧固力量大', type: '紧固' },
    { id: 'end_cap', name: '端盖', desc: '封住型材切断面，防止割手且美观', type: '装饰' },
    { id: 'slot_cover', name: '平条/封槽胶条', desc: '嵌入型材槽内，防尘并使表面平整', type: '装饰' },
    { id: 'hidden_connector', name: '内置连接件', desc: '隐藏式90度连接，外观看不到角件，更高级', type: '连接' },
    { id: 'hinge', name: '金属合页', desc: '连接柜门，实现开合', type: '活动' },
    { id: 'foot', name: '调节地脚', desc: '安装在底部，调节高低并防滑', type: '支撑' },
    { id: 'caster', name: '万向轮', desc: '带刹车脚轮，方便移动家具', type: '支撑' }
];

const templates = [
    { id: 'desk', name: '电脑书桌 (1层)', icon: 'monitor', defaultW: 1400, defaultD: 600, defaultH: 750, defaultLayers: 2, defaultProfile: '4040' },
    { id: 'shoe_cabinet', name: '玄关鞋柜 (多层)', icon: 'archive', defaultW: 800, defaultD: 350, defaultH: 1000, defaultLayers: 4, defaultProfile: '3030' },
    { id: 'shelf', name: '多层置物架 (多层)', icon: 'layers', defaultW: 1000, defaultD: 400, defaultH: 1800, defaultLayers: 5, defaultProfile: '3030' },
    { id: 'custom', name: '自定义框架', icon: 'settings', defaultW: 1000, defaultD: 1000, defaultH: 1000, defaultLayers: 2, defaultProfile: '4040' }
];

const design = ref({
    templateId: 'desk',
    width: 1400,
    depth: 600,
    height: 750,
    layers: 2,
    profileId: '4040',
    beams: []
});

const selectedBeamIds = ref([]);
let clipboardBeams = [];

const selectedBeam = computed(() => {
    if (selectedBeamIds.value.length === 1) {
        return design.value.beams.find(b => b.id === selectedBeamIds.value[0]);
    }
    return null;
});

const deleteSelected = () => {
    if (selectedBeamIds.value.length === 0) return;
    design.value.beams = design.value.beams.filter(b => !selectedBeamIds.value.includes(b.id));
    selectedBeamIds.value = [];
};

const copySelected = () => {
    const beamsToCopy = design.value.beams.filter(b => selectedBeamIds.value.includes(b.id));
    if (beamsToCopy.length > 0) {
        clipboardBeams = beamsToCopy.map(b => JSON.parse(JSON.stringify(b)));
    }
};

const pasteBeams = () => {
    if (!clipboardBeams || clipboardBeams.length === 0) return;
    const newIds = [];
    clipboardBeams.forEach(b => {
        const uid = () => Math.random().toString(36).substr(2, 9);
        const newBeam = {
            ...b,
            id: uid(),
            x: b.x + profileSize.value,
            y: b.y + profileSize.value,
            z: b.z + profileSize.value
        };
        design.value.beams.push(newBeam);
        newIds.push(newBeam.id);
    });
    selectedBeamIds.value = newIds;
};

const measureDistance = () => {
    if (selectedBeamIds.value.length !== 2) return 0;
    const b1 = design.value.beams.find(b => b.id === selectedBeamIds.value[0]);
    const b2 = design.value.beams.find(b => b.id === selectedBeamIds.value[1]);
    if (!b1 || !b2) return 0;
    const dx = b1.x - b2.x;
    const dy = b1.y - b2.y;
    const dz = b1.z - b2.z;
    return Math.round(Math.sqrt(dx*dx + dy*dy + dz*dz));
};

const handleKeyDown = (e) => {
    // Only handle if we have selections and are not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copySelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteBeams();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

const selectTemplate = (tpl) => {
    design.value.templateId = tpl.id;
    design.value.width = tpl.defaultW;
    design.value.depth = tpl.defaultD;
    design.value.height = tpl.defaultH;
    design.value.layers = tpl.defaultLayers;
    design.value.profileId = tpl.defaultProfile;
    generateBeams();
    updateIcons();
};

const profileSize = computed(() => {
    const id = design.value.profileId;
    if (id === '2020') return 20;
    if (id === '3030') return 30;
    if (id === '4080') return 40;
    return 40;
});

const generateBeams = () => {
    const w = design.value.width || 0;
    const d = design.value.depth || 0;
    const h = design.value.height || 0;
    const layers = design.value.layers || 2;
    const size = profileSize.value;

    const newBeams = [];
    const halfW = w / 2;
    const halfD = d / 2;
    const halfSize = size / 2;

    const px = halfW - halfSize;
    const pz = halfD - halfSize;
    const py = h / 2;

    const uid = () => Math.random().toString(36).substr(2, 9);

    // Pillars
    newBeams.push({ id: uid(), name: '立柱', axis: 'y', length: h, x: -px, y: py, z: pz });
    newBeams.push({ id: uid(), name: '立柱', axis: 'y', length: h, x: px, y: py, z: pz });
    newBeams.push({ id: uid(), name: '立柱', axis: 'y', length: h, x: -px, y: py, z: -pz });
    newBeams.push({ id: uid(), name: '立柱', axis: 'y', length: h, x: px, y: py, z: -pz });

    // Layers
    for (let i = 0; i < layers; i++) {
        let layerY = halfSize;
        if (layers > 1) {
            const spacing = (h - size) / (layers - 1);
            layerY = halfSize + i * spacing;
        }
        const wLen = w - size * 2;
        newBeams.push({ id: uid(), name: '横梁 (宽)', axis: 'x', length: wLen, x: 0, y: layerY, z: pz });
        newBeams.push({ id: uid(), name: '横梁 (宽)', axis: 'x', length: wLen, x: 0, y: layerY, z: -pz });

        const dLen = d - size * 2;
        newBeams.push({ id: uid(), name: '纵梁 (深)', axis: 'z', length: dLen, x: -px, y: layerY, z: 0 });
        newBeams.push({ id: uid(), name: '纵梁 (深)', axis: 'z', length: dLen, x: px, y: layerY, z: 0 });
    }

    design.value.beams = newBeams;
};

// Watch core parameters to regenerate structure
watch(
    () => [design.value.width, design.value.depth, design.value.height, design.value.layers, design.value.profileId],
    () => {
        generateBeams();
    }
);

// --- Spatial Collision Algorithm for Dynamic BOM ---
const countJoints = () => {
    let joints = 0;
    const beams = design.value.beams;
    if (!beams || beams.length === 0) return 0;
    
    // Add a 2mm tolerance to the bounding box to catch touching/snapped beams
    const s = profileSize.value / 2 + 2; 

    for (let i = 0; i < beams.length; i++) {
        for (let j = i + 1; j < beams.length; j++) {
            const b1 = beams[i];
            const b2 = beams[j];
            
            // Parallel beams don't form standard corner/T joints
            if (b1.axis === b2.axis) continue; 
            
            // Calculate AABB (Axis-Aligned Bounding Box) for b1
            const min1 = {
                x: b1.x - (b1.axis === 'x' ? b1.length/2 : s),
                y: b1.y - (b1.axis === 'y' ? b1.length/2 : s),
                z: b1.z - (b1.axis === 'z' ? b1.length/2 : s)
            };
            const max1 = {
                x: b1.x + (b1.axis === 'x' ? b1.length/2 : s),
                y: b1.y + (b1.axis === 'y' ? b1.length/2 : s),
                z: b1.z + (b1.axis === 'z' ? b1.length/2 : s)
            };
            
            // Calculate AABB for b2
            const min2 = {
                x: b2.x - (b2.axis === 'x' ? b2.length/2 : s),
                y: b2.y - (b2.axis === 'y' ? b2.length/2 : s),
                z: b2.z - (b2.axis === 'z' ? b2.length/2 : s)
            };
            const max2 = {
                x: b2.x + (b2.axis === 'x' ? b2.length/2 : s),
                y: b2.y + (b2.axis === 'y' ? b2.length/2 : s),
                z: b2.z + (b2.axis === 'z' ? b2.length/2 : s)
            };

            // AABB 3D Intersection Test
            if (min1.x <= max2.x && max1.x >= min2.x &&
                min1.y <= max2.y && max1.y >= min2.y &&
                min1.z <= max2.z && max1.z >= min2.z) {
                joints++;
            }
        }
    }
    return joints;
};

const bom = computed(() => {
    const pList = [];
    let totalLength = 0;
    const grouped = {};

    design.value.beams.forEach(b => {
        const key = `${b.name}_${b.length}`;
        if(!grouped[key]) {
            grouped[key] = { name: b.name, length: b.length, qty: 0 };
        }
        grouped[key].qty++;
        totalLength += b.length;
    });

    for (const k in grouped) {
        pList.push(grouped[k]);
    }

    // Calculate Accessories using Spatial Algorithm
    const jointCount = countJoints();
    const cornerBrackets = jointCount * 2;
    const nuts = cornerBrackets * 2;
    const bolts = cornerBrackets * 2;
    
    const columns = design.value.beams.filter(b => b.axis === 'y').length;
    const endCaps = columns * 2 || 4;
    const feet = columns || 4;

    const aList = [
        { name: '角码 (直角连接件)', desc: '含螺丝螺母组', qty: cornerBrackets },
        { name: 'T型螺母/滑块', desc: '配套角码使用', qty: nuts },
        { name: '内六角螺栓', desc: '配套角码使用', qty: bolts },
        { name: '端盖', desc: '封住顶部立柱', qty: endCaps },
        { name: '调节地脚', desc: '带螺杆, 安装在底部', qty: feet }
    ];

    if (design.value.templateId === 'shoe_cabinet') {
        aList.push({ name: '金属合页', desc: '柜门使用', qty: 4 });
    }

    return {
        profiles: pList,
        totalProfileLength: totalLength,
        accessories: aList
    };
});

const saveDraft = () => {
    localStorage.setItem('aluminum_design_draft', JSON.stringify(design.value));
    alert('草稿已保存！');
};

const loadDraft = () => {
    const saved = localStorage.getItem('aluminum_design_draft');
    if (saved) {
        try {
            design.value = JSON.parse(saved);
            updateIcons();
        } catch (e) {
            alert('读取草稿失败');
        }
    } else {
        alert('没有找到已保存的草稿');
    }
};

const updateIcons = () => {
    nextTick(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
};

const set2DView = (view) => {
    current2DView.value = view;
    if (!camera2d || !controls2d) return;
    const h = design.value.height || 1000;
    if (view === 'front') {
        camera2d.position.set(0, h/2, 3000);
        controls2d.target.set(0, h/2, 0);
    } else if (view === 'top') {
        camera2d.position.set(0, 3000, 0);
        controls2d.target.set(0, 0, 0);
    } else if (view === 'side') {
        camera2d.position.set(3000, h/2, 0);
        controls2d.target.set(0, h/2, 0);
    }
    camera2d.updateProjectionMatrix();
    controls2d.update();
};

// --- Three.js 3D Rendering Logic ---
const initThreeJS = () => {
    if (!previewContainer.value || !preview2dContainer.value || !window.THREE) return;

    const width = previewContainer.value.clientWidth;
    const height = previewContainer.value.clientHeight;
    const width2d = preview2dContainer.value.clientWidth;
    const height2d = preview2dContainer.value.clientHeight;

    // Scene
    scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color(0xf0f2f5);

    // --- 3D View Setup ---
    camera = new window.THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(2000, 2000, 2500);

    renderer = new window.THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    previewContainer.value.appendChild(renderer.domElement);

    controls = new window.THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 5000;
    controls.minDistance = 200;

    // --- 2D View Setup ---
    const aspect2d = width2d / height2d;
    const frustumSize = 2500;
    camera2d = new window.THREE.OrthographicCamera(
        frustumSize * aspect2d / -2, 
        frustumSize * aspect2d / 2, 
        frustumSize / 2, 
        frustumSize / -2, 
        1, 10000
    );
    
    renderer2d = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer2d.setSize(width2d, height2d);
    renderer2d.setPixelRatio(window.devicePixelRatio);
    renderer2d.setClearColor(0xe8eaed);
    preview2dContainer.value.appendChild(renderer2d.domElement);

    controls2d = new window.THREE.OrbitControls(camera2d, renderer2d.domElement);
    controls2d.enableRotate = false; // 2D 视图禁止旋转，只能平移和缩放
    controls2d.enableDamping = true;
    controls2d.dampingFactor = 0.05;

    // Lights
    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1000, 2000, 1000);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Grid helper (Floor)
    const gridHelper = new window.THREE.GridHelper(3000, 30, 0x000000, 0x000000);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Group for our aluminum frame
    aluminumGroup = new window.THREE.Group();
    scene.add(aluminumGroup);

    // --- Transform Controls Setup ---
    transformControl = new window.THREE.TransformControls(camera, renderer.domElement);
    transformControl2d = new window.THREE.TransformControls(camera2d, renderer2d.domElement);
    
    transformControl.setTranslationSnap(10);
    transformControl2d.setTranslationSnap(10);
    scene.add(transformControl);
    scene.add(transformControl2d);

    const getSnapPoints = (excludeIds) => {
        const points = [];
        const size = profileSize.value;
        const halfSize = size / 2;

        design.value.beams.forEach(b => {
            if (excludeIds.includes(b.id)) return;

            const x = b.x, y = b.y, z = b.z;
            const halfL = b.length / 2;

            if (b.axis === 'x') {
                points.push({ x: x - halfL, y, z }, { x, y, z }, { x: x + halfL, y, z });
                points.push({ x: x - halfL, y: y + size, z }, { x: x + halfL, y: y + size, z });
                points.push({ x: x - halfL, y: y - size, z }, { x: x + halfL, y: y - size, z });
            } else if (b.axis === 'y') {
                points.push({ x, y: y - halfL, z }, { x, y, z }, { x, y: y + halfL, z });
                points.push({ x: x + halfSize, y: y - halfL + halfSize, z }, { x: x - halfSize, y: y - halfL + halfSize, z });
                points.push({ x: x + halfSize, y: y + halfL - halfSize, z }, { x: x - halfSize, y: y + halfL - halfSize, z });
                points.push({ x, y: y - halfL + halfSize, z: z + halfSize }, { x, y: y - halfL + halfSize, z: z - halfSize });
                points.push({ x, y: y + halfL - halfSize, z: z + halfSize }, { x, y: y + halfL - halfSize, z: z - halfSize });
            } else if (b.axis === 'z') {
                points.push({ x, y, z: z - halfL }, { x, y, z }, { x, y, z: z + halfL });
                points.push({ x, y: y + size, z: z - halfL }, { x, y: y + size, z: z + halfL });
                points.push({ x, y: y - size, z: z - halfL }, { x, y: y - size, z: z + halfL });
            }
        });
        return points;
    };

    let previousDragPos = new window.THREE.Vector3();

    const applySnapping = (tc) => {
        if (!isDragging || selectedBeamIds.value.length === 0 || tc.mode !== 'translate') return;
        const mesh = tc.object;
        if (!mesh) return;

        const mainId = mesh.userData.id;
        const SNAP_DISTANCE = 40;
        const snapPoints = getSnapPoints(selectedBeamIds.value);
        
        const beam = design.value.beams.find(b => b.id === mainId);
        if (!beam) return;

        const cx = mesh.position.x;
        const cy = mesh.position.y;
        const cz = mesh.position.z;
        const halfL = beam.length / 2;

        let myPoints = [];
        if (beam.axis === 'x') myPoints = [{ x: cx - halfL, y: cy, z: cz, type: 'end' }, { x: cx, y: cy, z: cz, type: 'mid' }, { x: cx + halfL, y: cy, z: cz, type: 'end' }];
        else if (beam.axis === 'y') myPoints = [{ x: cx, y: cy - halfL, z: cz, type: 'end' }, { x: cx, y: cy, z: cz, type: 'mid' }, { x: cx, y: cy + halfL, z: cz, type: 'end' }];
        else if (beam.axis === 'z') myPoints = [{ x: cx, y: cy, z: cz - halfL, type: 'end' }, { x: cx, y: cy, z: cz, type: 'mid' }, { x: cx, y: cy, z: cz + halfL, type: 'end' }];

        let snapped = false;
        let bestDistance = SNAP_DISTANCE;
        let bestOffset = { x: 0, y: 0, z: 0 };

        for (const target of snapPoints) {
            for (const p of myPoints) {
                const dist = Math.sqrt(Math.pow(p.x - target.x, 2) + Math.pow(p.y - target.y, 2) + Math.pow(p.z - target.z, 2));
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestOffset = { x: target.x - p.x, y: target.y - p.y, z: target.z - p.z };
                    snapped = true;
                }
            }
        }

        if (snapped) {
            mesh.position.x += bestOffset.x;
            mesh.position.y += bestOffset.y;
            mesh.position.z += bestOffset.z;
        }

        const dx = Math.round(mesh.position.x) - beam.x;
        const dy = Math.round(mesh.position.y) - beam.y;
        const dz = Math.round(mesh.position.z) - beam.z;

        beam.x = Math.round(mesh.position.x);
        beam.y = Math.round(mesh.position.y);
        beam.z = Math.round(mesh.position.z);

        // Apply delta to other selected beams
        selectedBeamIds.value.forEach(id => {
            if (id !== mainId) {
                const b = design.value.beams.find(ob => ob.id === id);
                if (b) {
                    b.x += dx;
                    b.y += dy;
                    b.z += dz;
                    // Also move the mesh in 3D scene immediately
                    const otherMesh = aluminumGroup.children.find(m => m.userData.id === id);
                    if (otherMesh) {
                        otherMesh.position.set(b.x, b.y, b.z);
                    }
                }
            }
        });
        
        previousDragPos.copy(mesh.position);
    };

    const onDragChange = (event, is2D) => {
        const ctrl = is2D ? controls2d : controls;
        ctrl.enabled = !event.value;
        isDragging = event.value;
        
        const mesh = (is2D ? transformControl2d : transformControl).object;
        if (isDragging && mesh) {
            previousDragPos.copy(mesh.position);
        }
        
        if (!isDragging && selectedBeamIds.value.length > 0) {
            if (mesh) {
                const beam = design.value.beams.find(b => b.id === mesh.userData.id);
                if (beam) {
                    beam.x = Math.round(mesh.position.x);
                    beam.y = Math.round(mesh.position.y);
                    beam.z = Math.round(mesh.position.z);
                }
            }
        }
    };

    transformControl.addEventListener('dragging-changed', (e) => onDragChange(e, false));
    transformControl2d.addEventListener('dragging-changed', (e) => onDragChange(e, true));

    transformControl.addEventListener('change', () => applySnapping(transformControl));
    transformControl2d.addEventListener('change', () => applySnapping(transformControl2d));

    // Render loop
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        
        if (controls2d && renderer2d && camera2d) {
            controls2d.update();
            renderer2d.render(scene, camera2d);
        }
    };
    animate();

    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Raycaster Click Event for both views
    previewContainer.value.addEventListener('pointerdown', (e) => onPointerDown(e, previewContainer.value, camera, transformControl));
    preview2dContainer.value.addEventListener('pointerdown', (e) => onPointerDown(e, preview2dContainer.value, camera2d, transformControl2d));
    
    // Initial build
    if (!design.value.beams || design.value.beams.length === 0) {
        generateBeams();
    }
    build3DModel();
    set2DView('front');
};

const onPointerDown = (event, container, cam, tc) => {
    if (!container || !cam || !aluminumGroup) return;
    
    if (event.button !== 0) return;
    if (tc && tc.axis !== null) return;

    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, cam);
    const intersects = raycaster.intersectObjects(aluminumGroup.children, false);
    
    if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id;
        if (event.shiftKey) {
            // Toggle selection
            const index = selectedBeamIds.value.indexOf(clickedId);
            if (index > -1) {
                selectedBeamIds.value.splice(index, 1);
            } else {
                selectedBeamIds.value.push(clickedId);
            }
        } else {
            // Single selection
            if (!selectedBeamIds.value.includes(clickedId)) {
                selectedBeamIds.value = [clickedId];
            }
        }
    } else {
        if (!event.shiftKey) {
            selectedBeamIds.value = [];
        }
    }
    highlightSelected();
};

const highlightSelected = () => {
    if (!aluminumGroup) return;
    let meshToSelectForControl = null;
    
    aluminumGroup.children.forEach(mesh => {
        if (mesh.userData && mesh.userData.id) {
            if (selectedBeamIds.value.includes(mesh.userData.id)) {
                mesh.material.color.setHex(0xff6b52);
                // Attach transform control to the first selected item
                if (!meshToSelectForControl) {
                    meshToSelectForControl = mesh;
                }
            } else {
                mesh.material.color.setHex(0x333333);
            }
        }
    });

    if (meshToSelectForControl) {
        if (transformControl) transformControl.attach(meshToSelectForControl);
        if (transformControl2d) transformControl2d.attach(meshToSelectForControl);
    } else {
        if (transformControl) transformControl.detach();
        if (transformControl2d) transformControl2d.detach();
    }
};

const onWindowResize = () => {
    if (previewContainer.value && camera && renderer) {
        const width = previewContainer.value.clientWidth;
        const height = previewContainer.value.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    if (preview2dContainer.value && camera2d && renderer2d) {
        const width2d = preview2dContainer.value.clientWidth;
        const height2d = preview2dContainer.value.clientHeight;
        const aspect2d = width2d / height2d;
        const frustumSize = 2500;
        camera2d.left = - frustumSize * aspect2d / 2;
        camera2d.right = frustumSize * aspect2d / 2;
        camera2d.top = frustumSize / 2;
        camera2d.bottom = - frustumSize / 2;
        camera2d.updateProjectionMatrix();
        renderer2d.setSize(width2d, height2d);
    }
};

const build3DModel = () => {
    if (!aluminumGroup || !window.THREE) return;

    // Clear previous model
    while(aluminumGroup.children.length > 0){ 
        const child = aluminumGroup.children[0];
        aluminumGroup.remove(child); 
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    }

    const size = profileSize.value;

    const aluminumMaterial = new window.THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.6,
        roughness: 0.4
    });

    design.value.beams.forEach(b => {
        const w = b.axis === 'x' ? b.length : size;
        const h = b.axis === 'y' ? b.length : size;
        const d = b.axis === 'z' ? b.length : size;
        
        const geometry = new window.THREE.BoxGeometry(w, h, d);
        const mat = aluminumMaterial.clone();
        if (selectedBeamIds.value.includes(b.id)) {
            mat.color.setHex(0xff6b52);
        }

        const mesh = new window.THREE.Mesh(geometry, mat);
        mesh.position.set(b.x, b.y, b.z);
        mesh.userData.id = b.id; // Store ID for raycasting
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const edges = new window.THREE.EdgesGeometry(geometry);
        const line = new window.THREE.LineSegments(edges, new window.THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true }));
        mesh.add(line);
        
        aluminumGroup.add(mesh);
    });

    highlightSelected(); // Make sure transform controls re-attach if selected beam was rebuilt

    if (controls && selectedBeamIds.value.length === 0) {
        controls.target.set(0, design.value.height / 2, 0);
        controls.update();
    }
};

const addCustomBeam = () => {
    const uid = () => Math.random().toString(36).substr(2, 9);
    const size = profileSize.value;
    const newBeam = {
        id: uid(),
        name: '自定义型材',
        axis: 'x',
        length: 500,
        x: 0,
        y: design.value.height + size, // Place it slightly above the current structure
        z: 0
    };
    design.value.beams.push(newBeam);
    selectedBeamIds.value = [newBeam.id];
};

// Watch for design changes to rebuild model
watch(() => design.value, () => {
    if (isDragging) return; // Prevent rebuilding the whole scene while dragging!
    build3DModel();
}, { deep: true });

onMounted(() => {
    const saved = localStorage.getItem('aluminum_design_draft');
    if (saved) {
        try {
            design.value = JSON.parse(saved);
        } catch (e) {}
    }
    updateIcons();
    
    // Init Three.js after a slight delay to ensure DOM is ready
    setTimeout(() => {
        initThreeJS();
    }, 100);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
    if (frameId) cancelAnimationFrame(frameId);
    if (renderer) renderer.dispose();
});
</script>

<style scoped lang="scss">
.aluminum-designer {
    min-height: 100vh;
    background-color: #FAFAFA;
    color: #111111;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    
    @media (min-width: 768px) {
        padding: 48px;
    }
}

.ad-header {
    margin-bottom: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ad-title {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: -0.05em;
    margin: 0 0 8px 0;
    
    @media (min-width: 768px) {
        font-size: 48px;
    }
}

.ad-subtitle {
    color: rgba(17, 17, 17, 0.4);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
}

.ad-actions {
    display: flex;
    gap: 16px;
}

.btn-outline, .btn-primary {
    padding: 12px 24px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-outline {
    background: transparent;
    border: 1px solid rgba(17, 17, 17, 0.1);
    color: #111111;
    
    &:hover {
        background-color: rgba(17, 17, 17, 0.05);
    }
}

.btn-primary {
    background-color: #111111;
    border: 1px solid #111111;
    color: #FAFAFA;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    
    &:hover {
        transform: scale(1.05);
    }
}

.ad-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    
    @media (min-width: 1024px) {
        grid-template-columns: repeat(12, 1fr);
    }
}

.ad-catalog {
    display: flex;
    flex-direction: column;
    gap: 32px;
    
    @media (min-width: 1024px) {
        grid-column: span 3;
    }
}

.ad-card {
    background-color: #ffffff;
    border-radius: 32px;
    padding: 24px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(17, 17, 17, 0.05);
    margin-bottom: 32px;
    
    @media (min-width: 768px) {
        padding: 32px;
    }
}

.ad-preview-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.ad-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 16px;
}

.ad-preview-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    color: rgba(17, 17, 17, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.ad-icon-sm {
    width: 12px;
    height: 12px;
}

.ad-preview-container {
    width: 100%;
    height: 400px;
    border-radius: 20px;
    overflow: hidden;
    background-color: #f0f2f5;
    position: relative;
    cursor: grab;
    
    &:active {
        cursor: grabbing;
    }
}

.sticky-top {
    position: sticky;
    top: 48px;
}

.ad-card-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0 0 24px 0;
}

.ad-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.ad-accessories-list {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 8px;
}

.ad-list-item {
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(17, 17, 17, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
        border-color: rgba(17, 17, 17, 0.2);
        background-color: rgba(17, 17, 17, 0.05);
    }
}

.ad-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.ad-item-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
}

.ad-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(17, 17, 17, 0.4);
    background-color: rgba(17, 17, 17, 0.05);
    padding: 4px 8px;
    border-radius: 9999px;
}

.ad-item-desc {
    font-size: 14px;
    color: rgba(17, 17, 17, 0.6);
    margin: 0;
}

.ad-item-meta {
    font-size: 12px;
    color: rgba(17, 17, 17, 0.4);
    margin: 8px 0 0 0;
}

.ad-designer {
    @media (min-width: 1024px) {
        grid-column: span 5;
    }
}

.ad-card-header-spaced {
    margin-bottom: 40px;
}

.ad-card-title-lg {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.025em;
    margin: 0 0 8px 0;
}

.ad-card-subtitle {
    font-size: 14px;
    color: rgba(17, 17, 17, 0.4);
    margin: 0;
}

.ad-form-group {
    margin-bottom: 32px;
}

.ad-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(17, 17, 17, 0.6);
    margin-bottom: 12px;
}

.ad-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.ad-template-btn {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(17, 17, 17, 0.1);
    background: transparent;
    color: #111111;
    text-align: left;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover:not(.active) {
        border-color: rgba(17, 17, 17, 0.3);
    }
    
    &.active {
        border-color: #111111;
        background-color: #111111;
        color: #FAFAFA;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        
        .ad-icon {
            color: #FAFAFA;
        }
    }
}

.ad-icon-wrapper {
    margin-bottom: 8px;
}

.ad-icon {
    width: 20px;
    height: 20px;
    color: inherit;
}

.ad-template-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
}

.ad-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.ad-input-group {
    display: flex;
    flex-direction: column;
}

.ad-sublabel {
    font-size: 12px;
    color: rgba(17, 17, 17, 0.6);
    margin-bottom: 8px;
}

.ad-input {
    width: 100%;
    background-color: rgba(17, 17, 17, 0.05);
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 18px;
    font-weight: 700;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &:focus {
        box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.2);
    }
    
    &::-webkit-inner-spin-button, 
    &::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
    }
    -moz-appearance: textfield;
}

.ad-counter {
    display: flex;
    align-items: center;
    gap: 16px;
}

.ad-counter-btn {
    width: 48px;
    height: 48px;
    border-radius: 9999px;
    background-color: rgba(17, 17, 17, 0.05);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background-color: rgba(17, 17, 17, 0.1);
    }
}

.ad-counter-val {
    font-size: 24px;
    font-weight: 900;
    width: 48px;
    text-align: center;
}

.ad-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.ad-profile-btn {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(17, 17, 17, 0.1);
    background: transparent;
    font-weight: 700;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #111111;
    
    &:hover:not(.active) {
        background-color: rgba(17, 17, 17, 0.05);
    }
    
    &.active {
        border-color: #111111;
        background-color: #111111;
        color: #FAFAFA;
    }
}

.ad-bom {
    @media (min-width: 1024px) {
        grid-column: span 4;
    }
}

.ad-bom-card {
    background-color: #111111;
    color: #ffffff;
    border-radius: 32px;
    padding: 24px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
    
    @media (min-width: 768px) {
        padding: 40px;
    }
}

.ad-bom-header {
    margin-bottom: 40px;
}

.ad-bom-title {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.025em;
    margin: 0 0 8px 0;
}

.ad-bom-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
}

.ad-bom-section {
    margin-bottom: 32px;
}

.ad-bom-section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin: 0 0 16px 0;
}

.ad-bom-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ad-bom-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ad-bom-item-info {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
}

.ad-bom-item-name {
    font-weight: 700;
    font-size: 14px;
}

.ad-bom-item-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
}

.ad-bom-badge {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
}

.ad-bom-summary {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.ad-bom-summary-label {
    color: rgba(255, 255, 255, 0.4);
}

.ad-bom-summary-val {
    font-weight: 700;
}

.ad-bom-tip {
    margin-top: 48px;
    padding: 24px;
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    p {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.6;
        margin: 0;
        
        strong {
            color: #ffffff;
        }
    }
}
</style>
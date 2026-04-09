<template>
    <div class="myhome-container app-container">
        
        <!-- Background Layer -->
        <div class="myhome-bg-layer">
            <!-- Decorative Image -->
            <div class="deco-image-wrapper">
                <img :src="state.currentHeroImage" class="deco-image" />
                <div class="overlay"></div>
            </div>
            
            <!-- Floor Plan Canvas Display -->
            <canvas ref="displayCanvas" width="1500" height="1500" class="display-canvas"></canvas>
        </div>

        <!-- Left Frosted Glass Panel -->
        <div class="left-glass-panel">
            <div class="panel-content hide-scrollbar">
                
                <!-- Date Header -->
                <div class="date-header animate-slide-right" style="animation-delay: 0.1s;">
                    <h2 class="day">{{ dateDay }}</h2>
                    <div class="month">{{ dateMonth }}</div>
                </div>
                
                <!-- Address / Info (Placeholder to match design) -->
                <div class="info-block animate-slide-right" style="animation-delay: 0.2s;">
                    <div>{{ stats.total }} m²</div>
                    <div>My Sweet Home</div>
                    <div>{{ stats.completed ? '已竣工' : '装修中' }}</div>
                </div>
                
                <!-- Area Buttons -->
                <div class="area-buttons animate-slide-right" style="animation-delay: 0.3s;">
                    <button v-for="(area, index) in decorationAreas" :key="area.value" 
                            @click="goToAreaDetail(area.value)"
                            class="area-btn group"
                            :style="{ animationDelay: `${0.3 + index * 0.05}s` }">
                        <div class="btn-left">
                            <span class="label">{{ area.label }}</span>
                            <span v-if="areaStatsMap[area.value] && areaStatsMap[area.value] > 0" class="stat">{{ areaStatsMap[area.value] }} m²</span>
                        </div>
                        <div class="btn-icon">
                            <i data-lucide="arrow-right"></i>
                        </div>
                    </button>
                </div>
                
                <!-- Logo Bottom -->
                <div class="logo-bottom animate-slide-right" style="animation-delay: 0.6s;">
                    <i data-lucide="sun" class="sun-icon"></i>
                    <span class="logo-text">C.Lab</span>
                </div>
            </div>
        </div>

        <!-- Right Side Elements -->
        <div class="right-top-text animate-fade-in-up">
            <div class="title">Home Design</div>
            <div class="subtitle">Planning</div>
        </div>

        <div class="right-bottom-actions animate-fade-in-up" style="animation-delay: 0.4s;">
            <!-- Edit Button matching the pill shape in design -->
            <button @click="goToEdit" class="edit-btn group">
                <span class="label">编辑户型</span>
                <div class="icon-wrap">
                    <i data-lucide="chevron-right"></i>
                </div>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions, constants } = useAppStore();

const displayCanvas = ref(null);
const decorationAreas = constants.decorationAreas;

// Date formatting for the UI
const dateDay = computed(() => dayjs().format('ddd'));
const dateMonth = computed(() => dayjs().format('Do'));

const stats = ref({ total: 0, completed: false });
const areaStatsMap = ref({});

const goToAreaDetail = (areaName) => {
    actions.navigate('area-detail', { area: areaName });
};

const goToEdit = () => {
    actions.navigate('edit-home');
};

const initDisplay = () => {
    if (!displayCanvas.value) return;
    const ctx = displayCanvas.value.getContext('2d');
    ctx.clearRect(0, 0, 1500, 1500);
    
    // Draw background image if exists
    if (state.floorPlan && state.floorPlan.bg_image_url) {
        const img = new Image();
        img.onload = () => {
            ctx.globalAlpha = 0.5;
            let config = { x: 0, y: 0, scale: 1, opacity: 0.5 };
            if (state.floorPlan.bg_config) {
                try {
                    config = typeof state.floorPlan.bg_config === 'string' ? JSON.parse(state.floorPlan.bg_config) : state.floorPlan.bg_config;
                } catch(e) {}
            }
            ctx.globalAlpha = config.opacity || 0.5;
            // Draw image scaled
            ctx.save();
            ctx.translate(config.x, config.y);
            ctx.scale(config.scale, config.scale);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
            drawGridData(ctx);
        };
        img.src = state.floorPlan.bg_image_url;
    } else {
        drawGridData(ctx);
    }
};

const drawGridData = (ctx) => {
    if (!state.floorPlan || !state.floorPlan.grid_data) return;
    try {
        let data = state.floorPlan.grid_data;
        if (typeof data === 'string') {
            data = JSON.parse(data);
            if (typeof data === 'string') data = JSON.parse(data);
        }
        
        const materials = [
            { id: 'wall', color: '#222222' },
            { id: 'living_room', color: '#fdf5e6' },
            { id: 'bedroom', color: '#fff5e6' },
            { id: 'bathroom', color: '#eef8ff' },
            { id: 'kitchen', color: '#f8f9fa' },
            { id: 'balcony', color: '#e0e0e0' },
            { id: 'corridor', color: '#d4d4d4' }
        ];

        const GRID_SIZE = 10;
        let totalBlocks = 0;
        
        const typeToLabel = {
            'living_room': '客厅',
            'bedroom': '卧室',
            'bathroom': '卫浴',
            'kitchen': '厨房',
            'balcony': '阳台',
            'corridor': '过道'
        };
        
        const counts = {};
        Object.values(typeToLabel).forEach(label => counts[label] = 0);

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item && item.y !== undefined && item.x !== undefined) {
                    const mat = materials.find(m => m.id === item.type);
                    if (mat) {
                        ctx.fillStyle = mat.color;
                        ctx.fillRect(item.x * GRID_SIZE, item.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                        if (item.type !== 'wall') {
                            totalBlocks++;
                            if (typeToLabel[item.type]) {
                                counts[typeToLabel[item.type]]++;
                            }
                        }
                    }
                }
            });
            stats.value.total = (totalBlocks * 0.01).toFixed(1);
            
            // Format to area map
            Object.keys(counts).forEach(key => {
                areaStatsMap.value[key] = (counts[key] * 0.01).toFixed(1);
            });
        }
    } catch (e) {
        console.error('Failed to render display canvas:', e);
    }
};

watch(() => state.floorPlan, () => {
    initDisplay();
}, { deep: true });

onMounted(() => {
    actions.fetchFloorPlan();
    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
        initDisplay();
    });
});
</script>

<style scoped lang="scss">
.myhome-container {
  background-color: $color-white;
  color: $color-black;
}

.myhome-bg-layer {
  @include absolute-inset;
  z-index: 0;
  overflow: hidden;
  background-color: $color-white;
  @include flex-center;

  .deco-image-wrapper {
    position: absolute;
    right: -10%;
    top: 50%;
    transform: translateY(-50%);
    width: 60%;
    max-width: 24rem;
    aspect-ratio: 3 / 4;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.12);
    animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;

    @media (min-width: 640px) {
      right: 10%;
    }

    .deco-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .overlay {
      @include absolute-inset;
      border: 1px solid rgba($color-pure-white, 0.2);
      border-radius: 2rem;
      pointer-events: none;
    }
  }

  .display-canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.4;
    pointer-events: none;
    transform: scale(1.5);
    transform-origin: center;

    @media (min-width: 640px) {
      transform: scale(1);
    }
  }
}

.left-glass-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 65%;
  height: 100%;
  z-index: 10;
  @include glassmorphism(rgba(255, 255, 255, 0.5), 24px);
  box-shadow: 30px 0 60px rgba(0,0,0,0.05);
  border-right: 1px solid rgba(255,255,255,0.4);
  display: flex;
  flex-direction: column;
  border-radius: 0 2.5rem 2.5rem 0;
  overflow: hidden;
  transition: all 0.5s;

  @media (min-width: 640px) {
    width: 45%;
    border-radius: 0 3rem 3rem 0;
  }
  @media (min-width: 768px) {
    width: 35%;
  }

  .panel-content {
    padding: 4rem 1.5rem 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;

    @media (min-width: 640px) {
      padding: 6rem 2.5rem 2rem;
    }
  }
}

.date-header {
  margin-bottom: 3rem;
  
  .day {
    font-size: 3rem;
    line-height: 1;
    font-weight: 900;
    letter-spacing: -0.05em;
    margin-bottom: 0.5rem;
    color: $color-black;

    @media (min-width: 640px) {
      font-size: 4.5rem;
    }
  }
  
  .month {
    font-size: 1.875rem;
    color: rgba($color-black, 0.3);
    font-weight: 500;
    letter-spacing: -0.05em;

    @media (min-width: 640px) {
      font-size: 3rem;
    }
  }
}

.info-block {
  margin-bottom: 3rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.625;
  color: rgba($color-black, 0.6);

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }
}

.area-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  margin-bottom: 3rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }

  .area-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-radius: 9999px;
    background-color: rgba(255, 255, 255, 0.6);
    @include shadow-soft;
    border: 1px solid $color-white;
    transition: all 0.3s;

    @media (min-width: 640px) {
      padding: 1rem 1.5rem;
    }

    &:hover {
      background-color: $color-primary;
      color: $color-white;

      .btn-icon {
        background-color: rgba(255, 255, 255, 0.2);

        i {
          opacity: 1;
          transform: translateX(2px);
        }
      }
    }

    .btn-left {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;

      .label {
        font-weight: bold;
        font-size: 0.875rem;
        letter-spacing: 0.1em;

        @media (min-width: 640px) {
          font-size: 1rem;
        }
      }

      .stat {
        font-size: 10px;
        font-family: $font-mono;
        opacity: 0.6;
        font-weight: 500;
      }
    }

    .btn-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.05);
      @include flex-center;
      transition: background-color 0.3s;
      flex-shrink: 0;

      i {
        width: 1rem;
        height: 1rem;
        opacity: 0.5;
        transition: all 0.3s;
      }
    }
  }
}

.logo-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: auto;

  .sun-icon {
    width: 2rem;
    height: 2rem;
    color: $color-black;
    animation: spin 10s linear infinite;
  }

  .logo-text {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: rgba($color-black, 0.8);
  }
}

.right-top-text {
  position: absolute;
  top: 4rem;
  right: 1.5rem;
  z-index: 10;
  text-align: right;

  @media (min-width: 640px) {
    top: 6rem;
    right: 3rem;
  }

  .title {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.025em;
    color: $color-black;

    @media (min-width: 640px) {
      font-size: 1rem;
    }
  }

  .subtitle {
    font-size: 0.75rem;
    color: rgba($color-black, 0.5);
    font-weight: 500;
    margin-top: 0.25rem;

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
  }
}

.right-bottom-actions {
  position: absolute;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 20;
  display: flex;
  gap: 0.5rem;

  @media (min-width: 640px) {
    bottom: 3rem;
    right: 3rem;
  }

  .edit-btn {
        height: 3rem;
        padding-left: 1.5rem;
        padding-right: 0.5rem;
        border-radius: 9999px;
        background-color: $color-primary;
        color: $color-white;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    transition: all 0.3s;

    @media (min-width: 640px) {
      height: 3.5rem;
    }

    &:hover {
      background-color: darken($color-primary, 10%);
      transform: translateY(-4px);

      .icon-wrap {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    .label {
      font-size: 0.75rem;
      font-weight: bold;
      letter-spacing: 0.05em;

      @media (min-width: 640px) {
        font-size: 0.875rem;
      }
    }

    .icon-wrap {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      @include flex-center;
      transition: background-color 0.3s;

      @media (min-width: 640px) {
        width: 2.5rem;
        height: 2.5rem;
      }

      i {
        width: 1rem;
        height: 1rem;

        @media (min-width: 640px) {
          width: 1.25rem;
          height: 1.25rem;
        }
      }
    }
  }
}
</style>

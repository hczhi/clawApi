<template>
    <div class="absolute inset-0 overflow-y-auto bg-white pb-32 pt-16 page-content">
        <div class="p-6">
            <form @submit.prevent="actions.saveConcept" class="space-y-6">
                <div class="space-y-6">
                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">标题</label>
                        <input type="text" v-model="state.conceptForm.title" required class="w-full bg-brand-light text-brand-dark text-[15px] font-medium px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all" placeholder="例如：极简原木风客厅">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">来源</label>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="src in constants.sourceOptions" :key="src.value" @click="state.conceptForm.source_type = src.value" class="px-5 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer border border-transparent" :class="state.conceptForm.source_type === src.value ? 'bg-brand-dark text-white shadow-md' : 'bg-brand-light text-brand-gray hover:bg-black/5'">
                                {{ src.label }}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">图片 (最多5张)</label>
                        <div class="grid grid-cols-3 gap-3">
                            <div v-for="(img, idx) in state.conceptImagesPreview" :key="idx" class="aspect-square rounded-xl bg-brand-light relative overflow-hidden group">
                                <img :src="img" class="w-full h-full object-cover" />
                                <button type="button" @click.prevent="actions.removeConceptImage(idx)" class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-md active:scale-90">
                                    <i data-lucide="x" class="w-3 h-3"></i>
                                </button>
                            </div>
                            <label v-if="state.conceptImagesPreview.length < 5" class="aspect-square rounded-xl border-2 border-dashed border-brand-gray/30 flex flex-col items-center justify-center text-brand-gray cursor-pointer hover:bg-brand-light transition-colors active:scale-95">
                                <i data-lucide="camera" class="w-6 h-6 mb-1 opacity-50"></i>
                                <span class="text-[10px] font-medium opacity-60">添加图片</span>
                                <input type="file" multiple accept="image/*" @change="actions.handleConceptImageUpload" class="hidden" :disabled="state.uploadingImages">
                            </label>
                        </div>
                        <p v-if="state.uploadingImages" class="text-xs text-brand-accent mt-2 animate-pulse flex items-center"><i data-lucide="loader-2" class="w-3 h-3 mr-1 animate-spin"></i> 上传中...</p>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">风格 (选填)</label>
                        <input type="text" v-model="state.conceptForm.style" class="w-full bg-brand-light text-brand-dark text-[15px] font-medium px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all" placeholder="如：极简、奶油风、工业风">
                    </div>
                    
                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">链接 (选填)</label>
                        <input type="url" v-model="state.conceptForm.reference_link" class="w-full bg-brand-light text-brand-dark text-[15px] font-medium px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all" placeholder="https://...">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-brand-gray uppercase tracking-widest mb-3 ml-1">描述 (选填)</label>
                        <textarea v-model="state.conceptForm.description" rows="4" class="w-full bg-brand-light text-brand-dark text-[15px] p-5 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none" placeholder="记录一些设计灵感和心得..."></textarea>
                    </div>
                </div>

                <div class="bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent pb-safe z-10">
                    <button type="submit" class="w-full bg-brand-dark text-white py-4 rounded-[20px] font-semibold text-[16px] active:scale-[0.98] transition-transform shadow-[0_10px_30px_rgb(0,0,0,0.2)] flex items-center justify-center">
                        <i v-if="state.saving" data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i>
                        {{ state.saving ? '处理中...' : '保存' }}
                    </button>
                </div>
                <div class="h-24"></div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>
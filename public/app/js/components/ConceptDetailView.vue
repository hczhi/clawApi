<template>
    <div class="absolute inset-0 overflow-y-auto bg-[#FAFAFA] text-[#111111] pb-32 page-content scroll-smooth">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 fixed">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                DETAILS
            </span>
        </div>

        <div v-if="state.currentConcept" class="relative z-10">
            <!-- Hero Image -->
            <div v-if="state.currentConceptImages.length > 0" class="w-full h-[45vh] relative overflow-hidden bg-black/5">
                <img :src="state.currentConceptImages[0]" class="absolute inset-0 w-full h-full object-cover" />
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#FAFAFA]"></div>
            </div>
            <div v-else class="w-full h-32 pt-16"></div>

            <div class="px-6 relative" :class="state.currentConceptImages.length > 0 ? '-mt-24' : ''">
                <!-- Content Card -->
                <div class="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-black/5 mb-8">
                    
                    <!-- Tags -->
                    <div class="flex flex-wrap items-center gap-2 mb-6">
                        <span class="bg-[#111111] text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.15em] uppercase shadow-sm">{{ helpers.getSourceText(state.currentConcept.source_type) }}</span>
                        <span class="bg-black/5 text-black/60 text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.15em] uppercase">{{ state.currentConcept.style || 'INSPIRATION' }}</span>
                    </div>
                    
                    <!-- Title -->
                    <h2 class="text-3xl font-black tracking-tighter mb-6 leading-[1.15]">{{ state.currentConcept.title }}</h2>
                    
                    <!-- Description -->
                    <div v-if="state.currentConcept.description" class="mb-8">
                        <p class="text-[15px] text-black/70 leading-relaxed whitespace-pre-wrap font-medium">{{ state.currentConcept.description }}</p>
                    </div>

                    <!-- Link -->
                    <div v-if="state.currentConcept.reference_link" class="pt-6 border-t border-black/5">
                        <a :href="state.currentConcept.reference_link" target="_blank" class="inline-flex items-center text-[12px] font-black uppercase tracking-widest text-[#111111] hover:text-black/50 transition-colors group">
                            <span class="border-b border-black/20 group-hover:border-black/50 pb-0.5">查看原链接</span>
                            <i data-lucide="arrow-up-right" class="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                        </a>
                    </div>
                </div>

                <!-- All Images -->
                <div v-if="state.currentConceptImages.length > 0" class="space-y-4 mb-10">
                    <div v-for="(img, idx) in state.currentConceptImages" :key="idx" class="relative rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-black/5 bg-black/5">
                        <img :src="img" class="w-full object-cover" />
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex space-x-4">
                    <button @click="actions.navigate('concept-form', { mode: 'edit', id: state.currentConcept.id })" class="flex-1 bg-[#111111] text-white py-4 rounded-full font-bold text-[15px] active:scale-95 transition-all shadow-sm">
                        编辑参考
                    </button>
                    <button @click="actions.deleteConcept" class="w-16 flex-shrink-0 bg-white text-[#ff3b30] border border-black/5 flex items-center justify-center rounded-full active:scale-95 transition-all shadow-sm font-black text-xs">
                        DEL
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>
<template>
    <div class="absolute inset-0 flex flex-col bg-[#FAFAFA] text-[#111111] page-content pt-16 overflow-hidden">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 fixed">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                IDEAS
            </span>
        </div>

        <div class="px-6 py-8 relative z-10">
            <p class="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2 ml-1">INSPIRATION</p>
            
        </div>
        
        <div class="flex-1 overflow-y-auto pb-32 px-5 scroll-smooth relative z-10">
            <div v-if="state.loading" class="flex justify-center items-center py-20">
                <div class="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div v-else-if="state.concepts.length === 0" class="flex flex-col items-center justify-center py-32 opacity-40">
                <div class="w-24 h-24 rounded-full border border-black/10 flex items-center justify-center mb-6 bg-black/5">
                    <i data-lucide="image" class="w-10 h-10 text-black/40"></i>
                </div>
                <p class="text-[10px] font-bold uppercase tracking-widest">暂无灵感，快去收集吧</p>
            </div>
            <div v-else class="grid grid-cols-2 gap-4">
                <div v-for="(concept, index) in state.concepts" :key="concept.id" 
                    @click="actions.navigate('concept-detail', { id: concept.id })" 
                    class="group relative bg-black rounded-[2rem] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05)] active:scale-95 transition-all duration-500 cursor-pointer"
                    :class="[index % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]', index % 2 !== 0 ? 'mt-6' : '']"
                    style="animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; overflow: hidden; border-radius: 20px;"
                    :style="{ animationDelay: `${index * 50}ms` }">
                    
                    <!-- Cover Image -->
                    <img v-if="helpers.getConceptCover(concept)" :src="helpers.getConceptCover(concept)" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div v-else class="absolute inset-0 w-full h-full flex items-center justify-center bg-[#111111] text-white/20">
                        <i data-lucide="image" class="w-10 h-10"></i>
                    </div>

                    <!-- Source Tag -->
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase text-[#111111] shadow-sm">
                        {{ helpers.getSourceText(concept.source_type) }}
                    </div>

                    <!-- Bottom Content Overlay -->
                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-16">
                        <h4 class="font-bold text-white text-[14px] leading-tight line-clamp-2 mb-1 group-hover:-translate-y-1 transition-transform duration-300">{{ concept.title }}</h4>
                        <p class="text-[9px] font-bold text-white/60 uppercase tracking-[0.15em] line-clamp-1 group-hover:-translate-y-1 transition-transform duration-300 delay-75">{{ concept.style || 'INSPIRATION' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>
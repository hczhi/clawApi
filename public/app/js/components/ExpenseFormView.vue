<template>
    <div class="absolute inset-0 overflow-y-auto bg-[#FAFAFA] pb-32 pt-16 page-content">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 fixed">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                NEW REC.
            </span>
        </div>

        <div class="p-6 relative z-10">
            <form @submit.prevent="actions.saveExpense" class="space-y-8">
                <!-- Amount Input -->
                <div class="text-center pt-4 pb-8 border-b border-black/5">
                    <label class="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-4">输入金额</label>
                    <div class="flex items-center justify-center text-[#111111]">
                        <span class="text-3xl font-sans mr-2 font-bold">¥</span>
                        <input 
                            type="number" 
                            step="0.01" 
                            v-model="state.formData.amount" 
                            required
                            class="w-[60%] text-center text-5xl md:text-6xl font-sans font-black bg-transparent outline-none placeholder-black/10 caret-black"
                            placeholder="0.00"
                        >
                    </div>
                </div>

                <div class="space-y-6">
                    <!-- Title -->
                    <div>
                        <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">账单标题</label>
                        <input 
                            type="text" 
                            v-model="state.formData.title" 
                            required
                            class="w-full bg-white/80 backdrop-blur-md text-[#111111] text-[15px] font-bold px-5 py-4 rounded-[2rem] outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-black/20 border border-black/5"
                            placeholder="例如：购买客厅沙发"
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Category -->
                        <div>
                            <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">所属分类</label>
                            <div class="relative">
                                <select v-model="state.formData.category_id" required class="w-full bg-white/80 backdrop-blur-md text-[#111111] text-[15px] font-bold pl-5 pr-10 py-4 rounded-[2rem] outline-none appearance-none focus:ring-2 focus:ring-black/5 transition-all border border-black/5">
                                    <option value="" disabled selected>选择分类</option>
                                    <option v-for="cat in state.categories" :key="cat.id" :value="cat.id">
                                        {{ cat.level > 1 ? '└ ' + cat.name : cat.name }}
                                    </option>
                                </select>
                                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black/30 pointer-events-none">▼</span>
                            </div>
                        </div>

                        <!-- Date -->
                        <div>
                            <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">发生日期</label>
                            <input 
                                type="date" 
                                v-model="state.formData.payment_date" 
                                required
                                class="w-full bg-white/80 backdrop-blur-md text-[#111111] text-[15px] font-bold px-5 py-4 rounded-[2rem] outline-none focus:ring-2 focus:ring-black/5 transition-all border border-black/5"
                            >
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div>
                        <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">支付方式</label>
                        <div class="flex flex-wrap gap-2">
                            <div 
                                v-for="method in constants.paymentMethods" 
                                :key="method.value"
                                @click="state.formData.payment_method = method.value"
                                class="px-5 py-3 rounded-full text-[13px] font-bold transition-all cursor-pointer border border-transparent"
                                :class="state.formData.payment_method === method.value ? 'bg-[#111111] text-white shadow-md' : 'bg-white/80 backdrop-blur-md text-black/60 hover:bg-white border border-black/5'"
                            >
                                {{ method.label }}
                            </div>
                        </div>
                    </div>

                    <!-- Payer Names -->
                    <div>
                        <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">支付人</label>
                        <input 
                            type="text" 
                            v-model="state.formData.payer_names" 
                            class="w-full bg-white/80 backdrop-blur-md text-[#111111] text-[15px] font-bold px-5 py-4 rounded-[2rem] outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-black/20 border border-black/5"
                            placeholder="例如：张三, 李四"
                        >
                    </div>

                    <!-- Status -->
                    <div class="bg-white/80 backdrop-blur-md rounded-full p-1 flex relative border border-black/5">
                        <div class="absolute inset-y-1 w-[calc(50%-4px)] bg-black rounded-full shadow-sm transition-transform duration-300 ease-out"
                                :class="state.formData.status === 'paid' ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'"></div>
                        <label class="flex-1 relative z-10 flex items-center justify-center py-3 cursor-pointer">
                            <input type="radio" v-model="state.formData.status" value="paid" class="sr-only">
                            <span class="text-[13px] font-bold transition-colors duration-300" :class="state.formData.status === 'paid' ? 'text-white' : 'text-black/40'">已结清</span>
                        </label>
                        <label class="flex-1 relative z-10 flex items-center justify-center py-3 cursor-pointer">
                            <input type="radio" v-model="state.formData.status" value="planned" class="sr-only">
                            <span class="text-[13px] font-bold transition-colors duration-300" :class="state.formData.status === 'planned' ? 'text-white' : 'text-black/40'">计划开支</span>
                        </label>
                    </div>

                    <!-- Notes -->
                    <div>
                        <label class="block text-[11px] font-bold text-black/40 uppercase tracking-widest mb-3 ml-1">补充说明</label>
                        <textarea 
                            v-model="state.formData.notes" 
                            rows="3"
                            class="w-full bg-white/80 backdrop-blur-md text-[#111111] text-[15px] font-bold p-5 rounded-[2rem] outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-black/20 border border-black/5 resize-none"
                            placeholder="填写商品链接、尺寸要求或其他细节..."
                        ></textarea>
                    </div>
                </div>

                <div class=" bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent pb-safe">
                    <button type="submit" class="w-full bg-[#111111] text-white py-4 rounded-full font-bold text-[16px] active:scale-[0.98] transition-transform shadow-[0_10px_30px_rgb(0,0,0,0.2)] flex items-center justify-center">
                        <span v-if="state.saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        {{ state.saving ? '处理中...' : '确认保存' }}
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

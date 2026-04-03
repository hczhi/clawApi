<template>
    <div class="absolute inset-0 flex flex-col bg-[#FAFAFA] text-[#111111] page-content pt-16">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                ASSISTANT
            </span>
        </div>
        
        <!-- Premium Header Area (Optional, using global header for now) -->
        
        <!-- Chat Area -->
        <div class="flex-1 overflow-y-auto px-6 py-6 scroll-smooth relative z-10 space-y-6" ref="chatContainer">
            <!-- Connection Status -->
            <div v-if="!connected" class="flex justify-center items-center py-4">
                <div class="px-4 py-2 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-black/20 animate-pulse"></div>
                    Connecting...
                </div>
            </div>

            <!-- Messages List -->
            <div v-for="msg in messages" :key="msg.id" class="flex flex-col animate-slide-up" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
                <span class="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1 px-2">
                    {{ msg.role === 'user' ? 'Me' : 'AI' }}
                </span>
                <div :class="['max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed shadow-[0_8px_30px_rgb(0,0,0,0.03)] border transition-all duration-300', msg.role === 'user' ? 'bg-[#111111] text-white border-transparent rounded-tr-sm' : 'bg-white/80 backdrop-blur-md text-[#111111] border-black/5 rounded-tl-sm']">
                    {{ msg.content }}
                </div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="flex flex-col items-start animate-fade-in-up">
                <span class="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1 px-2">AI</span>
                <div class="bg-white/80 backdrop-blur-md border border-black/5 rounded-[1.5rem] rounded-tl-sm p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                    <div class="flex space-x-1.5 items-center h-5">
                        <div class="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                        <div class="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                        <div class="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Input Area -->
        <div class="relative z-10 px-6 py-4 bg-white/80 backdrop-blur-xl border-t border-black/5 flex items-end gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgb(0,0,0,0.03)]">
            <div class="flex-1 relative bg-black/[0.03] rounded-[2rem] border border-black/5 transition-colors focus-within:bg-white focus-within:border-black/20 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <textarea 
                    v-model="inputText" 
                    @keydown.enter.prevent="sendMessage" 
                    placeholder="问点什么..." 
                    class="w-full max-h-32 min-h-[44px] bg-transparent border-none rounded-[2rem] px-5 py-3.5 text-sm focus:outline-none resize-none overflow-y-auto placeholder:text-black/30 placeholder:font-bold placeholder:tracking-widest block" 
                    rows="1"
                    @input="adjustTextareaHeight"
                    ref="textareaRef"
                ></textarea>
            </div>
            <button @click="sendMessage" :disabled="!inputText.trim() || !connected" class="w-[44px] h-[44px] rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.15)] disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 transition-all">
                <i data-lucide="arrow-up" class="w-5 h-5"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const connected = ref(false);
const inputText = ref('');
const messages = ref([]);
const isTyping = ref(false);
const chatContainer = ref(null);
const textareaRef = ref(null);

const generateId = () => Math.random().toString(36).substring(2, 15);

const adjustTextareaHeight = () => {
    if (!textareaRef.value) return;
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 128) + 'px';
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const checkHealth = async () => {
    try {
        const response = await axios.get('/api/ai-chat/health');
        if (response.data.connected) {
            connected.value = true;
            if (messages.value.length === 0) {
                messages.value.push({
                    id: generateId(),
                    role: 'ai',
                    content: '你好！我是你的装修助手。有什么我可以帮你的吗？'
                });
            }
        } else {
            connected.value = false;
            setTimeout(checkHealth, 3000); // Retry if connecting
        }
    } catch (e) {
        console.error('Failed to check AI health', e);
        connected.value = false;
        setTimeout(checkHealth, 5000);
    }
};

const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || !connected.value || isTyping.value) return;

    // Add user message to UI
    messages.value.push({
        id: generateId(),
        role: 'user',
        content: text
    });
    
    inputText.value = '';
    isTyping.value = true;
    
    // Reset textarea height
    if (textareaRef.value) {
        textareaRef.value.style.height = 'auto';
    }
    
    scrollToBottom();

    try {
        const response = await axios.post('/api/ai-chat', { question: text });
        
        if (response.data.success) {
            const aiData = response.data.aiResponse;
            messages.value.push({
                id: generateId(),
                role: 'ai',
                content: aiData.message || JSON.stringify(aiData)
            });
        } else {
            messages.value.push({
                id: generateId(),
                role: 'ai',
                content: '抱歉，我遇到了一些问题：' + (response.data.error || '未知错误')
            });
        }
    } catch (e) {
        console.error('Failed to send message', e);
        messages.value.push({
            id: generateId(),
            role: 'ai',
            content: '抱歉，网络请求失败，请稍后重试。'
        });
    } finally {
        isTyping.value = false;
        scrollToBottom();
    }
};

onMounted(() => {
    checkHealth();
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>

<style scoped>
@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in-up {
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

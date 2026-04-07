import re

with open('/Users/czhih/Desktop/work/mywork/clawApi/public/app/js/components/EditHomeView.vue', 'r') as f:
    content = f.read()

# Replace Template
new_template = """<template>
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

        <!-- Canvas Conimport re

with open('/Users/czhih/Desktop/work/mywor-x
with opan-    content = f.read()

# Replace Template
new_template = """<template>
    <div class="app-container page-content edit-h         <div :style="{ winew_template = ""nv    <div class="app-contain0         
        <!-- Header -->
        <div class="edit-header">
            <div classco       "
        <div class="ed              <div class="header-lan                <h2 class="title">编辑户型</h2>
 
             </div>

            <!-- Actions Conta  
            <!--    @mousemove="draw" 
                         @mouseup="endDraw" 
                         @mouselea                <button @click="clearCanvas" class="btn-clear">清空</button                  <button @click="saveEdit" class="btn-save group"       @touchen                    <i data-lucide="check" class="icon"></i>保?                 </button>
            </div>
        </div>

'mov            </div>
     ab        </div>

 or-crosshair'",
import { useAppStore } from '/app/js/store.js';

const { loadModule } = window['vue3-sfc-loader'];

const options = {
    moduleCache: {
        vue: Vue,
        '../store.js': { useAppStore },
        './store.js': { useAppStore },
        '/app/js/store.js': { useAppStore },
        '/desktop/js/store.js': { useAppStore }
    },
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), { res });
        return {
            getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
            type: url.endsWith('.vue') ? '.vue' : (url.endsWith('.scss') ? '.scss' : '.mjs')
        }
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
    async processStyles(src, lang, filename, options) {
        if (lang === 'scss') {
            try {
                // Strip out @import '/app/scss/_variables.scss'; since we are injecting it manually
                const cleanSrc = src.replace(/@import\s+['"]\/app\/scss\/_variables\.scss['"];/g, '');
                const varsRes = await fetch('/app/scss/_variables.scss');
                const vars = await varsRes.text();
                const fullSrc = vars + '\n' + cleanSrc;
                
                return new Promise((resolve, reject) => {
                    Sass.compile(fullSrc, result => {
                        if (result.status === 0) resolve(result.text);
                        else reject(new Error(result.message));
                    });
                });
            } catch (e) {
                console.error("SCSS Compile error:", e);
                return src;
            }
        }
        return src;
    },
    handleModule(type, getContentData, path, options) {
        // Handled by loader
    },
    log(type, ...args) {
        console[type](...args);
    }
};

// Load Desktop components for Main Views
const loadDesktopComponent = (name) => {
    return Vue.defineAsyncComponent(() => loadModule(`/desktop/js/components/${name}.vue`, options));
};

// Load Mobile components for Modals/Forms/Details to reuse logic
const loadMobileComponent = (name) => {
    return Vue.defineAsyncComponent(() => loadModule(`/app/js/components/${name}.vue`, options));
};

const { createApp, onMounted, watch, computed } = Vue;

const app = createApp({
    components: {
        DesktopLayout: loadDesktopComponent('DesktopLayout')
    }
});

// 全局注册 Desktop 主视图组件
app.component('DesktopDashboard', loadDesktopComponent('DesktopDashboard'));
app.component('DashboardScheduleWidget', loadDesktopComponent('dashboard/DashboardScheduleWidget'));
app.component('DashboardMemos', loadDesktopComponent('dashboard/DashboardMemos'));
app.component('DesktopExpenses', loadDesktopComponent('DesktopExpenses'));
app.component('DesktopConcepts', loadDesktopComponent('DesktopConcepts'));
app.component('DesktopPurchasePlans', loadDesktopComponent('DesktopPurchasePlans'));
app.component('DesktopMemos', loadDesktopComponent('DesktopMemos'));

// 全局注册 Desktop 详情组件
app.component('DesktopExpenseDetail', loadDesktopComponent('DesktopExpenseDetail'));
app.component('DesktopPurchasePlanDetail', loadDesktopComponent('DesktopPurchasePlanDetail'));
app.component('DesktopMemoDetail', loadDesktopComponent('DesktopMemoDetail'));
app.component('DesktopScheduleDetail', loadDesktopComponent('DesktopScheduleDetail'));

// 全局注册 Mobile 组件（用于弹窗/表单复用）
app.component('ExpenseDetailView', loadMobileComponent('ExpenseDetailView'));
app.component('ExpenseFormView', loadMobileComponent('ExpenseFormView'));
app.component('ConceptDetailView', loadMobileComponent('ConceptDetailView'));
app.component('ConceptFormView', loadMobileComponent('ConceptFormView'));
app.component('PurchasePlanDetailView', loadMobileComponent('PurchasePlanDetailView'));
app.component('PurchasePlanFormView', loadMobileComponent('PurchasePlanFormView'));
app.component('MemoDetailView', loadMobileComponent('MemoDetailView'));
app.component('MemoFormView', loadMobileComponent('MemoFormView'));
app.component('ScheduleFormView', loadMobileComponent('ScheduleFormView'));
app.component('AreaDetailView', loadMobileComponent('AreaDetailView'));

app.mount('#app');
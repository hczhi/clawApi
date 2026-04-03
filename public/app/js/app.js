import { useAppStore } from './store.js';

const { loadModule } = window['vue3-sfc-loader'];

const options = {
    moduleCache: {
        vue: Vue,
        '../store.js': { useAppStore },
        './store.js': { useAppStore },
        '/app/js/store.js': { useAppStore }
    },
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), { res });
        return {
            getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
            type: url.endsWith('.vue') ? '.vue' : '.mjs'
        }
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
    log(type, ...args) {
        console[type](...args);
    }
};

const loadVueComponent = (name) => {
    return Vue.defineAsyncComponent(() => loadModule(`/app/js/components/${name}.vue`, options));
};

const { createApp, onMounted, watch } = Vue;

const app = createApp({
    components: {
        HomeView: loadVueComponent('HomeView'),
        ExpensesView: loadVueComponent('ExpensesView'),
        ExpenseDetailView: loadVueComponent('ExpenseDetailView'),
        ExpenseFormView: loadVueComponent('ExpenseFormView'),
        ConceptsView: loadVueComponent('ConceptsView'),
        ConceptDetailView: loadVueComponent('ConceptDetailView'),
        ConceptFormView: loadVueComponent('ConceptFormView'),
        AssistantView: loadVueComponent('AssistantView')
    },
    setup() {
        const store = useAppStore();

        // Watchers
        watch(() => store.state.currentView, () => {
            store.state.scrolled = false; // Reset scroll state on view change
            store.helpers.updateIcons();
        });

        // Lifecycle
        onMounted(() => {
            dayjs.locale('zh-cn');
            store.actions.fetchCategories();
            store.actions.fetchHomeData();
            store.actions.fetchExpenses();
            store.helpers.updateIcons();
        });

        return {
            store,
            state: store.state,
            constants: store.constants,
            ...store.computedProps,
            helpers: store.helpers,
            actions: store.actions
        };
    }
});

app.mount('#app');

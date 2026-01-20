import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import Autocomplete from './components/Autocomplete.vue';

createApp(App).mount('#app');

const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const crossIcon = document.getElementById('cross-icon');
const searchClear = document.getElementById('searchClear');
const searchSpace = document.getElementById('searchSpace');

let isAutocompleteMounted = false;

const updateSearchState = (val: string) => {
    window.dispatchEvent(new CustomEvent('searchUpdate', {
        detail: val
    }));

    if (val === '') {
        searchClear?.classList.add('hidden');
    } else {
        searchClear?.classList.remove('hidden');
    }
};

[crossIcon, searchIcon].forEach(el => {
    el?.addEventListener("click", () => {
        const isHidden = searchSpace?.classList.contains('hidden');

        if (isHidden) {
            searchSpace?.classList.remove('hidden');
            window.scrollTo({
                top: 0,
                behavior: 'auto' 
            });
            setTimeout(() => {
                document.body.classList.add('no-scroll');
                searchInput?.focus();
            }, 10);

        } else {
            document.body.classList.remove('no-scroll');
            searchSpace?.classList.add('hidden');
            searchInput?.blur();
        }
    });
});

searchIcon?.addEventListener("click",()=>{
    if(!isAutocompleteMounted){
        createApp(Autocomplete).mount("#searchResults");
    }
    isAutocompleteMounted=true;
})

searchInput?.addEventListener('input', (e) => {
    updateSearchState((e.target as HTMLInputElement).value);
});

searchClear?.addEventListener("click", () => {
    searchInput.value = ''; 
    updateSearchState('');
    searchInput.focus(); 
});
window.addEventListener('vueSearchUpdate', (e: any) => {
    if (searchInput && searchInput.value !== e.detail) {
        searchInput.value = e.detail;
        if(e.detail === '') {
             searchClear?.classList.add('hidden');
        } else {
             searchClear?.classList.remove('hidden');
        }
    }
});
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import Autocomplete from './components/Autocomplete.vue';

createApp(App).mount('#app');
createApp(Autocomplete).mount('#searchResults');

const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const crossIcon = document.getElementById('cross-icon');
const searchClear = document.getElementById('searchClear');
const searchSpace = document.getElementById('searchSpace');

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
        searchSpace?.classList.toggle('hidden');
        document.body.classList.toggle('no-scroll');
        searchInput.focus(); 
    });
});

searchInput?.addEventListener('input', (e) => {
    updateSearchState((e.target as HTMLInputElement).value);
});

searchClear?.addEventListener("click", () => {
    searchInput.value = ''; 
    updateSearchState('');
    searchInput.focus(); 
});

searchInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchSpace?.classList.toggle('hidden');
        document.body.classList.toggle('no-scroll');
    }
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
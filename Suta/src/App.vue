<script  lang="ts">
  import { defineComponent } from 'vue';
  import SearchClient from "@gaspl/search-client";
  import card from './components/card.vue';
  const appId = "26u1hqhy378jlrgxwpaug571";
  const readToken = "SVXPVV89J7GCA4D8DMP7S4N4";
  const collectionId = "KSNQ58MRXELY5JCX767TDSA1";
  const autoSuggestionCollId="X7PKBZVRIHHER13JKQTANV9Y";
  const searchClient = new SearchClient(appId, readToken);
  
  export default defineComponent({
    components:{
      card
    },
    data(){
      return{
        fetchedRawData: {} as Record<string,any>,
        products:{} as Record<any,any>,
        sortBy:"" as string,
        sortList:[
          {
            label:"Price: Low to High",
            field:"discounted_price"
          },
          {
            label:"Price: High to Low",
            field:"-discounted_price"
          },
          {
            label:"Discount: High to Low",
            field:"-discount"
          },
          {
            label:"Date: Old to New",
            field:"created_at"
          },
          {
            label:"Date: New to Old",
            field:"-created_at"
          },] as Array<any>,
        filters:[
          {
            label:"Availability",
            selected:[],
            type:"constant",
            isOpen:false
          },
          {
          label:"Price",
          field:"discounted_price",
          selected:[],
          type:"numeric",
          isOpen:false,
        },
        {
          label:"Discount",
          field:"discount",
          selected:[],
          type:"numeric",
          isOpen:false
        },
        {
          label:"Category",
          field:"product_type",
          selected:[],
          type:"text",
          isOpen:false
        },
        {
          label:"Blouse Piece",
          field:"st_blousetype",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Size",
          field:"size",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Colour",
          field:"colour",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Fabric",
          field:"fabric",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Occasion",
          field:"st_occasion",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Technique",
          field:"st_technique",
          selected:[],
          type:"text",
          isOpen:false
        },
      {
          label:"Pattern",
          field:"st_pattern",
          selected:[],
          type:"text",
          isOpen:false
        },] as Record<string,any>[],
        pageNumber:0 as number,
        isLoading:false as boolean,
        showUp:false as boolean,
        showDown:true as boolean,
        layoutClass:"" as string,
        mobileFilterToggle:false as boolean,
        mobileSortToggle:false as boolean,
        filterCount:0 as number,
        autocompleteSearchResults: {} as Record<string,any>,
        searchQuery:"" as string,
        autocompleteSearchToggle:false as boolean,
        autosuggestionRawData:{} as Record<string,any>,
        autosuggestionResult:{} as Record<string,any>,
        popularChoice:"AND showInSuggestion = 1" as string,
        searchToggle:true as boolean,
        isRestoring:false as boolean,
        pageSize:32 as number,
      };
    },
    methods:{
      async fetchData():Promise<void>{
        this.isLoading=true;
        try{
          searchClient
          .fields("id","product_type","collections" ,"discount", "discounted_price", "images", "price", "size","title","isActive","reviews_average","reviews_count","st_size","created_at","_rank")
          .count(this.pageSize)
          .skip(this.pageNumber*this.pageSize)
          .filter(this.filterQuery())
          .sort(...this.sortOptionArray())
          .textFacets("product_type","st_blousetype","size","colour","fabric","st_occasion","st_technique","st_pattern")
          .numericFacets("discounted_price",[
            {
            min:1000,
            max:1999,
          },
        {
            min:2000,
            max:2999,
          },
        {
            min:3000,
            max:4999,
          },
        {
            min:5000,
            max:6999,
          },
        {
            min:7000,
            max:9999,
          },
        {
            min:10000,
            max:19999,
          },
        {
            min:20000,
            max:49999,
          }])
          .numericFacets("discount",[
            {
            min:10,
            max:20,
          },
          {
            min:20,
            max:30,
          },
          {
            min:30,
            max:40,
          },
          {
            min:40,
            max:50,
          },
          {
            min:50,
            max:60,
          }
          ]);
          this.filters.forEach((ele:any)=>{
            if(ele.selected?.length>0){
              if(ele.type==="text" ){
                searchClient.textFacetFilters(ele.field,ele.selected);
              }
              else if(ele.type==="numeric"){
                ele.selected.forEach((range:any)=>{
                  searchClient.numericFacetFilters(ele.field,range[0],range[1]);
                })
              }
            }
          })
          this.fetchedRawData = await searchClient.search(`${this.searchQuery}`,collectionId);
          this.initialiseFacets();
        }
        catch(er){
          console.log(er);
        }
        finally{
          this.isLoading=false;
        }
        if(this.pageNumber>0){
          this.products=[...this.products,...this.fetchedRawData.results];
        }
        else{
          this.products=this.fetchedRawData.results;
          this.autocompleteSearchResults=this.products.slice(0,6);
        }
      },
      async searchData():Promise<void>{
        try{
          const searchClient = new SearchClient(appId, readToken);
          let query=searchClient
          .fields("id","displayLabel")
          .count(10)
          .filter(`isSearchable = 1  ${this.popularChoice}`)
          this.autosuggestionRawData = await query.search(`${this.searchQuery}`,autoSuggestionCollId);
        }
        catch(er){
          console.log(er);
        }
        this.autosuggestionResult=this.autosuggestionRawData.results;
      
      },
      filterQuery(){
        const baseCondition=[
          "isSearchable = 1",
          "price>0",
          "discount>=0"
        ];
        if(this.isActive()){
          baseCondition.push("isActive=1");
        }
        return baseCondition.join(" AND ");
      },
      sortOptionArray(){
        const sortFields=["-isActive", "saree_position", "-_rank"];
        if(this.sortBy){
          sortFields.push(this.sortBy);
        }
        return sortFields;
      },
      isRangeSelected(selectedArray:any[], min:number, max:number) {
    return selectedArray.some(range => range[0] === min && range[1] === max);
    },  
    toggleRange(selectedArray:any[],min:number,max:number){
      const index = selectedArray.findIndex(range => range[0] === min && range[1] === max);
      if (index === -1) {
      selectedArray.push([min, max]);
    } else {
      selectedArray.splice(index, 1);
    }
    },
    clearFilter(selectedArray:any[]){
      selectedArray.length=0;
    },
    clearAllFiler(){
      this.filters.forEach((ele)=>{
        ele.selected.length=0;
      })
    },
    isActive():boolean{
      const availableFilter=this.filters.find((ele)=>{
        return ele.label==="Availability";
      })
      if(availableFilter && availableFilter.selected.length>0){
        return true;
      }
      return false;
    }
  ,
  removeFilter(selectedArray:any[],item:any){
    const index=selectedArray.indexOf(item);
    selectedArray.splice(index,1);
  },
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  handleScroll(){
    this.showUp=window.scrollY>50;
    this.showDown=!(window.scrollY+window.innerHeight >=document.documentElement.offsetHeight-50);
  },
  move(direction:string){
    const amount=500;
    window.scrollBy({
      top:direction=='up'?-amount:amount,
      behavior:'smooth'
    });
  },
initialiseFacets(){
  for(let ele of this.filters){
    if(ele.type==='numeric'){
      ele.facets=this.fetchedRawData.numericFacets[ele.field];
    }
    else if(ele.type==='text'){
      ele.facets=this.fetchedRawData.textFacets[ele.field]
    }
  }
  console.log(this.filters);
},
getSortedSubItems(item:any) {
    let sourceList = [];
    sourceList = item.facets || [];
    return [...sourceList]
    .filter(subItem => {
         const count = (item.type === 'numeric') ? subItem.count : subItem.value; 
         return count > 0;
      })
    .sort((a, b) => {
      const isASelected = this.checkSelected(item, a);
      const isBSelected = this.checkSelected(item, b);
      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return 0; 
    });
  },
checkSelected(item:any, subItem:any) {
    if (item.type === 'numeric') {
      return this.isRangeSelected(item.selected, subItem.min, subItem.max);
    } else {
      return item.selected.includes(subItem.label); 
    }
  },
checkSearchQuery(){
  if(this.searchQuery!=""){
    this.searchToggle=false;
    this.popularChoice="";
  }
  else{
    this.searchToggle=true;
    this.popularChoice="AND showInSuggestion = 1";
  }
},
fillSuggestion(element:string){
  this.searchQuery=element;
  this.fetchData();
},
updateURL(){
  if (this.isRestoring) return;
  const params=new URLSearchParams();
  if(this.searchQuery){
    params.set('q',this.searchQuery);
  }
  if(this.sortBy){
    params.set('s',this.sortBy);
  }
  this.filters.forEach(filter=>{
    if(filter.selected && filter.selected.length>0){
      if(filter.type==='numeric'){
        const rangeString=filter.selected.map(range=>`${range[0]}-${range[1]}`).join(',');
        params.set(filter.field,rangeString);
      }
      else if(filter.type==='constant'){
        params.set('In Stock Only','true');
      }
      else{
        params.set(filter.field,filter.selected.join(','));
      }

    }
  });
  const newUrl=`${window.location.pathname}?${params.toString()}`;
  window.history.pushState({path:newUrl},'',newUrl);
},
restoreState() {
    this.isRestoring = true;
  const params = new URLSearchParams(window.location.search);
  const q=params.get('q');
  if(q) this.searchQuery=q;
  const s=params.get('s');
  if(s) this.sortBy=s;
  let availableF = this.filters.find((ele) => ele.label === 'Availability');
  if (availableF) {
    const stockVal = params.get('In Stock Only');
    availableF.selected = stockVal ? ['In Stock Only'] : [];
  }
  this.filters.forEach(filter => {
    if (filter.label === 'Availability') return; 

    const value = params.get(filter.field);
    if (value) {
      if (filter.type === 'numeric') {
        filter.selected = value.split(',').map(rangeStr => {
          return rangeStr.split('-').map(Number);
        });
      } else {
        filter.selected = value.split(',');
      }
    } else {
      filter.selected = [];
    }
  });

  this.fetchData();
  this.$nextTick(() => {
    this.isRestoring = false;
  });
  },
isDeviceMobile(){
  return window.matchMedia("(max-width : 767px)").matches;
},
isDeviceTablet(){
  return window.matchMedia("(min-width : 767px) and (max-width : 1024px)").matches;
},
onSearch(){
  this.updateURL();
  this.checkSearchQuery();
  this.searchData();
}
    },
    mounted(){
      this.searchData();
      this.restoreState();
      window.addEventListener("scroll",this.handleScroll);
      this.handleScroll();
      window.addEventListener('popstate', this.restoreState);
    },
    beforeDestroy(){
      window.removeEventListener("scroll",this.handleScroll);
    },
    beforeUnmount(){
      window.removeEventListener('popstate', this.restoreState);
    },
    watch:{
    autocompleteSearchToggle(newValue) { 
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
    },
    computed: {
  selectedFilterCount(){
    let total=this.filters.reduce((sum,item)=>{
      return sum+(item.selected?item.selected.length:0);
    },0);
    return total;
  },
  layoutRatio(){
    if(this.isDeviceMobile() || this.isDeviceTablet()){
      this.layoutClass= "twoBytwo";
      return "twoBytwo";
    }
      this.layoutClass="threeBythree";
      return "threeBythree"
  }
},
  })
</script>

<template>
  <header class="st-sticky st-top-0 st-z-20 st-bg-[#fff]">
  <div class=" st-flex md:st-gap-[15px]  st-justify-between st-py-[8px] md:st-px-[48px] st-px-[20px] st-items-center st-shadow-[inset_0_-1px_rgb(28_28_28_/_0.15)]">
    
    <div class="burgerBox lg:st-hidden st-flex st-gap-[20px]">
      <button type="button">
        <svg aria-hidden="true" fill="none" focusable="false" width="24" class="header__nav-icon icon icon-hamburger" viewBox="0 0 24 24">
          <path d="M1 19h22M1 12h22M1 5h22" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path>
        </svg>
      </button>
      <div class=""></div>
      <div class=""></div>
      <div class=""></div>
    </div>

    <a href="/" class="">
      <span class="st-sr-only">Suta</span>
      <img 
        class="st-w-[70px] st-max-w-full st-h-auto header__logo-image lcp-candidate" 
        src="//suta.in/cdn/shop/files/Suta_final_logo_df452a25-681f-4caa-a64e-a389640ad0f2.png?v=1761126095&amp;width=2283" 
        alt="" 
        srcset="//suta.in/cdn/shop/files/Suta_final_logo_df452a25-681f-4caa-a64e-a389640ad0f2.png?v=1761126095&amp;width=140 140w, //suta.in/cdn/shop/files/Suta_final_logo_df452a25-681f-4caa-a64e-a389640ad0f2.png?v=1761126095&amp;width=210 210w" 
        width="2283" 
        height="1521" 
        sizes="70px" 
        loading="eager" 
        fetchpriority="high"
      >
    </a>

    <nav class=" st-hidden lg:st-block">
      <ul class=" st-flex st-flex-wrap st-justify-center st-align-middle st-gap-[41.6px] st-text-[14px] st-tracking-[1.2px] st-cursor-pointer ">
        <li class="st-hover:translate-y-[-10px] st-ease-in-out  "><a class="st-visited:text-[#000080]" href="https://www.google.com/" target="_blank">Women</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out  "><a class="st-visited:text-[#000080]" href="https://www.google.co" target="_blank">Suta Wedding</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out  "><a class="st-visited:text-[#000080]" href="https://www.google.c" target="_blank">Men</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out st-text-[#FF0000] "><a class="st-visited:text-[#000080]" href="https://www.google" target="_blank">Sale</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.googl" target="_blank">Kids</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.goog" target="_blank">Accessories</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.goo" target="_blank">Gifts</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.go" target="_blank">Collections</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.g" target="_blank">Our Stores</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.googleee" target="_blank">About Us</a></li>
        <li class="st-hover:translate-y-[-10px] st-ease-in-out"><a class="st-visited:text-[#000080]" href="https://www.ggg" target="_blank">FAQ</a></li>
      </ul>
    </nav>

    <nav>
      <ul class="st-flex st-gap-[10px] md:st-gap-[20px] st-align-middle ">
        
        <li class="md:st-hidden">
          <a title="App Download" target="_blank" class="Header__Icon Icon-Wrapper Icon-Wrapper--clickable suta_download hide-on-desktop" href="https://onelink.to/k35vtm">
            
            <svg class="st-w-[35px] st-h-[26px]" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840.57 500">
              <g>
                <rect class="st-fill-none st-stroke-black st-stroke-[25px]" stroke-linecap="round" stroke-linejoin="round" x="30" y="25" width="303.16" height="450" rx="30.86" ry="30.86"></rect>
                <line class="st-fill-none st-stroke-black st-stroke-[25px]" stroke-linecap="round" stroke-linejoin="round" x1="181.58" y1="119.96" x2="181.58" y2="354.65"></line>
                <line class="st-fill-none st-stroke-black st-stroke-[25px]" stroke-linecap="round" stroke-linejoin="round" x1="93.5" y1="266.57" x2="181.58" y2="354.65"></line>
                <line class="st-fill-none st-stroke-black st-stroke-[25px]" stroke-linecap="round" stroke-linejoin="round" x1="269.65" y1="266.57" x2="181.58" y2="354.65"></line>
                
                <path class="st-stroke-[0px]" d="m30,412.84h303.16v35.12c0,14.92-12.12,27.04-27.04,27.04H55.57c-14.11,0-25.57-11.46-25.57-25.57v-36.59h0Z"></path>
              </g>
              <text class="st-text-[228.78px] st-font-medium" transform="translate(366.51 331.21)">
                <tspan x="0" y="0">APP</tspan>
              </text>
            </svg>
            </a>
        </li>

        <li><a href=""><svg aria-hidden="true" fill="none" focusable="false" width="24" class="header__nav-icon icon icon-account" viewBox="0 0 24 24">
              <path d="M16.125 8.75c-.184 2.478-2.063 4.5-4.125 4.5s-3.944-2.021-4.125-4.5c-.187-2.578 1.64-4.5 4.125-4.5 2.484 0 4.313 1.969 4.125 4.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M3.017 20.747C3.783 16.5 7.922 14.25 12 14.25s8.217 2.25 8.984 6.497" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"></path>
            </svg></a></li>
        <li @click="autocompleteSearchToggle=!autocompleteSearchToggle" class=" md:st-block st-cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 17 17" fill="none">
              <path d="M15.439 15.439L12.6315 12.6314M14.6368 7.81841C14.6368 11.5841 11.5841 14.6368 7.81841 14.6368C4.05271 14.6368 1 11.5841 1 7.81841C1 4.05271 4.05271 1 7.81841 1C11.5841 1 14.6368 4.05271 14.6368 7.81841Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></li>
        <li><a href=""><svg aria-hidden="true" fill="none" focusable="false" width="24" class="header__nav-icon icon icon-cart" viewBox="0 0 24 24">
              <path d="M10 7h13l-4 9H7.5L5 3H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <circle cx="9" cy="20" r="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></circle>
              <circle cx="17" cy="20" r="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></circle>
            </svg></a></li>
      </ul>
    </nav>
  </div>
</header>
 <section @click.self="autocompleteSearchToggle=false" v-if="autocompleteSearchToggle" class="searchSpace st-absolute st-top-0 md:st-top-auto st-bg-[#fff] md:st-bg-transparent md:st-fixed st-z-[3000] st-h-full st-w-full">
    <div   class=" st-px-[5px] st-pt-[12px] st-min-h-[35px]" style="display: block;">
   <div class=" st-flex  st-align-middle st-bg-[#ffffff8d] st-h-[39px] st-relative st-px-[20px] st-border-[2px] st-border-solid st-border-[#e19906] st-rounded-[5px]" id="search-desktop">
      <span class=" st-icon-search st-translate-y-[7px]">
         <svg data-icon="search" viewBox="0 0 512 512" width="14px" height="20px">
            <path d="M495,466.2L377.2,348.4c29.2-35.6,46.8-81.2,46.8-130.9C424,103.5,331.5,11,217.5,11C103.4,11,11,103.5,11,217.5   S103.4,424,217.5,424c49.7,0,95.2-17.5,130.8-46.7L466.1,495c8,8,20.9,8,28.9,0C503,487.1,503,474.1,495,466.2z M217.5,382.9   C126.2,382.9,52,308.7,52,217.5S126.2,52,217.5,52C308.7,52,383,126.3,383,217.5S308.7,382.9,217.5,382.9z"></path>
         </svg>
      </span>
      <input @input="fetchData(),onSearch()" @keyup.enter="autocompleteSearchToggle=false" v-model="searchQuery"  class="st-basis-[95%] st-pl-[30px]  st-font-[18px] st-border-none st-h-[35px] st-outline-none st-focus:outline-none st-focus:ring-0" type="text" name="st" placeholder="Search for Sarees" value="" autocapitalize="off" autocomplete="off" autocorrect="off">
      <span v-show="searchQuery" @click="searchQuery='', fetchData(),updateURL(),onSearch()" class=" input-close-btn st-translate-y-[5px] st-pr-[10px] st-text-[14px] st-cursor-pointer" style="display: block;">Clear</span>
      <span @click="autocompleteSearchToggle=false" class=" close_search st-translate-y-[10px] st-cursor-pointer">
         <svg height="12px" style="enable-background:new 0 0 512.001 512.001;" viewBox="0 0 512.001 512.001" width="12px" x="0px" xml:space="preserve" y="0px">
            <path class="active-path" d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717 L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859 c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287 l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285 L284.286,256.002z" data-old_color="#000000" data-original="#000000" fill="#4E3830"></path>
         </svg>
      </span>
   </div>
    </div>
    <section v-if="autosuggestionResult.length===0" class="lg:st-flex st-flex-col st-w-full st-text-center st-bg-[#fff]">
  <p class="st-font-[600] st-my-[10px]">No Results found for '{{searchQuery}}'</p>
  <p class="st-mb-[10px]">Try Searching some other keywords</p>
    </section>
    <div v-else class="st-row st-flex-wrap st-flex st-flex-col md:st-flex-row ">
  <section v-if="searchToggle" class="st-col-lg-3 st-col-md-3 st-left-col md:st-w-[25%]  st-trending-search st-p-[10px] lg:st-pl-[40px] st-bg-[#f6f7f7]  st-mb-[10px] lg:st-mb-[0]" style="">
   <div id="st-before-search">
      <div class="st-trending-header st-mb-[10px]"><span class="st-heading-text st-text-[13px] st-uppercase st-pb-[10px] st-text-[#323232] st-font-semibold">Popular Choices</span></div>
      <div>
         <ul class="sm:st-gap-[10] st-trending-list st-inline-flex st-flex-wrap md:st-flex-row st-gap-2.5 st-m-0 st-p-0 st-w-full st-flex-col">
            <li v-for="ele in autosuggestionResult" :key="ele.displayLabel" class="st-text-center st-bg-[#dddddd] st-shadow-[0_0_0_1px_rgba(0,0,0,.02)] st-w-[48%] sm:hover:st-bg-[#ffffff] sm:hover:st-shadow-[0_0_0_1px_rgba(0,0,0,.02)] st-py-[5px] !st-px-[10px] sm:st-py-[7px] !sm:st-px-[10px]  st-rounded-[4px] st-trending-label st-text-[12px] st-uppercase st-font-normal st-m-0.5 st-inline-block"><span>
              <span @click="fillSuggestion(ele.displayLabel)" class="st-label-text st-whitespace-normal st-text-[#000000] st-cursor-pointer">{{ ele.displayLabel }}</span></span>
            </li>
         </ul>
      </div>
   </div>
</section>
   <div v-else class="st-col-lg-3 st-col-md-3 st-left-col md:st-w-[25%] st-p-[10px] lg:st-pl-[40px] st-bg-[#f6f7f7]" style="">
      <div class="st-left-col-header st-relative st-pb-[10px] st-mb-[10px] after:st-absolute after:st-inline-block after:st-w-[auto] after:st-h-[1px] after:st-right-[0px] after:st-bottom-[0] after:st-left-[0px] after:st-bg-[#e4e4e9]"><span class="st-whitespace-normal st-heading-text st-text-[13px] st-uppercase st-pb-[10px] st-text-[#323232] st-font-semibold"> Search Suggestions </span>
      </div>
      <div>
         <ul class="sm:st-gap-2.5 st-trending-list st-inline-flex st-flex-wrap st-flex-col st-gap-2.5 st-m-0 st-p-0 st-w-full">
            <li v-for="ele in autosuggestionResult.slice(0,5)" :key="ele.displayLabel" class="sm:st-py-[0px] st-py-[0] st-px-[0] sm:st-px-[0] st-trending-label st-text-[12px] st-uppercase st-font-medium st-m-0.5 st-inline-block"><span>
              <span @click="fillSuggestion(ele.displayLabel)" class="st-label-text st-whitespace-normal st-text-[#000000] st-cursor-pointer">{{ ele.displayLabel }}</span>
            </span></li>
         </ul>
      </div>
      <div class="no-trending-search-text" style="display: none;"><span  class="st-text-[12px] st-text-[#604a4a]">No Search Suggestions</span></div>
   </div>
   <div class="sidebar st-col-lg-9 st-col-md-9 st-right-col md:st-w-[75%]  st-p-[10px] lg:st-pr-[40px] st-bg-[#fff]">
      <div class="st-trending-header st-mb-[10px]">
        <span class="st-heading-text st-text-[13px] st-uppercase st-pb-[10px] st-text-[#323232] st-font-semibold st-pl-[30px]">Search Results</span></div>
      <!---->
      <div class="st-row st-cols-2 st-cols-sm-2 st-cols-md-4 st-product-wrapper st-flex st-flex-nowrap st-overflow-y-auto">
         <div v-for="(value,index) in autocompleteSearchResults" :key="index" class="st-product-wrap st-w-1/2 sm:st-px-[15px] st-px-[2.5px] lg:st-w-1/4 st-shrink-0" >
            <card  :key="value"  :user-data="value" :ratio="layoutClass"/>
         </div>
      </div>
   </div>
    </div>
    <div v-if="autosuggestionResult.length>0" class="st-row st-flex st-m-[0] ">
   <div class="st-left-col st-w-[25%] st-p-[10px] st-bg-[#f6f7f7] !st-block"></div>
   <div class="st-right-col st-right-col st-w-[75%] st-p-[10px] st-bg-[#f6f7f7]">
      <div @click="autocompleteSearchToggle=false" class="st-goto-search st-text-center" style=""><span class="st-box-btn st-text-[14px] st-normal-case st-font-bold st-text-[#343434] st-cursor-pointer"> View all (<span>{{fetchedRawData.totalHits}}</span>) product<span style="">s</span></span></div>
   </div>
    </div>
</section>
  <section class="mobileBottom md:st-hidden ">
  <div class="mobile-bottom-nav st-w-[100%] st-bg-[#fff] st-fixed st-z-[100] st-bottom-0 st-py-[5px] st-text-[#000000a1]">
    <ul class="mobile-bottom-nav--wrapper st-flex st-justify-evenly">
      <li class="mobile-bottom-nav--item">
        <a href="/" class="st-flex st-flex-col st-items-center">
          <div class="mobile-bottom-nav-item--icon">
            
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 15 15" fill="none">
      <g clip-path="url(#clip0_74_611)">
        <path d="M14.8405 6.0957L7.73026 0.889731C7.59315 0.78936 7.40688 0.78936 7.26983 0.889731L0.159538 6.0957C-0.0141334 6.22288 -0.0518678 6.46674 0.0753099 6.64042C0.202488 6.81409 0.446384 6.85176 0.620027 6.72464L7.50002 1.68722L14.38 6.72461C14.4494 6.77544 14.53 6.79991 14.6099 6.79991C14.7299 6.79991 14.8483 6.74468 14.9247 6.64039C15.0519 6.46674 15.0142 6.22288 14.8405 6.0957Z" fill="black"></path>
        <path d="M12.9564 6.81274C12.7412 6.81274 12.5666 6.98724 12.5666 7.20248V13.4061H9.4488V10.0198C9.4488 8.94515 8.57452 8.07093 7.49997 8.07093C6.42542 8.07093 5.55114 8.94521 5.55114 10.0198V13.4061H2.43328V7.20251C2.43328 6.98727 2.25876 6.81277 2.04354 6.81277C1.82833 6.81277 1.65381 6.98727 1.65381 7.20251V13.7959C1.65381 14.0111 1.82833 14.1856 2.04354 14.1856H5.94088C6.14584 14.1856 6.31356 14.0272 6.32909 13.8262C6.33003 13.8171 6.33062 13.8071 6.33062 13.7959V10.0198C6.33062 9.37499 6.85518 8.85043 7.49997 8.85043C8.14477 8.85043 8.66933 9.37502 8.66933 10.0198V13.7959C8.66933 13.8071 8.66991 13.8169 8.67085 13.8259C8.6862 14.027 8.85398 14.1856 9.05906 14.1856H12.9564C13.1716 14.1856 13.3461 14.0111 13.3461 13.7959V7.20251C13.3461 6.98724 13.1716 6.81274 12.9564 6.81274Z" fill="black"></path>
      </g>
      <defs>
        <clipPath id="clip0_74_611">
          <rect width="15" height="15" fill="white"></rect>
        </clipPath>
      </defs>
    </svg>
  
          </div>
          <div class="mobile-bottom-nav-item--text st-text-[12px] st-mt-[4px]">Home</div>
        </a>
      </li>

      <li class="mobile-bottom-nav--item" aria-controls="categories-sections--26209942438259__bottom_navigation_yGz9aB">
        <a href="/" class="st-flex st-flex-col st-items-center">
          <div class="mobile-bottom-nav-item--icon ">
            
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 13 13" fill="none" class="categories-icon">
      <rect x="0.433333" y="0.433333" width="4.33333" height="4.33333" stroke="black" stroke-width="0.866667"></rect>
      <rect x="8.23338" y="0.433333" width="4.33333" height="4.33333" stroke="black" stroke-width="0.866667"></rect>
      <rect x="0.433333" y="8.23338" width="4.33333" height="4.33333" stroke="black" stroke-width="0.866667"></rect>
      <rect x="8.23338" y="8.23338" width="4.33333" height="4.33333" stroke="black" stroke-width="0.866667"></rect>
    </svg>

  
          </div>
          <div class="mobile-bottom-nav-item--text st-text-[12px] st-mt-[4px]">Categories</div>
        </a>
      </li>

      <li class="mobile-bottom-nav--item" aria-controls="new-launch-sections--26209942438259__bottom_navigation_yGz9aB">
        <a href="/" class="st-flex st-flex-col st-items-center">
          <div class="mobile-bottom-nav-item--icon ">
            
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 20 20" width="20" height="20" style=" transform: scale(1.5);" class="new-launch-icon">
      <title>image (4)</title>
      <path class="s0" d="m8.6 4.2c0 0.1 0 0.1 0.1 0.1q0.3 0.1 0.5 0.3c0.1 0 0.1 0 0.1 0.1q0.2 0 0.3 0.1c0.2 0.1 0.3 0.2 0.6 0.1q0.2 0 0.4-0.2c0.1 0 0.1 0 0.1 0q0.1-0.1 0.2-0.2 0.3-0.1 0.6-0.3c0 0 0 0 0.1 0q0 0 0-0.1 0.1 0 0.1 0c0.2-0.1 0.3-0.1 0.5-0.1q0.3 0.1 0.4 0.4 0.1 0.2 0.2 0.4 0.1 0.3 0.3 0.6 0.1 0.2 0.2 0.5c0.1 0.1 0.2 0.2 0.3 0.3q0.2 0 0.4 0 0.1 0.1 0.2 0.1 0.3 0 0.7 0.1 0 0 0.1 0 0.1 0 0.2 0c0.2 0 0.4 0.1 0.6 0.3 0.1 0.1 0.1 0.3 0.1 0.5q-0.1 0.3-0.1 0.5 0 0.2-0.1 0.3 0 0 0 0.1 0 0 0 0.1 0 0.2-0.1 0.4c0 0.2 0 0.4 0.1 0.6 0.2 0.3 0.4 0.5 0.6 0.7q0.2 0.1 0.4 0.3 0.1 0.1 0.2 0.3c0.2 0.1 0.2 0.2 0.3 0.3 0 0.2-0.1 0.4-0.2 0.5q-0.2 0.3-0.4 0.4-0.2 0.2-0.3 0.3-0.2 0.2-0.3 0.3c-0.2 0.2-0.4 0.3-0.4 0.6 0 0.2 0 0.3 0.1 0.5q0 0.1 0 0.2 0 0.3 0.1 0.5c0.1 0.4 0.2 0.7 0 1-0.1 0.2-0.3 0.3-0.5 0.3 0 0 0 0-0.1 0.1q-0.3 0-0.6 0-0.3 0.1-0.5 0.1 0 0-0.1 0-0.1 0-0.2 0c-0.1 0.1-0.1 0.1-0.2 0.1-0.1 0-0.2 0.1-0.3 0.3q-0.1 0.1-0.1 0.2-0.1 0.1-0.1 0.2 0 0.1 0 0.1-0.1 0.2-0.3 0.5 0 0.1-0.1 0.3c-0.1 0.2-0.2 0.4-0.4 0.5-0.1 0-0.1 0-0.2 0q0 0-0.1 0c-0.3 0-0.5-0.2-0.7-0.3q-0.1 0-0.2-0.1-0.2-0.1-0.5-0.3c-0.3-0.1-0.5-0.2-0.8-0.2q-0.1 0.1-0.2 0.1-0.2 0.1-0.3 0.2-0.1 0.1-0.1 0.1-0.1 0-0.2 0.1-0.1 0-0.2 0.1 0 0-0.1 0.1-0.1 0-0.2 0.1c-0.2 0.1-0.3 0.1-0.5 0.1q0 0-0.1 0-0.2 0-0.3-0.2-0.3-0.5-0.6-1.1-0.1-0.1-0.1-0.3 0 0-0.1-0.1c0-0.2-0.1-0.3-0.3-0.4-0.5-0.1-1-0.2-1.5-0.2-0.2 0-0.5-0.1-0.6-0.2q-0.1 0-0.1-0.1 0 0 0 0c-0.2-0.3-0.1-0.5-0.1-0.8q0.1-0.2 0.1-0.5 0.1-0.3 0.1-0.5c0-0.1 0-0.1 0.1-0.2q0-0.1 0-0.2 0-0.1 0-0.1c-0.1-0.3-0.3-0.5-0.5-0.6q0-0.1-0.1-0.2 0 0-0.1 0-0.1-0.2-0.2-0.3-0.2-0.1-0.3-0.3c-0.2-0.1-0.3-0.3-0.4-0.5 0-0.2 0-0.3 0.1-0.5q0.1 0 0.2-0.1 0.2-0.1 0.3-0.3c0.4-0.4 0.4-0.4 0.6-0.6 0.2-0.2 0.4-0.3 0.4-0.6q0-0.3-0.1-0.5-0.1-0.2-0.1-0.5 0-0.1 0-0.3c-0.2-0.7-0.2-0.7-0.1-0.9 0.2-0.2 0.5-0.3 0.8-0.3q0.1 0 0.1-0.1 0.1 0 0.2 0 0.2 0 0.4 0 0.1 0 0.3-0.1 0.1 0 0.1 0c0.2 0 0.4 0 0.6-0.2q0.1-0.1 0.2-0.3 0.1-0.3 0.2-0.5 0.1-0.2 0.2-0.5c0.2-0.5 0.2-0.5 0.4-0.6 0.4-0.1 0.6-0.1 0.9 0.1zm3.2 0.5q-0.2 0.2-0.5 0.3 0 0-0.1 0.1c-0.5 0.2-0.5 0.2-0.7 0.4-0.1 0-0.1 0-0.1 0q-0.2 0-0.4 0 0 0-0.1 0c-0.3 0-0.6-0.2-0.8-0.3q-0.1-0.1-0.2-0.1-0.4-0.2-0.7-0.4c-0.1-0.1-0.1-0.1-0.2 0 0 0 0 0-0.1 0.1q-0.1 0.2-0.2 0.4-0.1 0.2-0.1 0.3-0.1 0.2-0.2 0.4c0 0.1 0 0.1 0 0.1-0.2 0.3-0.3 0.5-0.6 0.7-0.4 0.1-0.9 0.2-1.3 0.2q-0.1 0-0.2 0.1c-0.1 0-0.1 0-0.1 0q-0.2 0-0.4 0 0 0 0 0.1 0 0.2 0.1 0.5 0 0 0 0.1 0 0.1 0 0.2 0 0.2 0.1 0.4 0.1 0.3 0.1 0.6 0 0.1 0 0.1c0 0.3-0.2 0.6-0.4 0.8q-0.1 0.1-0.2 0.2 0 0-0.1 0.1-0.2 0.2-0.5 0.4-0.1 0.1-0.2 0.3c-0.1 0-0.1 0-0.1 0 0 0.1 0 0.1-0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.2q0.2 0.2 0.3 0.4 0.2 0.1 0.4 0.3c0.3 0.3 0.6 0.5 0.7 1.1 0 0.4-0.1 0.7-0.2 1.1q-0.1 0.4-0.1 0.8 0.2 0.1 0.5 0.1c0 0 0 0 0.1 0q0.3 0.1 0.7 0.1c0.4 0 0.8 0.1 1.1 0.5q0 0.1 0.1 0.3 0 0 0.1 0 0.1 0.4 0.3 0.8 0.1 0.1 0.1 0.2 0 0.1 0.1 0.1 0 0.1 0 0.1 0 0.1 0 0.1c0.1 0.1 0.1 0.1 0.1 0.1 0.1 0 0.2 0 0.3-0.1q0 0 0.1 0c0-0.1 0-0.1 0.1-0.1q0.1-0.1 0.2-0.1 0-0.1 0.1-0.1 0.2-0.1 0.5-0.2c0.1-0.1 0.1-0.1 0.1-0.1 0.3-0.2 0.6-0.2 0.9-0.2q0.2 0.1 0.4 0.2 0 0 0 0 0.4 0.2 0.8 0.4 0 0.1 0.1 0.1 0.1 0 0.1 0.1 0.1 0 0.1 0c0.1 0.1 0.1 0.1 0.1 0.1 0.1 0 0.1 0 0.2 0 0-0.1 0-0.1 0.1-0.2q0 0 0-0.1 0 0 0-0.1c0.1 0 0.1 0 0.1 0q0.1-0.2 0.1-0.3 0.1-0.3 0.3-0.6c0 0 0 0 0-0.1 0.2-0.3 0.4-0.6 0.7-0.7 0.3-0.1 0.5-0.1 0.8-0.1q0.1 0 0.3-0.1 0 0 0.1 0 0.3 0 0.7-0.1c0-0.2 0-0.4-0.1-0.6q-0.1-0.2-0.1-0.5 0-0.1 0-0.2c-0.1-0.5-0.1-0.9 0.1-1.2q0.2-0.3 0.4-0.4 0-0.1 0.1-0.1 0.2-0.3 0.4-0.5 0.2-0.1 0.2-0.2c0.2-0.1 0.2-0.1 0.2-0.1 0-0.1 0-0.1 0-0.2q-0.1 0-0.1 0-0.4-0.4-0.7-0.7-0.1-0.1-0.2-0.2c-0.3-0.3-0.5-0.5-0.5-0.9q0-0.6 0.2-1.1 0-0.2 0-0.4 0.1-0.1 0.1-0.1 0-0.2 0-0.4-0.1 0-0.1 0-0.2 0-0.4 0-0.1 0-0.2-0.1-0.4 0-0.8-0.1c0 0 0 0-0.1 0-0.3 0-0.6-0.2-0.8-0.5q-0.2-0.3-0.4-0.7 0-0.1-0.1-0.3-0.1-0.1-0.1-0.2-0.1-0.2-0.2-0.3 0-0.1 0-0.2c-0.1 0-0.2 0.1-0.3 0.1z"></path>
      <path class="s1" d="m10.8 9.6q0.1 0 0.3 0 0.1 0.4 0.2 0.8 0 0.3 0.1 0.6 0 0 0 0 0.1 0.1 0.1 0.2 0.1 0.3 0.1 0.6 0 0 0 0c0-0.1 0-0.1 0-0.1 0.1-0.5 0.2-0.9 0.4-1.3q0-0.2 0.1-0.4 0 0 0-0.1 0-0.1 0-0.1c0.1-0.1 0.1-0.1 0.1-0.2q0.1 0 0.2 0c0.1 0 0.1 0 0.1 0q0.1 0 0.1 0 0 0.1 0 0.1 0.1 0.2 0.1 0.4c0.1 0 0.1 0 0.1 0.1q0.1 0.3 0.1 0.6c0.1 0.3 0.2 0.6 0.2 1q0.1 0 0.1 0 0 0 0-0.1c0-0.3 0.1-0.7 0.2-1.1q0.1-0.3 0.2-0.6 0-0.1 0-0.1 0-0.1 0-0.1c0-0.1 0-0.1 0.1-0.2q0.1 0 0.3 0 0 0.3-0.1 0.6c0 0.1 0 0.1 0 0.1-0.1 0.1-0.1 0.1-0.1 0.1q0 0.2-0.1 0.4 0 0 0 0 0 0.1 0 0.2-0.1 0-0.1 0.1-0.1 0.6-0.3 1.1-0.1 0-0.3 0 0 0 0-0.1-0.1-0.1-0.1-0.3 0-0.1-0.1-0.1c-0.1-0.4-0.1-0.4-0.2-0.7 0-0.1 0-0.1 0-0.1q0-0.1 0-0.2-0.1-0.3-0.2-0.6c0 0 0 0 0-0.1 0 0.1 0 0.1 0 0.1q-0.1 0.2-0.2 0.4 0 0.1 0 0.2-0.1 0.4-0.3 0.9 0 0.1 0 0.2-0.1 0.2-0.1 0.4-0.2 0-0.4 0 0-0.1-0.1-0.3 0 0 0-0.1-0.1-0.2-0.1-0.5 0-0.1-0.1-0.2 0-0.1 0-0.2-0.1-0.3-0.2-0.5 0-0.2-0.1-0.4 0-0.1 0-0.1c0-0.2 0-0.2 0-0.3z"></path>
      <path class="s0" d="m6 9.6c0.4 0 0.4 0 0.5 0.1q0 0 0 0.1 0.1 0 0.1 0.1 0 0 0.1 0.1 0 0.1 0.1 0.2 0.1 0.1 0.1 0.2 0.1 0.1 0.2 0.2 0 0.1 0.1 0.2 0 0.1 0.1 0.2c0 0.1 0 0.1 0.1 0.1q0 0.1 0.1 0.1 0 0.1 0 0.1c0 0 0 0 0 0.1q0.1 0.1 0.2 0.2 0-1 0-2 0.2 0 0.4 0 0 1.3 0 2.6c-0.4 0-0.4 0-0.5 0q0-0.1 0-0.1-0.1-0.1-0.1-0.1 0-0.1-0.1-0.1 0-0.1 0-0.1-0.1-0.2-0.2-0.3-0.1-0.1-0.2-0.3-0.2-0.2-0.3-0.5-0.2-0.2-0.3-0.4 0 0.9 0 1.9-0.2 0-0.4 0 0-1.3 0-2.6z"></path>
      <path class="s2" d="m8.6 9.6q0.9 0 1.8 0 0 0.2 0 0.4-0.7 0-1.4 0 0 0.3 0 0.7 0.7 0 1.4 0 0 0.2 0 0.4-0.7 0-1.4 0 0 0.4 0 0.8 0.7 0 1.5 0 0 0.2 0 0.3-0.9 0-1.9 0 0-1.3 0-2.6z"></path>
    </svg>

  
          </div>
          <div class="mobile-bottom-nav-item--text st-text-[12px] st-mt-[4px]">New Arrivals</div>
        </a>
      </li>

      <li class="mobile-bottom-nav--item  bottom-cart-icon">
        <a href="" class="st-flex st-flex-col st-items-center">
          <div aria-controls="cart-drawer" data-no-instant="">
            <div class="mobile-bottom-nav-item--icon">
              <svg aria-hidden="true" fill="none" focusable="false" width="24" class="icon icon-cart" viewBox="0 0 24 24"><path d="M10 7h13l-4 9H7.5L5 3H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <circle cx="9" cy="20" r="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></circle>
            <circle cx="17" cy="20" r="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></circle></svg>
            </div>
          </div>
          <div class="mobile-bottom-nav-item--text st-text-[12px] st-mt-[4px]">Cart</div>
        </a>
      </li>
    </ul>
  </div>
 </section>
      <section class="hero-section">
        <div class="ypadding st-flex st-py-[32px] st-items-center st-justify-center">
          <div class="wid md:st-max-w-[680px] st-max-w-[370px] st-text-center">
            <div class="textCenter ">
              <h3 class="st-leading-[33px] md:st-text-[22px] st-text-[18px] st-tracking-[3.96px]">ALL COLLECTIONS - ONLINE SAREE SHOPPING</h3>
              <p class="st-inline st-text-[14px] st-leading-[23.1px]">Explore Suta's latest saree collection and discover the diverse weaves of India. Online saree shopping has never been easier with ... </p><span class="st-text-[#FF0000] st-text-[14px]">Read More</span>
            </div>
          </div>
        </div>
      </section>
      <section class="mobile">
        <div class="lg:st-hidden">
          <div  class=" st-w-full st-text-[14px]  md:st-border-t md:st-border-[#e8e8e1]">
            <span  class="st-flex st-justify-center st-text-[14px] md:st-text-[14px] st-text-[#5c5c5c] st-pl-[0] st-pt-[0px] st-my-[10px] st-font-normal  st-flex st-gap-[5px] st-text-capitalize"><span >{{ fetchedRawData?.totalHits }}</span><span class=""> Products</span><span class=""></span>
            </span>
            </div>
          </div>
      </section>
      <section class=" container  searchbar content st-absolute st-sticky st-top-[63px] st-z-[10]">
        <div class=" ">
          <div class="filterbar st-flex st-align-middle st-flex-wrap md:st-gap-[50px] lg:st-justify-between st-mt-[0px] lg:st-mt-[50px] st-shadow-[0_1px_rgb(221,221,221),_0_-1px_rgb(221,221,221)] xl:st-mx-[-64px] md:lg:st-[-64px] st-bg-[#fff]">
            <div class="filtersort  lg:st-hidden st-flex st-tracking-[1.98px] st-grow  st-text-[11px] st-justify-center st-align-middle ">
              <div @click="mobileFilterToggle=true" class="filter st-basis-[50%] st-text-[#1c1c1ccc] st-px-[3px] st-text-center st-py-[13px] st-border-r st-border-[#e8e8e1] st-font-Futura">
                FILTER <span v-if="selectedFilterCount>0">({{ selectedFilterCount }})</span>
              </div>
              <div @click="mobileSortToggle=true" class="sortby st-py-[13px] st-basis-[50%] st-text-[#1c1c1ccc] st-px-[3px] st-border-r st-border-[#e8e8e1] st-text-center">
                SORT BY
              </div>
            </div>
            <div class="sideicons st-px-[20px] st-py-[13px]  st-flex st-gap-[16px] st-leading-[1.5] st-cursor-pointer  ">
              <span class=" lg:st-hidden st-block st-border-[1px] st-border-solid st-border-[#000]" @click="layoutClass='oneByone'" :class="layoutClass==='oneByone'?'st-opacity-100': 'st-opacity-30'">
                <svg role="presentation" width="18" viewBox="0 0 18 18" fill="none"><path fill="currentColor" d="M0 0h18v18H0z"></path></svg>
              </span>
              <span class="lg:st-hidden st-border-[1px] st-border-solid st-border-[#000]" @click="layoutClass='twoBytwo'" :class="layoutClass==='twoBytwo'?'st-opacity-100': 'st-opacity-30'">
                <svg role="presentation" width="18" viewBox="0 0 18 18" fill="none">
                  <path fill="#000000" d="M0 0h8v8H0zM0 10h8v8H0zM10 0h8v8h-8zM10 10h8v8h-8z"></path>
                </svg>
              </span>
              <span class="st-hidden lg:st-block st-border-[1px] st-border-solid st-border-[#000]" @click="layoutClass='threeBythree'" :class="layoutClass==='threeBythree'?'st-opacity-100': 'st-opacity-30'">
                <svg role="presentation" width="18" viewBox="0 0 18 18" fill="none"><path fill="currentColor" d="M0 0h8v8H0zM0 10h8v8H0zM10 0h8v8h-8zM10 10h8v8h-8z"></path></svg>
              </span>
              <span class=" st-hidden lg:st-block st-border-[1px] st-border-solid st-border-[#000]" @click="layoutClass='fourByfour'" :class="layoutClass==='fourByfour'?'st-opacity-100': 'st-opacity-30'">
                <svg role="presentation" width="18" viewBox="0 0 18 18" fill="none">
                  <path fill="currentColor"d="M0 0h4v4H0zM0 7h4v4H0zM0 14h4v4H0zM7 0h4v4H7zM7 7h4v4H7zM7 14h4v4H7zM14 0h4v4h-4zM14 7h4v4h-4zM14 14h4v4h-4z"></path>
                </svg>
                </span>
                <span class=" st-hidden lg:st-block st-border-[1px] st-border-solid st-border-[#000]" @click="layoutClass='sixBysix'" :class="layoutClass==='sixBysix'?'st-opacity-100': 'st-opacity-30'">
                  <svg  role="presentation" width="18" viewBox="0 0 18 18" fill="none"><path data-v-da40671c="" fill="currentColor" d="M0 0h18v2H0zm0 4h18v2H0zm0 4h18v2H0zm0 4h18v2H0zm0 4h18v2H0z"></path></svg>
              </span>
            </div>
            <div class="products st-py-[13px] st-flex   lg:st-block st-hidden"><span class="st-text-[12px] st-gap-[5px] st-flex"><span>Showing</span><span>{{ fetchedRawData?.totalHits }}</span><span>products</span></span>
            </div>

            <div class="sortby st-hidden lg:st-block st-py-[13px] st-border-l st-border-[#e8e8e1] st-group st-relative st-text-[11px] st-flex st-items-center st-gap-[0px] st-align-middle st-justify-center st-text-[#5c5c5c] st-cursor-pointer">
                <span class="st-flex ">
                <p class=" st-px-[36px] st-inline-flex">Sort By</p>
                <div class="st-inline-flex ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#5c5c5c" />
                </svg>
                </div>
    
    <ul id="sortList"  class="st-sorting st-hidden group-active:st-block lg:group-hover:st-block st-absolute st-bg-white st-top-full st-m-[0] st-w-[170px] st-right-0 st-origin-top st-z-[3] st-shadow-[2px_2px_6px_#5c5c5c0d] st-border st-border-solid st-border-[#e7e7e7]">
      <li @click="sortBy='',fetchData(), updateURL()" class="st-block st-py-[10px] st-px-[15px]  st-w-full st-text-[13px] st-font-normal st-text-[#5c5c5c] st-cursor-pointer">Featured</li>
      <li v-for="(item,index) in sortList" :key="item.field" @click="sortBy=item.field,fetchData(),updateURL()" class="st-block st-py-[10px] st-px-[15px] st-w-full st-text-[13px] st-font-normal st-text-[#5c5c5c] st-cursor-pointer">{{ item.label }}</li>
    </ul>
  </span>
            </div>
          
        </div>
      </div>
      </section>
      <section v-if="mobileFilterToggle"  class=" lg:st-hidden filterby-sidebar  st-bg-[#00000080] st-inset-0 st-fixed st-z-[2000]">
        <div @click.self="mobileFilterToggle=false" class="st-top-0 st-w-full st-absolute st-left-0 st-right-0 st-bottom-0   ">
  <div class="mobilesearch hidden-desktop st-z-[500] st-inline-block lg:st-hidden st-fixed st-top-[0] st-w-[75%] st-left-[unset] st-right-[-100%] st-h-full st-bg-white st-opacity-0 st-z-[6] open st-opacity-100 st-right-[0] st-overflow-auto">
    <div class="filterHeader st-w-[inherit] st-bg-white st-flex st-justify-between st-items-center st-p-[16px] st-leading-[20px] st-text-[14px] st-text-[#333333] st-font-semibold st-fixed st-z-[1] st-border st-border-solid st-border-[#e8e9eb] st-uppercase" id="mobileHeader">
      <div class="mobile-filter-title"> Filter by</div>
      <svg @click="mobileFilterToggle=false"  clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="st-cross-btn st-w-[20px] st-fill-[#000000]">
        <path   d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"></path>
      </svg>
    </div>
    <div class="st-sidebar-content st-relative st-top-[55px] st-px-[15px] lg:st-px-[0] st-pb-[100px] lg:st-pb-[0] lg:st-top-[-20px] st-right-0 st-left-0 st-bottom-0">
<div class="Fields">
  <div v-for="item in filters" :key="item.id">
    <div v-if="(item.facets?.length>0 && item.type==='numeric') || (item.facets?.length>0 && item.type==='text') || (item.label==='Availability') " class="st-border-b st-border-solid st-border-[rgb(229,231,235)]" >
      <div   @click="item.isOpen=!item.isOpen" class="st-flex st-text-[#5c5c5c] st-text-[12px]  st-justify-between st-py-[20px] st-cursor-pointer st-tracking-[1px]">
        <h3 class="st-text-[15px] " >{{item.label}}</h3>
        <span class="st-flex st-align-top">
          <p v-if="item.selected.length>0" @click.stop="clearFilter(item.selected),fetchData(),updateURL()">Clear</p>
          <svg :class="{'st-rotate-180':item.isOpen}" xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#000000"></path>
        </svg></span>
      </div>
      <div v-if="item.isOpen" class=" st-transition-all st-duration-300 st-ease-in-out">
        <ul v-if="item.type==='numeric' && item.label==='Price'" class="st-widget-body st-flex st-flex-col st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
          <li v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.min" >
            <div v-if="subItem.count>0" class="outer-checkbox">
              <label class="st-flex  st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                <input class="st-mr-[12px] st-accent-black"  type="checkbox" :checked="isRangeSelected(item.selected, subItem.min, subItem.max)" @change="toggleRange(item.selected, subItem.min, subItem.max), scrollToTop(),fetchData(),updateURL()">
                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                  <div class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                    <span class="money">₹{{ subItem.min }}.00</span>
                    <span> - </span>
                    <span class="money">₹{{ subItem.max }}.00</span> ({{ subItem.count }}) 
                  </div>
                </div>
              </label>
            </div>
          </li>
        </ul>
        <ul v-else-if="item.type==='numeric' && item.label==='Discount'" class="st-widget-body st-flex-col  st-flex st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
          <li v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.min" >
            <div v-if="subItem.count>0" class="outer-checkbox">
              <label class="st-flex st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                <input class="st-mr-[12px] st-accent-black" type="checkbox" :checked="isRangeSelected(item.selected, subItem.min, subItem.max)" @change="toggleRange(item.selected, subItem.min, subItem.max), scrollToTop(),fetchData(),updateURL()">
                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                  <div class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                    <span class="money">{{ subItem.min }}%</span>
                    <span class="money"> And Above</span> ({{ subItem.count }}) 
                  </div>
                </div>
              </label>
            </div>
          </li>
        </ul>
        <ul v-else-if="item.label==='Availability'" class="st-widget-body st-flex st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
      <li>
        <div class="outer-checkbox">
          <label class="st-flex st-m-0 st-mb-[12px]">
            <input class=" st-mr-[12px] st-accent-black" type="checkbox" value="In Stock Only" v-model="item.selected" @change="scrollToTop(),fetchData(),updateURL()" />
            <div
              class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
              <div
                class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                In Stock Only
              </div>
            </div>
          </label>
        </div>
      </li>
    </ul>
        <ul v-else class="st-widget-body st-flex st-flex-col  st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
                          <li  v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.label"  >
                            <div v-if="subItem.value>0" class="outer-checkbox">
                              <label class="st-flex st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                                <input class="st-mr-[12px] st-accent-black" type="checkbox" :value="subItem.label" v-model="item.selected" @change="scrollToTop(),fetchData(),updateURL()">
                                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                                  <div class="st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                                    <span class="money">{{ subItem.label }}</span>({{ subItem.value }}) 
                                  </div>
                                </div>
                              </label>
                            </div>
                          </li>
                        </ul>
      </div>
    </div>
</div>
</div>  
</div>
<div  class="apply-all st-fixed st-m-0 st-left-[unset] st-right-0 st-bottom-0 st-w-[inherit] st-bg-white st-flex st-items-center st-justify-center st-text-center st-border-t-[1px] st-border-solid st-border-[#eaeaec] st-p-[16px] st-gap-[8px]">
  <span @click="clearAllFiler(),fetchData(),updateURL() " class="st-reset-all-mobile st-text-[12px] st-bg-[#2b2b2b] st-max-w-[167px] st-w-[167px] st-p-[10px] st-font-medium st-text-[#ffffff] st-rounded-[0px] st-uppercase">Clear all <span v-if="selectedFilterCount>0">({{ selectedFilterCount }})</span> </span>
  <span @click="mobileFilterToggle=false" class="apply-btn st-text-[12px] st-bg-[#2b2b2b] st-max-w-[167px] st-w-[167px] st-p-[10px] st-font-medium st-text-[#ffffff] st-rounded-[0px] st-uppercase">View Results</span>
</div>
</div>
</div>
      </section>
      <section v-if="mobileSortToggle" @click.self="mobileSortToggle=false" class="sortby-sidebar lg:st-hidden  st-bg-[#00000080] st-fixed st-inset-0 st-z-[1999]">
        <div class=" st-w-full st-absolute  st-left-0 st-right-0 st-bottom-0  " >
          <div  class=" st-bg-white st-overflow-y-auto st-overflow-x-hidden st-p-[20px]   st-text-center ">
  <span @click="mobileSortToggle=false" class="closeFilter st-block st-text-[30px] st-top-[5px] st-text-black st-absolute st-z-[9] st-right-[15px]">×</span>
  <label  class="!st-text-[16.0004px] st-font-normal st-block st-pb-[14px] st-mx-[-20px] st-mb-[20px] st-border-b-[1px] st-border-solid st-border-[#e7e7e7]">Sort by</label>
    <ul class="list st-m-0 st-list-none">
      <li @click="sortBy='',fetchData(),updateURL(),  mobileSortToggle=false" class="st-block st-py-[10px] st-px-[15px]  st-w-full st-text-[13px] st-font-normal st-text-[#5c5c5c] st-cursor-pointer">Featured</li>
      <li v-for="(item,index) in sortList" :key="item.field" @click="sortBy=item.field, fetchData(),updateURL(),  mobileSortToggle=false" class="st-block st-py-[10px] st-px-[15px] st-w-full st-text-[13px] st-font-normal st-text-[#5c5c5c] st-cursor-pointer">{{ item.label }}</li>
    </ul>
</div>
        </div>
      </section>
      <section class="maincontainer lg:st-my-[50px] md:st-my-[0px]  st-my-[0px]">
        <div class="collection container md:st-grid lg:st-grid-cols-[25%_1fr] md:st-gap-[30px]">
            <div class="sidebar st-hidden lg:st-block st-sticky st-overflow-y-auto st-top-[200px] st-max-h-[402px] ">  
    <div class="Fields">
  <div v-for="item in filters" :key="item.id">
    <div v-if="(item.facets?.length>0 && item.type==='numeric') || (item.facets?.length>0 && item.type==='text') || (item.label==='Availability') " class="st-border-b st-border-solid st-border-[rgb(229,231,235)]" >
      <div   @click="item.isOpen=!item.isOpen" class="st-flex st-text-[#5c5c5c] st-text-[12px]  st-justify-between st-py-[20px] st-cursor-pointer st-tracking-[1px]">
        <h3 class="st-text-[15px] " >{{item.label}}</h3>
        <span class="st-flex st-align-top">
          <p v-if="item.selected.length>0" @click.stop="clearFilter(item.selected),fetchData(),updateURL()">Clear</p>
          <svg :class="{'st-rotate-180':item.isOpen}" xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#000000"></path>
        </svg></span>
      </div>
      <div v-if="item.isOpen" class=" st-transition-all st-duration-300 st-ease-in-out">
        <ul v-if="item.type==='numeric' && item.label==='Price'" class="st-widget-body st-flex st-flex-col st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
          <li v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.min" >
            <div v-if="subItem.count>0" class="outer-checkbox">
              <label class="st-flex  st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                <input class="st-mr-[12px] st-accent-black"  type="checkbox" :checked="isRangeSelected(item.selected, subItem.min, subItem.max)" @change="toggleRange(item.selected, subItem.min, subItem.max), scrollToTop(),fetchData(),updateURL()">
                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                  <div class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                    <span class="money">₹{{ subItem.min }}.00</span>
                    <span> - </span>
                    <span class="money">₹{{ subItem.max }}.00</span> ({{ subItem.count }}) 
                  </div>
                </div>
              </label>
            </div>
          </li>
        </ul>
        <ul v-else-if="item.type==='numeric' && item.label==='Discount'" class="st-widget-body st-flex-col  st-flex st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
          <li v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.min" >
            <div v-if="subItem.count>0" class="outer-checkbox">
              <label class="st-flex st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                <input class="st-mr-[12px] st-accent-black" type="checkbox" :checked="isRangeSelected(item.selected, subItem.min, subItem.max)" @change="toggleRange(item.selected, subItem.min, subItem.max), scrollToTop(),fetchData(),updateURL()">
                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                  <div class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                    <span class="money">{{ subItem.min }}%</span>
                    <span class="money"> And Above</span> ({{ subItem.count }}) 
                  </div>
                </div>
              </label>
            </div>
          </li>
        </ul>
        <ul v-else-if="item.label==='Availability'" class="st-widget-body st-flex st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
      <li>
        <div class="outer-checkbox">
          <label class="st-flex st-m-0 st-mb-[12px]">
            <input class=" st-mr-[12px] st-accent-black" type="checkbox" value="In Stock Only" v-model="item.selected" @change="scrollToTop(),fetchData(),updateURL()" />
            <div
              class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
              <div
                class="filter-label st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                In Stock Only
              </div>
            </div>
          </label>
        </div>
      </li>
    </ul>
        <ul v-else class="st-widget-body st-flex st-flex-col  st-flex-wrap st-gap-[10px] st-mb-[20px] st-list-none st-filter-items st-ml-[0px]">
                          <li  v-for="(subItem,index) in getSortedSubItems(item)" :key="subItem.label"  >
                            <div v-if="subItem.value>0" class="outer-checkbox">
                              <label class="st-flex st-m-0 st-text-[13px] st-text-[#5c5c5c] st-leading-[19.5px] st-opacity-70">
                                <input class="st-mr-[12px] st-accent-black" type="checkbox" :value="subItem.label" v-model="item.selected" @change="scrollToTop(),fetchData(),updateURL()">
                                <div class="st-filter-label-container st-flex st-items-center st-justify-between st-w-full">
                                  <div class="st-text-[13px] st-text-[#5c5c5c] st-font-normal st-capitalize">
                                    <span class="money">{{ subItem.label }}</span>({{ subItem.value }}) 
                                  </div>
                                </div>
                              </label>
                            </div>
                          </li>
                        </ul>
      </div>
    </div>
</div>
</div> 
              </div>            
              <div class="contentarea st-overflow-hidden st-w-full">
                <div class=" st-hidden lg:st-block st-flex st-w-full st-px-[10px] lg:st-px-[0] lg:st-pr-[0px] st-mb-[20px] lg:st-mb-[10px] lg:st-mt-[25px]">
<div class="filter-tag-column st-width st-w-full">
  <div class="st-filter-tags st-flex  st-gap-[20px] st-w-full st-justify-between">
    
    <div class="st-filter-inner st-flex st-gap-[10px] st-flex-wrap st-pl-[0px]">
      <template v-for="(fields, index) in filters" :key="index">
        <div v-for="(items, subIndex) in fields.selected" :key="fields.label + subIndex" class="tag-item st-flex st-cursor-pointer st-gap-[5px] st-border st-border-solid st-border-[#525252] st-rounded-[3px] st-text-[#525252] st-py-[5px] st-px-[10px] st-capitalize">
          
          <div v-if="fields.type==='numeric' && fields.label==='Price'" class="tag-content">
            <span>₹{{ items[0] }}.00</span> - <span>₹{{ items[1] }}.00</span>
          </div>
          
          <div v-else-if="fields.type==='numeric' && fields.label==='Discount'" class="tag-content">
            <span>{{ items[0] }}%</span> And <span>Above</span>
          </div>
          
          <div v-else class="tag-content">
            <span>{{ items }}</span>
          </div>
          
          <div @click="removeFilter(fields.selected, items),fetchData(),updateURL()" class="tag-close st-text-[#ff0000]">✕</div>
        </div>
      </template>
    </div>
    <div v-if="filters.some(f => f.selected.length > 0)" class="tag-item st-shrink-0 ">
      <div @click="clearAllFiler(),fetchData(),updateURL()" class="tag-content st-text-[14px] st-bg-[#323232] st-py-[5px] st-px-[10px] st-text-[#ffffff] st-rounded-[0px] st-cursor-pointer">
        Reset All
      </div>
    </div>
  </div>
</div>
</div>
                <div class="productlist st-flex st-flex-wrap md:st-mx-[-15px] st-mx-[2.5px] " >
                  <card v-for="(value,index) in products" :key="index" :class="[layoutClass || layoutRatio ]"  class=" md:st-px-[15px] md:st-mx-[0px]  st-relative st-mt-0 st-mb-[8px] md:st-mb-[0px]"  :user-data="value" :ratio="layoutClass"/>
                  </div>
                <div class="button st-flex st-justify-center st-align-middle">
  <div class="button  st-w-fit st-cursor-pointer st-my-[40px] md:st-my-[0px]">
    <a class="">
      <div v-if="!isLoading && !((fetchedRawData?.totalHits - 32 - (pageNumber * 32)) < 32)" @click="pageNumber++ ,fetchData()" class="st-border st-border-black st-py-[5px] st-px-[10px] st-tracking-[1.2px] st-text-[13px] st-text-black st-font-[700]">
        LOAD MORE 
      </div>
      <div v-if="!isLoading && ((fetchedRawData?.totalHits - 32 - (pageNumber * 32)) < 32)"  class=" st-py-[5px] st-px-[10px] st-tracking-[1.2px] st-text-[13px] st-text-[#fff] st-bg-[#F48A77] st-font-[400] st-border-none">
        RESULTS END HERE 
      </div>
      <div v-if="isLoading"  class="st-py-[5px] st-px-[10px] st-tracking-[1.2px] st-border st-border-black st-text-[13px] st-text-black st-font-[700]">
        LOADING... 
      </div>
    </a>
  </div>
</div>
              </div>
        </div>
        <div class="" >
          <div class="st-fixed lg:st-bottom-[20px] lg:st-right-[20px] st-bottom-[70px] st-right-[20px] st-z-50 st-flex st-gap-[5px]" >
    <div class="Up Button" v-show="showUp" @click="move('up')">
      <svg class="st-cursor-pointer" width="38" viewBox="-2.4 -2.4 28.80 28.80" fill="#000000ab" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
      <g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#000000ab" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 20L12 4M12 4L18 10M12 4L6 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g>
    </svg>
    </div>
    <div class="Down Button " v-show="showDown" @click="move('down')">
      <svg class="st-rotate-180 st-cursor-pointer" width="38" viewBox="-2.4 -2.4 28.80 28.80" fill="#000000ab" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
      <g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#000000ab" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 20L12 4M12 4L18 10M12 4L6 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g>
    </svg>
    </div>
  </div>
        </div>
      </section>
</template>

<style scoped>
  @import "./assets/main.css";
</style>

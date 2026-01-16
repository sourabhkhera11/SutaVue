<script lang="ts">
   import {defineComponent} from "vue";
   import SearchClient from "@gaspl/search-client";
   import card from "./card.vue";
   const appId = "26u1hqhy378jlrgxwpaug571";
   const readToken = "SVXPVV89J7GCA4D8DMP7S4N4";
   const collectionId = "KSNQ58MRXELY5JCX767TDSA1";
   const autoSuggestionCollId="X7PKBZVRIHHER13JKQTANV9Y";
   export default defineComponent({
      components:{
         card
      },
      props: {
        modelValue: {
        type: Boolean,
        required: true
        }
    },
    emits: ['update:modelValue'],
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
        autosuggestionRawData:{} as Record<string,any>,
        autosuggestionResult:{} as Record<string,any>,
        popularChoice:"AND showInSuggestion = 1" as string,
        popularChoiceToggle:true as boolean,
        isRestoring:false as boolean,
        pageSize:32 as number,
        autoSuggestedProducts:{} as Record<string,any>,
      };
    },
      methods:{
      async fetchData(whichType='collection'):Promise<void>{
        this.isLoading=true;
         const searchClient = new SearchClient(appId, readToken);
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
                  searchClient.numericFacetFilters(ele.field,range.split('-')[0],range.split('-')[1]);
                })
              }
            }
          })
          if(whichType==='search'){
            this.autoSuggestedProducts = await searchClient.search(`${this.searchQuery}`,collectionId);
          this.autocompleteSearchResults=this.autoSuggestedProducts.results.slice(0,6);

          }
          else{
            this.fetchedRawData = await searchClient.search(``,collectionId);
          }
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
        }
      },
      async fetchAutoResults():Promise<void>{
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
          "discounted_price>0",
          "discount>=0",
          "isActive=1"
        ];
        if(this.searchQuery===''){
          baseCondition.push("collection_handles_shopify=\'bestseller-sarees\'");
        }
        return baseCondition.join(" AND ");
      },
      sortOptionArray(){
        const sortFields=["-isActive"];
        if(this.sortBy){
          sortFields.push(this.sortBy);
        }
        if(this.searchQuery===''){
            sortFields.push('bestseller_sarees_position');
        }
        return sortFields;
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
checkSearchQuery(){
  if(this.searchQuery!=""){
    this.popularChoiceToggle=false;
    this.popularChoice="";
  }
  else{
    this.popularChoiceToggle=true;
    this.popularChoice="AND showInSuggestion = 1";
  }
},
fillSuggestion(element:string){
  this.searchQuery=element;
  this.fetchData('search');
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
        const rangeString=filter.selected.map(range=>`${range}`).join(',');
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
          return rangeStr;
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
onSearch(){
  this.updateURL();
  this.checkSearchQuery();
  this.fetchAutoResults();
},

    },
    computed: {
    autocompleteSearchToggle: {
      get():boolean {
        return this.modelValue;
      },
      set(value:boolean) {
        this.$emit('update:modelValue', value);
      }
    }
  },
mounted(){
        this.restoreState();
      this.fetchAutoResults();
      this.fetchData('search');
      window.addEventListener('popstate', this.restoreState);
    },
    beforeUnmount(){
      window.removeEventListener('popstate', this.restoreState);
    },
    })
</script>

<template>
    <section @click.self="autocompleteSearchToggle=false" v-if="autocompleteSearchToggle" class="searchSpace st-absolute st-top-0 md:st-top-auto st-bg-[#fff] md:st-bg-transparent md:st-fixed st-z-[3000] st-h-full st-w-full">
    <div   class=" st-px-[5px] st-pt-[12px] st-min-h-[35px]" style="display: block;">
   <div class=" st-flex  st-align-middle st-bg-[#ffffff8d] st-h-[39px] st-relative st-px-[20px] st-border-[2px] st-border-solid st-border-[#e19906] st-rounded-[5px]" id="search-desktop">
      <span class=" st-icon-search st-translate-y-[7px]">
         <svg data-icon="search" viewBox="0 0 512 512" width="14px" height="20px">
            <path d="M495,466.2L377.2,348.4c29.2-35.6,46.8-81.2,46.8-130.9C424,103.5,331.5,11,217.5,11C103.4,11,11,103.5,11,217.5   S103.4,424,217.5,424c49.7,0,95.2-17.5,130.8-46.7L466.1,495c8,8,20.9,8,28.9,0C503,487.1,503,474.1,495,466.2z M217.5,382.9   C126.2,382.9,52,308.7,52,217.5S126.2,52,217.5,52C308.7,52,383,126.3,383,217.5S308.7,382.9,217.5,382.9z"></path>
         </svg>
      </span>
      <input @input="fetchData('search'),onSearch()" @keyup.enter="autocompleteSearchToggle=false" v-model="searchQuery"  class="st-basis-[95%] st-pl-[30px]  st-font-[18px] st-border-none st-h-[35px] st-outline-none st-focus:outline-none st-focus:ring-0" type="text" name="st" placeholder="Search for Sarees" value="" autocapitalize="off" autocomplete="off" autocorrect="off">
      <span v-show="searchQuery" @click="searchQuery='', fetchData('search'),updateURL(),onSearch()" class=" input-close-btn st-translate-y-[5px] st-pr-[10px] st-text-[14px] st-cursor-pointer" style="display: block;">Clear</span>
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
  <section v-if="popularChoiceToggle" class="st-col-lg-3 st-col-md-3 st-left-col md:st-w-[25%]  st-trending-search st-p-[10px] lg:st-pl-[40px] st-bg-[#f6f7f7]  st-mb-[10px] lg:st-mb-[0]" style="">
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
      <div @click="autocompleteSearchToggle=false" class="st-goto-search st-text-center" style=""><span class="st-box-btn st-text-[14px] st-normal-case st-font-bold st-text-[#343434] st-cursor-pointer"> View all (<span>{{autoSuggestedProducts.totalHits}}</span>) product<span style="">s</span></span></div>
   </div>
    </div>
</section>
</template>


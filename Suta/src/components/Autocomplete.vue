<!--DONE: Implement the similar feedback from app.vue here as well -->

<!--DONE Create two functions here, to manage key input from a input bar outside the vue context 
comments mane likhe h AI nhi h taki apko specific pta ho ... hehe 
1)handleSeachInput : Listen the custom event and give value to searchwery
2)in watcher: Dispatch a custom event so that URL search value is in sync with search input value there -->
<script lang="ts">
  import {defineComponent} from "vue";
  import SearchClient from "@gaspl/search-client";
  import card from "./card.vue";
  //  DONE: create a file named config.json and import these from there
  import {appId,readToken,collectionId,autoSuggestionCollId} from "../assets/config.json";
  const searchClient = new SearchClient(appId, readToken);

   export default defineComponent({
      components:{
         card
      },
    // Good
      data(){
      return{
        // DONE: remove this -> fetchRawData
        products:{} as Record<string,any>,
        totalHits:0 as number,
        searchQuery:"" as string,
        productSuggestions:{} as Record<string,any>,
        isRestoring:false as boolean,
        displayProducts:6 as number,
        autocompleteSearchToggle:true as boolean,
      };
    },
      methods:{
        // DONE: see if these can be done inside a single function
      async fetchData():Promise<void>{
        //DONE: Declare this globally
        const baseCondition="isSearchable = 1 AND price>0 AND discount>=0 AND collection_handles_shopify=\'saree\'";
        try{
          searchClient
          .fields("id","product_type","collections" ,"discount", "discounted_price", "images", "price", "size","title","isActive","reviews_average","reviews_count","st_size","created_at","_rank")
          .count(this.displayProducts)
          if(this.searchQuery===''){
            searchClient
            .filter(baseCondition+" AND collection_handles_shopify=\'bestseller-sarees\'")
            .sort("-isActive",'bestseller_sarees_position');
          }
          else{
            searchClient
            .filter(baseCondition)
            .sort("-isActive");
          }
        this.products = await searchClient.search(`${this.searchQuery}`,collectionId);
        this.totalHits=this.products.totalHits;

        searchClient
          .fields("id","displayLabel")
          .count(this.displayProducts);
          (this.searchQuery==='')?searchClient.filter("isSearchable = 1  AND showInSuggestion = 1"):searchClient.filter("isSearchable = 1");
        this.productSuggestions = await searchClient.search(`${this.searchQuery}`,autoSuggestionCollId);
        }
        catch(er){
          console.log(er);
        }
      },
      handleSeachInput(event:any){
        this.searchQuery=event.detail;
        this.updateURL();
      },
fillSuggestion(element:string){
  this.searchQuery=element;
  this.updateURL();
},
clearSearch() {
  this.searchQuery = '';
  this.updateURL(); 
},
updateURL(){
  const params=new URLSearchParams();
  if(this.searchQuery){
    params.set('q',this.searchQuery);
  }
  const newUrl=`${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({},'',newUrl);
  this.fetchData();
},
restoreState() {
  this.isRestoring = true;
  const params = new URLSearchParams(window.location.search);
  const q=params.get('q');
  if(q){
    this.searchQuery=q;
  }
  else{
    this.searchQuery='';
  }
  this.fetchData();
  this.$nextTick(() => {
    this.isRestoring = false;
  });
  },
    },
    watch:{
      searchQuery(newValue :string){
         window.dispatchEvent(new CustomEvent('vueSearchUpdate', { 
          detail: this.searchQuery 
        }));
      },
    },
mounted(){
    this.restoreState();
    window.addEventListener('searchUpdate',this.handleSeachInput);
    window.addEventListener('popstate', this.restoreState);
    },
beforeUnmount(){
    window.removeEventListener('searchUpdate',this.handleSeachInput);
    window.removeEventListener('popstate', this.restoreState);
    },
})
</script>

<template>
    <section v-if="(products?.results)?.length===0" class="lg:st-flex st-flex-col st-w-full st-text-center st-bg-[#fff]">
  <p class="st-font-[600] st-my-[10px]">No Results found for '{{searchQuery}}'</p>
  <p class="st-mb-[10px]">Try Searching some other keywords</p>
    </section>
    <div v-else class="st-row st-flex-wrap st-flex st-flex-col md:st-flex-row ">
  <section v-if="searchQuery===''" class="st-col-lg-3 st-col-md-3 st-left-col md:st-w-[25%]  st-trending-search st-p-[10px] lg:st-pl-[40px] st-bg-[#f6f7f7]  st-mb-[10px] lg:st-mb-[0]" style="">
   <div id="st-before-search">
      <div class="st-trending-header st-mb-[10px]"><span class="st-heading-text st-text-[13px] st-uppercase st-pb-[10px] st-text-[#323232] st-font-semibold">Popular Choices</span></div>
      <div>
         <ul class="sm:st-gap-[10] st-trending-list st-inline-flex st-flex-wrap md:st-flex-row st-gap-2.5 st-m-0 st-p-0 st-w-full st-flex-col">
            <li v-for="ele in productSuggestions?.results" :key="ele.displayLabel" class="st-text-center st-bg-[#dddddd] st-shadow-[0_0_0_1px_rgba(0,0,0,.02)] st-w-[48%] sm:hover:st-bg-[#ffffff] sm:hover:st-shadow-[0_0_0_1px_rgba(0,0,0,.02)] st-py-[5px] !st-px-[10px] sm:st-py-[7px] !sm:st-px-[10px]  st-rounded-[4px] st-trending-label st-text-[12px] st-uppercase st-font-normal st-m-0.5 st-inline-block"><span>
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
            <li v-for="ele in productSuggestions?.results" :key="ele.displayLabel" class="sm:st-py-[0px] st-py-[0] st-px-[0] sm:st-px-[0] st-trending-label st-text-[12px] st-uppercase st-font-medium st-m-0.5 st-inline-block"><span>
              <span @click="fillSuggestion(ele.displayLabel)" class="st-label-text st-whitespace-normal st-text-[#000000] st-cursor-pointer">{{ ele.displayLabel }}</span>
            </span></li>
         </ul>
      </div>
      <div class="no-trending-search-text" style="display: none;"><span  class="st-text-[12px] st-text-[#604a4a]">No Search Suggestions</span></div>
   </div>
   <div class="sidebar st-col-lg-9 st-col-md-9 st-right-col md:st-w-[75%]  st-p-[10px] lg:st-pr-[40px] st-bg-[#fff]">
      <div class="st-trending-header st-mb-[10px]">
        <span class="st-heading-text st-text-[13px] st-uppercase st-pb-[10px] st-text-[#323232] st-font-semibold st-pl-[30px]">Search Results</span></div>
      <div class="st-row st-cols-2 st-cols-sm-2 st-cols-md-4 st-product-wrapper st-flex st-flex-nowrap st-overflow-y-auto">
         <div v-for="(value,index) in products.results" :key="index" class="st-product-wrap st-w-1/2 sm:st-px-[15px] st-px-[2.5px] lg:st-w-1/4 st-shrink-0" >
            <card  :key="value"  :user-data="value" />
         </div>
      </div>
   </div>
    </div>
    <div v-if="products?.results?.length>0" class="st-row st-flex st-m-[0] ">
   <div class="st-left-col st-w-[25%] st-p-[10px] st-bg-[#f6f7f7] !st-block"></div>
   <div class="st-right-col st-right-col st-w-[75%] st-p-[10px] st-bg-[#f6f7f7]">
      <div  class="st-goto-search st-text-center" style=""><span class="st-box-btn st-text-[14px] st-normal-case st-font-bold st-text-[#343434] st-cursor-pointer"> View all (<span>{{totalHits}}</span>) product<span style="">s</span></span></div>
   </div>
    </div>
</template>


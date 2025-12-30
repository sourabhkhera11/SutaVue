<script  lang="ts">
  import card from './components/card.vue';
  import { defineComponent } from 'vue';
  import SearchClient from "@gaspl/search-client";
  export default defineComponent({
    components:{
      card
    },
    data(){
      return{
        data: {} as object,
        result:{} as object,
      };
    },
    methods:{
      async fetchData(){
        var searchClient = new SearchClient("i23b7q1j4icuv9wzze35u44s", "JFH1L4JRGKLVFTQY4FQPXIFV");
        searchClient.fields("discounted_price","fit","gender","image","isActive","isBestSeller","isSearchable","price","title","vendor","product_type","size","color","style").count(32);
        this.data=await searchClient.search("shirt","QPI32C64SIDELBV7BSK5H5LD");
        console.log(this.data.results);
        this.result=this.data.results;
        for (const element of this.result) {
          console.log(element.title+" "+element.product_type+" "+element.price+" "+element.image.scr+" "+element.gender+" "+element.fit+" "+element.discounted_price+" "+element.style+" "+element.vendor);
        }
      }
    },
    mounted(){
      this.fetchData();
    }
  })
</script>

<template>
       <card v-for="(value,index) in result" :key="index" :user-data="value"/>       
</template>

<style scoped>
</style>

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
        sortBy:"" as String,
      };
    },
    methods:{
      async fetchData(){
        var searchClient = new SearchClient("26u1hqhy378jlrgxwpaug571", "SVXPVV89J7GCA4D8DMP7S4N4");
        searchClient.fields("id","product_type" ,"discount", "discounted_price", "images", "price", "size","title","isActive","reviews_average","reviews_count","st_size","created_at").count(32).filter("(discount>0 OR discount=0) AND isActive=1 AND price>0").sort(`${this.sortBy}`);
        this.data=await searchClient.search("saree","KSNQ58MRXELY5JCX767TDSA1");
        console.log(this.data.results);
        this.result=this.data.results;
        for (const element of this.result) {
          console.log(element.title.split(" ").slice(0,2).join(" ")+" "+element.product_type+" "+element.price+" "+element.discounted_price+" "+element.discount+" "+element.images[0].src+" "+element.reviews_average+" "+element.reviews_count+" "+element.created_at+" "+element.isActive);
        }
      },
      sortByWho(){
      const list=document.getElementById('sortList');
      let val;
      list?.addEventListener('click',(e)=>{
        val=e.target?.id;
        console.log(val);
        switch (val) {
            case "priceLtoH":
              this.sortBy='discounted_price';
              break;
            case "priceHtoL":
              this.sortBy='-discounted_price';
              break;
            case "discountHtoL":
              this.sortBy='-discount';
              break;
            case "dateOtoN":
              this.sortBy="created_at";
              break;
            case "dateNtoO":
              this.sortBy="-created_at";
              break;
            default:
              break;
          }
          console.log(this.sortBy);
          this.fetchData();
      })

    }
    },
    mounted(){
      this.fetchData();
      this.sortByWho();
    }
  })
</script>

<template>
       <card v-for="(value,index) in result" :key="index" :user-data="value"/>       
</template>

<style scoped>
</style>

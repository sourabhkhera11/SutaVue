<template>
  <div class="product st-relative lg:st-p-[10px] st-mt-0 st-px-[2px] st-mb-[8px] lg:st-px-[2.5px] lg:st-mb-[17.5px] md:st-mb-[32px] lg:st-basis-[25%] st-basis-[50%]">
    <div class="productcard-img st-relative st-group">
      
      <div class="badge st-z-[1] st-absolute st-top-0 ">
        <span v-if="userData.created_at > '1764527400'"  class="st-bg-[#000] st-text-[#fff] st-text-[11px] st-py-[1.6px] st-px-[8px]  st-tracking-[1.98px] st-flex">
          NEW
        </span>
        <span v-if="userData.discount > 0"  class="st-bg-[#d70302cc] st-text-[#fff] st-text-[11px] st-py-[1.6px] st-px-[8px]  st-tracking-[1.98px] st-flex">
          {{ userData.discount }}% OFF
        </span>
      </div>

      <div class="heartButton st-absolute st-right-0 st-z-[2] st-flex st-bg-[#cdc4c4] st-border-[1px] st-border-white st-rounded-[15px] st-items-center st-justify-center st-pt-[6px] st-pr-[5px] st-pl-[4px] st-pb-[4px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="20px" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <a href="/products/jungle-rani" class="product-card__media st-relative st-block">
        <img v-if="userData.images[0]" class="st-cursor-pointer st-block st-w-full" :src="userData.images[0].src" alt="Jungle Rani">
        <img v-else class="st-cursor-pointer st-block st-w-full st-h-full" src="https://media.istockphoto.com/id/1500807425/vector/image-not-found-icon-vector-design.jpg?s=612x612&w=0&k=20&c=SF3EoL0zSi3XUwFzduMo3xdJFEk8V5IUsGqRocgPEtU=" alt="">
        <img v-if="userData.images[1]" class="st-absolute st-inset-0 st-opacity-0 group-hover:st-opacity-100 st-transition-opacity st-duration-300 st-w-full" :src="userData.images[1].src" alt="2nd image">
      </a>
      <div v-if="userData.reviews_count" class=" st-flex st-absolute st-bottom-[3px] st-bg-[#fff] st-left-[3px] st-rounded-[7px] st-py-[1px] st-px-[4px] st-text-[12px]"><p>{{ userData.reviews_average }}</p>
        <svg aria-hidden="true" focusable="false" width="13" class="icon icon-star-rating" viewBox="0 0 12 11"><path d="M6 0v8.635L2.292 11 3.48 6.87 0 4.202l4.443-.187L6 0Zm0 0v8.635L9.708 11 8.52 6.87 12 4.202l-4.443-.187L6 0Z" fill="#ffb400"></path></svg>
        <div>({{ userData.reviews_count }})</div></div>
    </div>

    <div class="productcardInfo st-py-[4px] st-px-[6px] st-border-[1px] st-border-black/13 st-rounded-bl-[5px] st-rounded-br-[5px] st-border-t-0 st-shadow-[1px_1px_3px_#00000021]">
      <div class="stackcontent st-grid st-grid-rows-3 st-gap-y-[5px]">
        
        <a href="" class="st-text-[14px] st-truncate st-block">{{ userData.title.split("(")[0].trim()}}</a>
        
        <div class="st-w-fit st-h-fit">
          <div class="typecard st-text-[12px] st-tracking-[0.7px] st-px-[8px] st-w-fit st-h-fit st-border-[1px] st-border-[#8c8686]">
            {{ userData.product_type }}
          </div>
          <!-- <div class="fabriccard st-text-[12px] st-tracking-[0.7px] st-px-[8px] st-w-fit st-h-fit st-border-[1px] st-border-[#8c8686]">
            {{ userData.fit }}
          </div>
          <div class="fabriccard st-text-[12px] st-tracking-[0.7px] st-px-[8px] st-w-fit st-h-fit st-border-[1px] st-border-[#8c8686]">
            {{ userData.style }}
          </div>
          <div class="fabriccard st-text-[12px] st-tracking-[0.7px] st-px-[8px] st-w-fit st-h-fit st-border-[1px] st-border-[#8c8686]">
            {{ userData.vendor }}
          </div> -->
        </div>

        <div class="prices st-flex st-gap-[15px] st-w-fit st-h-fit">
            <div class="pricetag st-text-[13px] st-w-fit st-h-fit">
              ₹{{ userData.discounted_price }}.00
            </div>
          <div v-if="userData.discount>0" class="st-w-fit st-h-fit pricetag st-text-[11.2px] st-line-through st-text-red-600">
            ₹{{ userData.price }}.00
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    userData: {
      type: Object,
      required: true
    }
  }
})
</script>

<style scoped>
/* Scoped styles if needed */
</style>
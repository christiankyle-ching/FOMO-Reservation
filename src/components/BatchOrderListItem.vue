<template>
  <h4 class="mb-2">
    {{ batch.name }}
  </h4>
  <div class="grid grid-cols-1 sm:grid-cols-2 text-sm">
    <span class="font-medium">Closed Reservation At:</span>
    <span class="mb-2 sm:mb-0 sm:text-right">{{ batch.closedAtString }}</span>

    <span class="font-medium">Started Processing At:</span>
    <span class="mb-2 sm:mb-0 sm:text-right">{{ batch.lockedAtString }}</span>

    <span class="font-medium">Total Order Item/s:</span>
    <span class="mb-2 sm:mb-0 sm:text-right"
      >{{ batch.totalQty.toLocaleString() }} item/s</span
    >

    <span class="font-medium">Total Orders Amount:</span>
    <span class="mb-2 sm:mb-0 sm:text-right">{{ batch.totalPriceString }}</span>
  </div>
</template>

<script>
export default {
  props: ["batch"],
};
</script>

<style>
</style>
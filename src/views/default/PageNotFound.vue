<template>
  <div class="container mx-auto p-5 sm:pb-10">
    <div class="pt-32 text-center">
      <h1 class="mb-1">404</h1>
      <h3 class="mb-5">Page Not Found</h3>
      <p>
        That page cannot be found on the server. Go back to
        <router-link
          :to="{
            name: 'Home',
          }"
          class="link"
          >home</router-link
        >.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageNotFound",
};
</script>

<style>
</style>
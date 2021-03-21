<template>
  <div class="sidebar" :class="{ active: active }">
    <transition name="fade">
      <div
        class="sidebar__backdrop"
        v-show="active"
        @click="$emit('close')"
      ></div>
    </transition>

    <transition name="slide">
      <div class="sidebar__content" v-show="active">
        <div class="p-10"><slot name="header"></slot></div>
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: { active: Boolean },
  emits: ["close"],
};
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  @apply transition-transform;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
  @apply transition-transform;
}
</style>
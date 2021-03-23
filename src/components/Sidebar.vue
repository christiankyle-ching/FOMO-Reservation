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
        <div class="p-10" @click="$emit('close')">
          <slot name="header"></slot>
        </div>
        <div @click="$emit('close')">
          <slot name="content"></slot>
        </div>
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
</style>
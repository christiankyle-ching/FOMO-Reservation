<template>
  <div class="reserve px-5">
    <!-- a: Reservation Open -->
    <div v-if="openBatch && !reservationExists">
      <div class="my-20">
        <div class="text-center">
          <h2>{{ openBatch.name }}</h2>
          Reservation is now <span class="text-success">open</span> for the next
          batch!
        </div>

        <!-- If Phone Number Set -->
        <div v-if="userProfile?.phoneNumber">
          <button
            @click="reserve()"
            class="button button-block button-primary mt-3"
          >
            <span class="fas fa-utensils"></span>
            Reserve
          </button>
        </div>

        <!-- Else: Number is required -->
        <div v-else class="my-5">
          <h5 class="text-center text-danger">
            Phone Number is required to make a reservation.
          </h5>
        </div>
      </div>

      <div class="card" v-if="userProfile != null">
        <h4 class="mb-3">Edit Profile, {{ user.displayName }}</h4>
        <ProfileForm />
      </div>
    </div>

    <!-- b: Reserved Already -->
    <div v-else-if="reservationExists">
      <h3 class="text-center">
        Reservation request already sent! Please wait for confirmation if you
        are lucky to get into the limit.
      </h3>
    </div>

    <!-- No Open Batches, Wait for future batches -->
    <div v-else-if="!openBatch && !orderDone && !orderAllowed">
      <h2 class="text-center">Stay tuned for the next batch!</h2>
    </div>
  </div>
</template>

<script>
import ProfileForm from "@/components/ProfileForm.vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "Reserve",
  components: { ProfileForm },
  methods: {
    ...mapActions({
      reserve: "reserve",
    }),
  },
  computed: {
    ...mapState({
      user: "user",
      openBatch: "openBatch",
      orderDone: "orderDone",
      orderAllowed: "orderAllowed",
      reservationExists: "reservationExists",
      userProfile: "userProfile",
    }),
  },
};
</script>

<style>
</style>
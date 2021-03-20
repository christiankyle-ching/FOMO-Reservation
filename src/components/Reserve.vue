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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: flag-sm -->
              <path
                fill-rule="evenodd"
                d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                clip-rule="evenodd"
              />
            </svg>
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
        <h4 class="mb-3">Edit Your Profile, {{ user.displayName }}</h4>
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
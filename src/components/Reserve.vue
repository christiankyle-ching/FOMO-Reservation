<template>
  <div class="reserve px-5">
    <!-- a: Reservation Open -->
    <div v-if="allowReservation">
      <div class="my-20">
        <div class="text-center">
          <h2>{{ openBatch.name }}</h2>
          Reservation is now <span class="text-success">open</span> for the next
          batch!
        </div>

        <!-- Profile Set: Allowed to Reserve -->
        <div v-if="user.phoneNumber">
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
          <h5 class="text-center">
            Please complete your
            <router-link :to="{ name: 'UserProfile' }" class="link"
              >profile</router-link
            >
            first.
          </h5>
        </div>
      </div>
    </div>

    <!-- b: Reserved Already -->
    <div v-else-if="reservation" class="text-center">
      <h3>
        Reservation request already sent! Please wait for confirmation if you
        are lucky to get into the limit.
      </h3>
      <p class="mt-5">Reservation Date & Time: {{ reservationDateTime }}</p>
    </div>

    <!-- No Open Batches, Wait for future batches -->
    <div v-else>
      <h2 class="text-center">Stay tuned for the next batch!</h2>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { BATCH_STATUS } from "@/models/Batch";
import { localeDateTimeOpts } from "@/utils";

export default {
  name: "Reserve",

  methods: {
    ...mapActions({
      reserve: "reserve",
    }),
  },
  computed: {
    ...mapState([
      "user",
      "status",
      "openBatch",
      "orderDone",
      "orderAllowed",
      "reservation",
    ]),
    ...mapState({
      allowReservation(state) {
        return (
          state.openBatch &&
          !state.reservation &&
          !!state.status &&
          state.status?.batch === BATCH_STATUS.OPEN
        );
      },
      reservationDateTime(state) {
        return state.reservation.datetime
          ?.toDate()
          .toLocaleString("en-US", localeDateTimeOpts);
      },
    }),
  },
};
</script>

<style>
</style>
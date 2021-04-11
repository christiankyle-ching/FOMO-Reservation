<template>
  <transition name="fade">
    <FullScreenLoading v-show="isLoading" />
  </transition>

  <div class="app-container">
    <div class="app-container__header">
      <h1>Manage Admins</h1>
    </div>

    <div v-if="!!admins">
      <!-- Add Admin Form -->
      <form @submit.prevent="addAdmin(newAdminEmail)" class="card mb-10">
        <h4 class="pb-1">Add an Admin</h4>
        <input
          type="email"
          v-model="newAdminEmail"
          placeholder="Enter the email of user to add..."
        />

        <div class="text-right mt-3">
          <button
            type="submit"
            class="button button-primary"
            :disabled="!newAdminEmail"
          >
            Add as Admin
          </button>
        </div>
      </form>

      <!-- Admins List -->
      <div v-if="admins?.adminList.length">
        <table class="w-full">
          <thead>
            <tr>
              <th class="w-full">Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins?.adminList" :key="admin">
              <td>{{ admin.email }}</td>
              <td>
                <!-- Remove Admin -->
                <button
                  type="button"
                  class="button-icon button-icon-sm button-danger"
                  @click="removeAdmin(admin)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <!-- Icon: x-sm -->
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p class="text-center">No other admins yet.</p>
      </div>
    </div>

    <LoadingSpinner v-else class="mx-auto my-10" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import FullScreenLoading from "@/components/FullScreenLoading.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default {
  name: "ManageAdmins",
  inheritAttrs: false,
  components: { LoadingSpinner, FullScreenLoading },
  data() {
    return { newAdminEmail: "", isLoading: false };
  },
  computed: {
    ...mapState(["admins"]),
  },
  methods: {
    async addAdmin() {
      this.$store.dispatch("confirmDanger", {
        title: "Adding an Admin",
        message: `ARE YOU SURE you want to add "${this.newAdminEmail}" as an ADMIN? This will GIVE ACCESS to that account to managing your batches and product menu!`,
        buttonMessage: "Add",
        callback: async () => {
          try {
            this.isLoading = true;
            await this.$store.dispatch("addAdmin", this.newAdminEmail);
          } catch (err) {
            console.error(err);
            this.onError(await err);
          } finally {
            this.newAdminEmail = "";
            this.isLoading = false;
          }
        },
      });
    },
    async removeAdmin(admin) {
      this.$store.dispatch("confirmDanger", {
        title: "Removing an Admin",
        message: `Are you sure you want to remove "${admin.email}" as an admin? This will REMOVE ACCESS to that account to managing your batches and product menu!`,
        buttonMessage: "Remove",
        callback: async () => {
          try {
            this.isLoading = true;
            await this.$store.dispatch("removeAdmin", admin.uid);
          } catch (err) {
            console.error(err);
            this.onError(await err);
          } finally {
            this.isLoading = false;
          }
        },
      });
    },

    // Error Handler
    onError(err) {
      if (!!err.errors) {
        if (err.errors.includes("user_not_found")) {
          this.$store.dispatch(
            "alertError",
            "Cannot find a user with that email."
          );
        }
        if (err.errors.includes("incomplete_fields")) {
          this.$store.dispatch("alertError", "Please check the email again.");
        }
        if (err.errors.includes("user_already_admin")) {
          this.$store.dispatch("alertError", "That user is already an admin.");
        }
      } else {
        this.$store.dispatch(
          "alertError",
          "Something went wrong. Please try again later."
        );
      }
    },
  },

  mounted() {
    try {
      this.$store.dispatch("fetchAdmins");
    } catch (err) {
      console.error("ManageAdmins mounted: ", err);
    }
  },
};
</script>

<style>
</style>
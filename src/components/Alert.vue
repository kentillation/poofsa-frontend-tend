<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="top" class="mt-5" timeout="5000"
      persistent>
      <div class="d-flex align-items-center">
        <span style="font-size: 13px;"><v-icon icon="mdi-information-outline"></v-icon></span>
        <span style="font-size: 13px;">&nbsp; {{ snackbar.message }}</span>
      </div>
    </v-snackbar>
</template>
<script>
export default {
  data() {
    return {
      snackbar: {
        visible: false,
        message: '[]',
        color: ''
      },
    };
  },
  methods: {
    showSnackbarAlert(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.visible = true;
    },
  },
};
</script>

<template>
  <md-dialog
    v-bind="getMdProps"
    :md-active.sync="isShowDialog"
    class="lc-dialog"
  >

    <header class="lc-dialog-header lc-section-header">
      <div class="left">
        <slot name="header-left" />
      </div>

      <slot name="header-center" />

      <div class="right">
        <slot name="header-right" />

        <md-button
          v-if="isShowCloseButton"
          class="md-icon-button lc-mobile-show"
          @click="hide"
        >
          <md-icon>close</md-icon>
        </md-button>
      </div>
    </header>

    <md-dialog-content
      v-scroll="onScrollContent"
      :class="[
        'lc-dialog-content',
        {
          'lc-dialog-content--gapless': isContentGapless,
        },
      ]"
    >

      <slot />

    </md-dialog-content>

  </md-dialog>
</template>


<script>
export default {
  name: 'base-dialog',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isShowCloseButton: {
      type: Boolean,
      default: false,
    },
    isContentGapless: {
      type: [Boolean, String],
      default: false,
    },
    mdProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isShowDialog: this.isShow,
    };
  },
  computed: {
    getMdProps() {
      return {
        mdCloseOnEsc: true,
        mdFullscreen: true,
        ...this.mdProps,
      };
    },
  },
  watch: {
    isShow(isShow) {
      this.isShowDialog = isShow;
    },
    isShowDialog(isShowDialog) {
      this.$emit('update:isShow', isShowDialog);
    },
  },
  methods: {
    show() {
      this.isShowDialog = true;
    },
    hide() {
      this.isShowDialog = false;
    },
    onDismiss() {
      this.hide();
    },
    onScrollContent(e, pos) {
      this.$emit('scroll', e, pos);
    },
  },
};
</script>


<style lang="scss">
@import "~assets/variables";

$lc-dialog-icon-size-small: 72px;

$lc-dialog-border-radius: 8px;

.md-dialog.lc-dialog {
  .md-dialog-container {

    flex: auto;
  }

  &:not(.md-dialog-fullscreen) {
    border-radius: $lc-dialog-border-radius;
  }

  @media (min-width: 600px + 1px) {
    width: 450px;

    &.md-dialog-fullscreen {
      border-radius: $lc-dialog-border-radius;
    }
  }
}

.lc-dialog-header {
  &::before {
    .lc-dialog:not(.md-dialog-fullscreen) & {
      border-top-left-radius: $lc-dialog-border-radius;
      border-top-right-radius: $lc-dialog-border-radius;
    }

    @media (min-width: 600px + 1px) {
      .lc-dialog.md-dialog-fullscreen & {
        border-top-left-radius: $lc-dialog-border-radius;
        border-top-right-radius: $lc-dialog-border-radius;
      }
    }
  }

  .lc-dialog-icon {
    position: absolute;
    z-index: 5;
    top: 16px;
    left: 50%;

    width: $lc-section-header-icon-size;
    height: $lc-section-header-icon-size;

    transform: translateX(-50%);

    @media (max-width: 600px) {
      top: 8px;

      width: $lc-dialog-icon-size-small;
      height: $lc-dialog-icon-size-small;
    }
  }
}

.lc-dialog-content {
  padding-top: 16px;
  padding-right: 0;
  padding-left: 0;

  .lc-dialog.with-icon & {
    padding-top: 16px + $lc-section-header-icon-size - $lc-header-height + 16px;

    @media (max-width: 600px) {
      padding-top: 8px + $lc-dialog-icon-size-small - $lc-header-height + 8px;
    }
  }

  &--gapless {
    padding: 0;
  }
}

.lc-dialog-container-1,
.lc-dialog-container-2 {
  position: relative;

  height: 100%;
}

.lc-dialog-container-1 {
  padding-right: 40px;
  padding-left: 40px;

  @media (max-width: 960px) {
    padding-right: 24px;
    padding-left: 24px;
  }
}

.lc-dialog-container-2 {
  padding-right: 16px;
  padding-left: 16px;
}
</style>

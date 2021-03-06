<template>
  <div
    v-if="!error"
    class="civic-liker-register-page"
  >
    <div class="lc-container-0 lc-narrow">

      <section class="lc-container-1 lc-section-block">

        <div class="lc-container-2">
          <div class="lc-container-3 lc-bg-gray-1">
            <div class="lc-container-4 lc-text-align-center">

              <lc-chop-civic-liker
                class="civic-liker-beta-logo"
                size="180"
                rotate-z="-12"
                is-beta
              />

            </div>
          </div>
        </div>

        <div class="lc-container-2-extend">
          <div class="lc-container-3-extend-bg" />
          <div class="lc-container-3 lc-padding-top-48 lc-padding-bottom-32 lc-text-align-center">

            <h1 class="lc-font-size-32 lc-font-weight-600 lc-mobile">
              {{ title }}
              <br>
              <span class="lc-font-size-46 lc-font-weight-300 lc-mobile">
                {{ $t('CivicLikerRegister.title') }}
              </span>
            </h1>

          </div>
        </div>

        <div class="lc-container-2">
          <div class="lc-container-3 lc-bg-gray-1">
            <div class="lc-container-3 lc-padding-vertical-32">

              <!-- Waiting List -->
              <template v-if="page === 'queued'">
                <div
                  class="lc-text-align-center"
                  style="margin-top: -48px"
                >
                  <lc-chop-simple
                    size="180"
                    text="FULL"
                    rotate-z="6"
                  />
                </div>

                <div
                  class="lc-font-size-32 lc-font-weight-600 lc-text-align-center"
                  style="color: #40bfa5"
                >
                  {{ $t('CivicLikerRegister.waitingList.header') }}
                </div>

                <i18n
                  :path="
                    `CivicLikerRegister.waitingList.descriptionWith${hasEmail ? '' : 'out'}Email`
                  "
                  class="lc-font-size-14 lc-color-like-gray-4 lc-margin-top-16"
                  tag="p"
                >
                  <span
                    class="lc-color-like-green lc-font-weight-600"
                    place="email"
                  >{{ getUserInfo.email }}</span>
                  <nuxt-link
                    :to="{ name: 'in-settings' }"
                    place="settingsPage"
                  >{{ $t('Settings.title') }}</nuxt-link>
                </i18n>

                <div class="lc-button-group lc-margin-top-32">
                  <template v-if="!hasEmail">
                    <md-button
                      class="md-likecoin"
                      @click="setOrVerifyEmail"
                    >
                      {{ $t('CivicLikerRegister.errorPopup.alreadyQueued.confirm') }}
                    </md-button><br>
                  </template>
                  <md-button
                    class="md-likecoin"
                    @click="learnMore"
                  >
                    {{ $t('General.button.ok') }}
                  </md-button>
                </div>
              </template>

              <!-- Convert user to oice website for payment -->
              <template v-else-if="page === 'payment'">
                <div
                  v-bind="$testID('RegisterCivicLiker-joinOice')"
                  :class="[
                    'lc-margin-bottom-16',
                    'lc-color-like-green lc-font-size-24 lc-font-weight-600',
                  ]"
                >
                  {{ $t('CivicLikerRegister.joinOice') }}
                </div>

                <div class="pricing-item lc-margin-top-24">
                  <div class="pricing-item-content">
                    <div class="pricing-item__type">
                      {{ $t(`CivicPage.pricing.type.civicLiker`) }}
                    </div>
                    <div>
                      <span class="pricing-item__price">USD5.00</span>
                      <span
                        class="pricing-item__payment-cycle"
                      >{{ $t(`CivicPage.pricing.paymentCycle.perMonth`) }}</span>
                    </div>
                  </div>
                  <div class="pricing-item__image">
                    <img :src="OiceBackerPage">
                  </div>
                </div>

                <div class="lc-button-group lc-margin-top-24">
                  <md-button
                    :href="applyURL"
                    class="md-likecoin"
                    rel="noopener noreferrer"
                    target="_blank"
                    @click="onClickApplyButton"
                  >
                    {{ $t('CivicLikerRegister.applyNow') }}
                  </md-button>
                </div>
              </template>

            </div>
          </div>
        </div>

      </section>

    </div>
  </div>
</template>


<script>
import { mapActions, mapGetters } from 'vuex';

import {
  apiGetCivicLikerRegister,
  apiGetCivicCSOnline,
} from '~/util/api/api';

import OiceBackerPage from '~/assets/civic/oice-backer-reg.png';
import { IS_TESTNET } from '~/constant';

export default {
  layout: 'narrowWithHeader',
  async asyncData({ store, query }) {
    const {
      isSubscribedCivicLiker,
      isCivicLikerTrial,
      isCivicLikerRenewalPeriod,
      isExpiredCivicLiker,
      civicLikerStatus,
    } = store.getters.getUserInfo;
    const isBypassQuota = isCivicLikerTrial || isExpiredCivicLiker || query.vip;

    let error = '';
    let isCSOnline = false;
    if (isSubscribedCivicLiker) {
      if (isCivicLikerRenewalPeriod) {
        // Allow paid Civic Liker to renew
      } else {
        error = 'paid';
      }
    } else if (!isBypassQuota && civicLikerStatus === 'waiting') {
      error = 'alreadyQueued';
    } else {
      try {
        const res = await Promise.all([
          apiGetCivicCSOnline(),
          isBypassQuota || apiGetCivicLikerRegister(),
        ]);
        ({ isCSOnline } = res[0].data);
        if (isBypassQuota) {
          // Allow trial/past Civic Liker to pay
        } else if (res[1].status !== 200) {
          error = 'full';
        }
      } catch (err) {
        error = 'unknown';
      }
    }

    return { error, isCSOnline };
  },
  data() {
    return {
      OiceBackerPage,

      page: 'payment',
    };
  },
  middleware: 'authenticated',
  computed: {
    ...mapGetters([
      'getUserInfo',
    ]),
    title() {
      switch (this.page) {
        case 'queued':
          return this.$t('CivicLikerRegister.waitingList.title');

        case 'payment':
          return this.$t('CivicLikerRegister.thankYouForYourInterest');

        default:
          return '';
      }
    },
    hasEmail() {
      return this.getUserInfo.email && this.getUserInfo.isEmailVerified;
    },
    applyURL() {
      return `https://${IS_TESTNET ? 'oicetest.lakoo.com' : 'oice.com'}/profile?action=subscribe&referrer=${this.getUserInfo.user}`;
    },
  },
  head() {
    return {
      title: this.$t('CivicLikerRegister.title'),
    };
  },
  async mounted() {
    if (this.error === 'full') {
      try {
        await this.queueCivicLiker({ queryString: this.$route.query });
        this.error = '';
        this.page = 'queued';
      } catch (err) {
        this.error = 'errorInQueue';
        this.handleError();
      }
    } else if (this.error) {
      this.handleError();
    } else if (this.$intercom && this.isCSOnline) {
      this.$intercom.trackEvent('likecoin-store_civicLikerRegister');
      this.$intercom.show();
    }
  },
  methods: {
    ...mapActions([
      'queueCivicLiker',
      'openPopupDialog',
    ]),
    handleError() {
      const { error } = this;
      const options = {
        allowClose: true,
        header: this.$t(`CivicLikerRegister.errorPopup.${error}.header`),
        message: this.$t(`CivicLikerRegister.errorPopup.${error}.message`),
        confirmText: this.$t(`CivicLikerRegister.errorPopup.${error}.confirm`),
        cancelText: this.$t('CivicPage.about'),
        onCancel: this.learnMore,
      };

      switch (error) {
        case 'paid':
          options.onConfirm = () => {
            this.$router.push({ name: 'in' });
          };
          break;

        case 'alreadyQueued':
          if (this.hasEmail) {
            options.message = this.$t('CivicLikerRegister.errorPopup.alreadyQueued.messageWithEmail', {
              email: this.getUserInfo.email,
            });
            // Remove confirm button
            delete options.confirmText;
          } else {
            options.message = this.$t('CivicLikerRegister.errorPopup.alreadyQueued.messageWithoutEmail');
            options.onConfirm = this.setOrVerifyEmail;
          }
          break;

        case 'errorInQueue':
        case 'unknown':
          options.message = this.$t('CivicLikerRegister.errorPopup.unknown.message', {
            error: error.toUpperCase(),
          });
          // Remove cancel button
          delete options.cancelText;
          delete options.onCancel;
        // eslint-disable-next-line no-fallthrough
        default:
          options.confirmText = this.$t('General.contactUs');
          options.onConfirm = this.contactUs;
      }
      this.learnMore();
      this.openPopupDialog(options);
    },
    learnMore() {
      this.$router.push({ name: 'in-civic' });
    },
    contactUs() {
      if (this.isCSOnline && this.$intercom) {
        this.$intercom.show();
      } else {
        window.open('https://help.like.co/', '_blank');
      }
    },
    setOrVerifyEmail() {
      if (this.getUserInfo.email && !this.getUserInfo.isEmailVerified) {
        this.$router.push({ name: 'in' });
      } else {
        this.$router.push({ name: 'in-settings' });
      }
    },
    onClickApplyButton() {
      if (this.$intercom) {
        this.$intercom.update({ isOnCivicLikerWaitingList: true });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~assets/variables";

.civic-liker-beta-logo {
  position: relative;
  z-index: 2;

  margin-bottom: -32px;
}

.pricing-item {
  overflow: hidden;

  min-height: 96px;

  border-radius: 8px;

  &-content {
    padding: 16px 24px;

    background: white;
  }

  &__type {
    margin-bottom: 8px;

    color: $like-green;

    font-size: 14px;
    font-weight: 600;
  }

  &__price {
    color: $like-gray-5;

    font-size: 28px;
    font-weight: 600;
  }

  &__payment-cycle {
    color: $gray-9b;

    font-size: 12px;
  }

  &__image {
    max-height: 212px;

    padding: 0 12px;

    text-align: center;

    border-top: solid 1px $like-gray-3;
    background: $gray-e6;

    > img {
      max-height: inherit;
    }
  }

  .lc-chop-civic-liker {
    position: absolute;
    right: -48px;
    bottom: -36px;
  }
}
</style>

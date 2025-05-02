var SOCIAL_API_INITIALIZED_MSG = "social_api_initialized",
  USER_PROFILE_LOADED_MSG = "social_user_profile_loaded",
  USER_PROFILE_LOADING_FAILED_MSG = "social_user_profile_loading_failed",
  USER_AUTHORIZED_MSG = "social_user_authorized",
  USER_AUTHORIZATION_FAILED_MSG = "social_authorization_failed",
  PRODUCT_PURCHASED_MSG = "social_product_purchased",
  PRODUCT_PURCHASE_FAILED_MSG = "social_product_purchase_failed",
  SHORTCUT_CREATED_MSG = "social_shortcut_created",
  SHORTCUT_CREATION_FAILED_MSG = "social_shortcut_creation_failed",
  ADS_INITIALIZED_MSG = "ads_initialized",
  REWARDED_AD_LOADED_MSG = "rewarded_ad_loaded",
  REWARDED_AD_LOAD_FAILED_MSG = "rewarded_ad_load_failed",
  REWARDED_AD_SHOWED_MSG = "rewarded_ad_showed",
  REWARDED_AD_SHOW_FAILED_MSG = "rewarded_ad_show_failed",
  INTERSTITIAL_AD_LOADED_MSG = "interstitial_ad_loaded",
  INTERSTITIAL_AD_LOAD_FAILED_MSG = "interstitial_ad_load_failed",
  INTERSTITIAL_AD_SHOWED_MSG = "interstitial_ad_showed",
  INTERSTITIAL_AD_SHOW_FAILED_MSG = "interstitial_ad_show_failed",
  DEVICE_UNKNOWN = "unknown",
  socialPlatform = {
    _player: void 0,
    _interstitial_ad_id: void 0,
    _rewarded_ad_id: void 0,
    _succesfull_purchase: void 0,
    _preloading_int_in_progress: void 0,
    _preloading_rv_in_progress: void 0,
    _show_int_in_progress: void 0,
    _show_rv_in_progress: void 0,
    progress: function(progress) {
      console.log("Loading progress:", progress)
    },
    preInitialize: function(callback) {
      console.log("Platform initialized"), callback(), XPayStationWidget.on(XPayStationWidget.eventTypes.CLOSE, function(event, data) {
        console.log(event, data), socialPlatform._succesfull_purchase || JsToDef.send(PRODUCT_PURCHASE_FAILED_MSG, {
          error: "Purchase failed"
        }), socialPlatform._succesfull_purchase = void 0
      })
    },
    initialize: function() {
      $msstart.getSignedInUserAsync().then(playerInfo => {
        socialPlatform._player = playerInfo, JsToDef.send(SOCIAL_API_INITIALIZED_MSG, {
          auth_fields: {
            api_type: 30,
            api_uid: playerInfo.publisherPlayerId,
            auth_sig: playerInfo.signature
          }
        })
      }).catch(() => {
        JsToDef.send(SOCIAL_API_INITIALIZED_MSG, {
          auth_fields: {
            api_type: 930
          }
        })
      })
    },
    handleAPICallback: function(event) {
      if (event && "string" == typeof event.data) {
        var eventData;
        try {
          eventData = JSON.parse(event.data)
        } catch (error) {
          return void console.log("Unable to parse event data:", error)
        }
        eventData && "order-status" == eventData.command && eventData.data && eventData.data.order_id && eventData.data.items && (JsToDef.send(PRODUCT_PURCHASED_MSG, {
          product_id: eventData.data.items[0].sku,
          transaction_id: eventData.data.order_id
        }), socialPlatform._succesfull_purchase = !0)
      }
    },
    canLogin: function() {
      return !0
    },
    login: function() {
      $msstart.signInAsync().then(playerInfo => {
        socialPlatform._player = playerInfo, JsToDef.send(USER_AUTHORIZED_MSG, {
          auth_fields: {
            api_type: 30,
            api_uid: playerInfo.publisherPlayerId,
            auth_sig: playerInfo.signature
          }
        })
      }).catch(error => {
        JsToDef.send(USER_AUTHORIZATION_FAILED_MSG, {
          error: "Unable to authorize " + error.code
        })
      })
    },
    getDefaultLocale: function() {
      return $msstart.getLocale()
    },
    getCountryCode: function() {},
    getInstallReferrer: function() {},
    loadUserProfile: function() {
      socialPlatform._player ? JsToDef.send(USER_PROFILE_LOADED_MSG, {
        profile: {
          first_name: socialPlatform._player.playerDisplayName || ""
        }
      }) : JsToDef.send(USER_PROFILE_LOADING_FAILED_MSG, {
        error: "Not authorized user"
      })
    },
    canCreateShortcut: function() {
      return !0
    },
    createShortcut: function() {
      $msstart.promptInstallAsync().then(function() {
        console.log("Shortcut successfully created"), JsToDef.send(SHORTCUT_CREATED_MSG)
      }).catch(function() {
        console.log("Shortcut failed to create"), JsToDef.send(SHORTCUT_CREATION_FAILED_MSG)
      })
    },
    getStoreName: function() {
      return "web"
    },
    loadProducts: function() {
      throw new Error("Not implemented")
    },
    buyProduct: function(params) {
      params.childWindow = {
        target: "_self"
      }, XPayStationWidget.init(params), XPayStationWidget.open()
    },
    finishTransaction: function() {
      throw new Error("Not implemented")
    },
    initializeAds: function() {
      JsToDef.send(ADS_INITIALIZED_MSG), socialPlatform.preloadInterstitial(), socialPlatform.preloadRewarded()
    },
    preloadInterstitial: function() {
      if (!socialPlatform._preloading_int_in_progress)
        if (socialPlatform._interstitial_ad_id) JsToDef.send(INTERSTITIAL_AD_LOADED_MSG);
        else {
          socialPlatform._preloading_int_in_progress = !0;
          try {
            $msstart.loadAdsAsync().then(result => {
              socialPlatform._interstitial_ad_id = result.instanceId, JsToDef.send(INTERSTITIAL_AD_LOADED_MSG), socialPlatform._preloading_int_in_progress = !1
            }).catch(error => {
              console.log("Interstitial load error:", error), JsToDef.send(INTERSTITIAL_AD_LOAD_FAILED_MSG, {
                error: String(error)
              }), socialPlatform._preloading_int_in_progress = !1
            })
          } catch (error) {
            JsToDef.send(INTERSTITIAL_AD_LOAD_FAILED_MSG, {
              error: "Unknown interstitial preload error"
            }), socialPlatform._preloading_int_in_progress = !1
          }
        }
    },
    showInterstitial: function() {
      if (!socialPlatform._show_int_in_progress)
        if (socialPlatform._interstitial_ad_id) {
          socialPlatform._show_int_in_progress = !0;
          try {
            $msstart.showAdsAsync(socialPlatform._interstitial_ad_id).then(result => {
              console.log(result), result && result.showAdsCompletedAsync ? result.showAdsCompletedAsync.then(result => {
                console.log(result), socialPlatform._interstitial_ad_id = void 0, JsToDef.send(INTERSTITIAL_AD_SHOWED_MSG), socialPlatform._show_int_in_progress = !1
              }).catch(error => {
                console.log(error), socialPlatform._interstitial_ad_id = void 0, JsToDef.send(INTERSTITIAL_AD_SHOW_FAILED_MSG), socialPlatform._show_int_in_progress = !1
              }) : (JsToDef.send(INTERSTITIAL_AD_SHOW_FAILED_MSG), socialPlatform._show_int_in_progress = !1)
            }).catch(error => {
              console.log(error), "REQUEST_THROTTLED" != error.code && (socialPlatform._interstitial_ad_id = void 0), JsToDef.send(INTERSTITIAL_AD_SHOW_FAILED_MSG), socialPlatform._show_int_in_progress = !1
            })
          } catch (error) {
            JsToDef.send(INTERSTITIAL_AD_SHOW_FAILED_MSG), socialPlatform._show_int_in_progress = !1
          }
        } else JsToDef.send(INTERSTITIAL_AD_SHOW_FAILED_MSG)
    },
    preloadRewarded: function() {
      if (!socialPlatform._preloading_rv_in_progress)
        if (socialPlatform._rewarded_ad_id) JsToDef.send(REWARDED_AD_LOADED_MSG);
        else {
          socialPlatform._preloading_rv_in_progress = !0;
          try {
            $msstart.loadAdsAsync(!0).then(result => {
              socialPlatform._rewarded_ad_id = result.instanceId, JsToDef.send(REWARDED_AD_LOADED_MSG), socialPlatform._preloading_rv_in_progress = !1
            }).catch(error => {
              console.log("Rewarded load error:", error), JsToDef.send(REWARDED_AD_LOAD_FAILED_MSG, {
                error: String(error)
              }), socialPlatform._preloading_rv_in_progress = !1
            })
          } catch (error) {
            JsToDef.send(REWARDED_AD_LOAD_FAILED_MSG, {
              error: "Unknown rewarded preload error"
            }), socialPlatform._preloading_rv_in_progress = !1
          }
        }
    },
    showRewarded: function() {
      if (!socialPlatform._show_rv_in_progress)
        if (socialPlatform._rewarded_ad_id) {
          socialPlatform._show_rv_in_progress = !0;
          try {
            $msstart.showAdsAsync(socialPlatform._rewarded_ad_id).then(result => {
              console.log(result), result && result.showAdsCompletedAsync ? result.showAdsCompletedAsync.then(result => {
                console.log(result), socialPlatform._rewarded_ad_id = void 0, JsToDef.send(REWARDED_AD_SHOWED_MSG), socialPlatform._show_rv_in_progress = !1
              }).catch(error => {
                console.log(error), socialPlatform._rewarded_ad_id = void 0, JsToDef.send(REWARDED_AD_SHOW_FAILED_MSG), socialPlatform._show_rv_in_progress = !1
              }) : (JsToDef.send(REWARDED_AD_SHOW_FAILED_MSG), socialPlatform._show_rv_in_progress = !1)
            }).catch(error => {
              console.log(error), "REQUEST_THROTTLED" != error.code && (socialPlatform._rewarded_ad_id = void 0), JsToDef.send(REWARDED_AD_SHOW_FAILED_MSG), socialPlatform._show_rv_in_progress = !1
            })
          } catch (error) {
            JsToDef.send(REWARDED_AD_SHOW_FAILED_MSG), socialPlatform._show_rv_in_progress = !1
          }
        } else JsToDef.send(REWARDED_AD_SHOW_FAILED_MSG)
    },
    supportsPageReload: function() {
      return !0
    },
    logEvent: function() {},
    canShowBanner: function() {
      return !1
    },
    preloadBanner: function() {
      throw new Error("Not implemented")
    },
    isBannerShown: function() {
      return !1
    },
    getBannerTimeout: function() {
      return 0
    },
    showBanner: function() {
      throw new Error("Not implemented")
    },
    hideBanner: function() {
      throw new Error("Not implemented")
    },
    getAdInstallData: function() {
      var data = $msstart.getEntryPointInfo();
      if (data) return JSON.stringify({
        campaign_id: data.entryPointId,
        ad_id: $msstart.getSourceShareId()
      })
    },
    canShare: function() {
      return !1
    },
    share: function() {
      throw new Error("Not implemented")
    },
    markGameReady: function() {},
    markGameplayStarted: function() {},
    markGameplayStopped: function() {},
    onUnpause: function() {},
    onPause: function() {},
    hasAdblocker: function() {
      return !1
    },
    getPlatformType: function() {
      return DEVICE_UNKNOWN
    }
  };
window.addEventListener("message", socialPlatform.handleAPICallback);
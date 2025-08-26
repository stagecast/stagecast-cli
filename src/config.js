export default {
  environments: {
    production: {
      api_endpoint: 'https://console.stagecast.io',
      content_upload_endpoint: 'https://d21pr33ep1h6mu.cloudfront.net/api/content/',
      /** @deprecated */
      upload_path: 'api/users/filippo@stagecast.se/content/'

    },
    staging: {
      api_endpoint: 'https://console.staging.stagecast.io',
      content_upload_endpoint: 'https://d1r0op4ur44djw.cloudfront.net/api/content/',
      /** @deprecated */
      upload_path: 'api/users/filippo@stagecast.se/content/'
    }
  },
  /**
   * Files to be ignored when copying the activation bundled code
   */
  ignored_files: [/node_modules/, /adapters/, /vue/, /vue-mobile/, /vue-results/, /vue-moderation/, /tests/, /.js.map/, /.DS_Store/],
}
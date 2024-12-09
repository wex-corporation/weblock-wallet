export interface SDKConfig {
  /**
   * API Key for authentication
   */
  apiKey: string;

  /**
   * Environment setting ('local' | 'dev' | 'stage' | 'prod')
   */
  env: 'local' | 'dev' | 'stage' | 'prod';

  /**
   * Organization host URL
   */
  orgHost: string;
}

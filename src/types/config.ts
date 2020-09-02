export type AllowedDevelopmentDomains = string | ((origin: string) => boolean);

export interface ServerConfig {
  allowedDevelopmentDomains: AllowedDevelopmentDomains;
}

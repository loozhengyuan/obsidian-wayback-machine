/**
 * Constants and configuration for the Wayback Machine Plugin
 */

/** Regular expression to match HTTP/HTTPS URLs */
export const URL_REGEX = /https?:\/\/[^\s\)>\]]+/g;

/** List of hostnames that should not be processed */
export const HOSTNAMES_BLOCKED = [
  "0.0.0.0",
  // Localhost
  "localhost",
  "127.0.0.1",
  "::1",
  // Wayback Machine
  "web.archive.org",
] as const;

/** Status messages for the plugin */
export const STATUS_MESSAGES = {
  READY: "Wayback: Ready",
  REPLACING: (current: number, total: number) => 
    `Wayback: Replacing ${current} of ${total} link(s)...`,
} as const;

/** Log messages */
export const LOG_MESSAGES = {
  PLUGIN_ALREADY_RUNNING: "Plugin already running, exiting!",
  ERROR_REPLACING_LINKS: "Error replacing links",
  IGNORING_BLOCKED_HOSTNAME: (hostname: string) => 
    `Ignoring blocked hostname: ${hostname}`,
  UNARCHIVED_LINK_DETECTED: (link: string) => 
    `Detected unarchived link: ${link}`,
  WAYBACK_URL_INVALID: "Wayback URL is not null but not truthy either",
} as const;
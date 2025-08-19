/**
 * Client to interact with the Wayback Machine API
 */
export class WaybackMachineClient {
  /**
   * Get the closest archived snapshot URL for a given URL
   * @param url - The URL to find in the Wayback Machine
   * @returns Promise resolving to the archived URL or null if not found
   */
  async getWaybackUrl(url: string): Promise<string | null> {
    const apiUrl = `https://archive.org/wayback/available?url=${
      encodeURIComponent(url)
    }`;
    const response = await fetch(apiUrl);
    console.debug(
      `Get Wayback Machine link: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.archived_snapshots?.closest?.url || null;
  }

  /**
   * Save a URL to the Wayback Machine
   * @param url - The URL to save to the archive
   * @returns Promise that resolves when the save operation completes
   */
  async saveToWayback(url: string): Promise<void> {
    const saveUrl = `https://web.archive.org/save/${url}`;
    const response = await fetch(saveUrl, { method: "POST" });
    console.debug(
      `Save to Wayback Machine: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

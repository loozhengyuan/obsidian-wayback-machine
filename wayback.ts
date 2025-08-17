/**
 * Client to interact with the Wayback Machine API
 */
export class WaybackMachineClient {
  async getWaybackUrl(url: string): Promise<string | null> {
    const apiUrl = `https://archive.org/wayback/available?url=${
      encodeURIComponent(url)
    }`;
    const response = await fetch(apiUrl);
    console.debug(`Get Wayback Machine link: ${response}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.archived_snapshots?.closest?.url || null;
  }

  async saveToWayback(url: string): Promise<void> {
    const saveUrl = `https://web.archive.org/save/${url}`;
    const response = await fetch(saveUrl, { method: "POST" });
    console.debug(`Save to Wayback Machine: ${response}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

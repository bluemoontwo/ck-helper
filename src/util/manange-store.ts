import fs from "fs";
import path from "path";

/**
 * Class for storing and managing data using JSON files
 */
export default class StoreManager {
  /** Store name */
  private storeName: string;
  /** File path */
  private filePath: string;

  /**
   * Constructor for StoreManager class
   * @param storeName Store name
   */
  constructor(storeName: string) {
    this.storeName = storeName;

    // Set relative path based on execution directory
    const baseDir = path.resolve(process.cwd());
    const storeDir = path.join(baseDir, ".store");
    this.filePath = path.join(storeDir, `${this.storeName}.json`);

    try {
      // Create .store directory if it doesn't exist
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true });
      }

      // Initialize with empty object if file doesn't exist
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, "{}", "utf8");
      }
    } catch (error) {
      console.error(`Error initializing store: ${error}`);
      throw new Error("Failed to initialize store");
    }
  }

  /**
   * Method to retrieve value from store
   * @param key Key path separated by dots
   * @returns Stored value or undefined
   */
  public get<T>(key: string): T | undefined {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const parsedData = JSON.parse(data);

      // Follow path separated by dots to find value
      return key.split(".").reduce((obj: any, path) => {
        return obj?.[path];
      }, parsedData);
    } catch (error) {
      console.error(`Error reading from store: ${error}`);
      return undefined;
    }
  }

  /**
   * Method to store value in store
   * @param key Key path separated by dots
   * @param value Value to store
   */
  public set(key: string, value: unknown): void {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const parsedData = JSON.parse(data);

      const paths = key.split(".");
      let current = parsedData;

      // Create nested object structure
      for (let i = 0; i < paths.length - 1; i++) {
        if (!(paths[i] in current)) {
          current[paths[i]] = {};
        }
        current = current[paths[i]];
      }

      // Set final value
      current[paths[paths.length - 1]] = value;

      // Save to file
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(parsedData, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error(`Error writing to store: ${error}`);
      throw new Error("Failed to save data");
    }
  }

  /**
   * Method to delete value from store
   * @param key Key path separated by dots
   */
  public delete(key: string): void {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const parsedData = JSON.parse(data);

      const paths = key.split(".");
      let current = parsedData;

      // Search until last key
      for (let i = 0; i < paths.length - 1; i++) {
        if (!(paths[i] in current)) {
          return; // Exit if path doesn't exist
        }
        current = current[paths[i]];
      }

      // Delete last key
      delete current[paths[paths.length - 1]];

      // Save to file
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(parsedData, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error(`Error deleting from store: ${error}`);
      throw new Error("Failed to delete data");
    }
  }
}

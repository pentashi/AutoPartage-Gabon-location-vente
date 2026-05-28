import axios from "axios";
import { env } from "../../config/env";

const GPS_BASE_URL = "http://api.39gps.com";

export class GpsService {
  private static get headers() {
    return {
      "Content-Type": "application/json",
      "apikey": env.GPS_API_KEY || "XXXXXXXXXXXX", // Fallback for dev
    };
  }

  /**
   * 2. Obtain device location information
   * @param ids Device IDs, separated by commas (Maximum 20)
   */
  static async getDeviceLocations(ids: string) {
    const response = await axios.get(`${GPS_BASE_URL}/general/getMap`, {
      headers: this.headers,
      params: { id: ids },
    });
    return response.data;
  }

  /**
   * 3. Obtain historical track
   * @param id Device ID
   * @param date Query date (yyyy-MM-dd)
   */
  static async getPlayback(id: string, date?: string) {
    const response = await axios.get(`${GPS_BASE_URL}/general/getPlayback`, {
      headers: this.headers,
      params: { id, date },
    });
    return response.data;
  }

  /**
   * 4. Obtain device alarm
   * @param id Device ID
   * @param rows Items per page
   * @param page Page number
   */
  static async getAlarms(id: string, rows: number = 10, page: number = 1) {
    const response = await axios.get(`${GPS_BASE_URL}/general/getWarn`, {
      headers: this.headers,
      params: { id, rows, page },
    });
    return response.data;
  }

  /**
   * 5. Send command
   */
  static async sendCommand(devId: string, cmdType: string, cmdCategory: string, cmdBody: string) {
    const response = await axios.get(`${GPS_BASE_URL}/general/sendCommand`, {
      headers: this.headers,
      params: { devId, cmdType, cmdCategory, cmdBody },
    });
    return response.data;
  }

  /**
   * 6. Obtain device schedule list (Travel)
   */
  static async getTravel(id: string, date: string) {
    const response = await axios.get(`${GPS_BASE_URL}/general/getTravel`, {
      headers: this.headers,
      params: { id, date },
    });
    return response.data;
  }

  /**
   * 11. Obtain vehicle OBD data
   */
  static async getObdData(id: string) {
    const response = await axios.get(`${GPS_BASE_URL}/general/obd`, {
      headers: this.headers,
      params: { id },
    });
    return response.data;
  }
}

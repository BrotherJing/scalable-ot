import axios, { AxiosInstance } from 'axios';
import { API_SERVER_PORT } from './const/config';
import { Snapshot } from 'scalable-ot-proto/gen/text_pb';
import API, { CONTEXT_PATH } from './const/api';

class IO {
  static instance: IO;
  axios: AxiosInstance;
  constructor() {
    this.axios = axios.create({
      baseURL: `http://localhost:${API_SERVER_PORT}`,
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/x-protobuf',
      },
    });
  }

  public async create(): Promise<Snapshot> {
    let response = await this.axios.post(this.getUrl_(API.CREATE));
    return Snapshot.deserializeBinary(response.data);
  }

  public async fetch(docId: string): Promise<Snapshot> {
    let response = await this.axios.get(this.getUrl_(API.FETCH).replace('{docId}', docId));
    return Snapshot.deserializeBinary(response.data);
  }

  private getUrl_(path: string): string {
    return CONTEXT_PATH + path;
  }

  public static getInstance(): IO {
    if (!IO.instance) {
      IO.instance = new IO();
    }
    return IO.instance;
  }
}

export default IO;

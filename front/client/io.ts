import axios, { AxiosInstance } from 'axios';
import { API_SERVER_PORT } from './const/config';
import { Snapshot, Commands, Command, DocType, DocTypeMap } from 'scalable-ot-proto/gen/base_pb';
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

  public async create(docType?: DocTypeMap[keyof DocTypeMap]): Promise<Snapshot> {
    let url;
    if (docType === DocType.JSON) {
      url = this.getUrl_(API.CREATE_SHEET);
    } else {
      url = this.getUrl_(API.CREATE);
    }
    let response = await this.axios.post(url);
    return Snapshot.deserializeBinary(response.data);
  }

  public async fetch(docId: string, version?: number): Promise<Snapshot> {
    let response = await this.axios.get(this.getUrl_(API.FETCH, docId), {
      params: version !== undefined ? {
        'version': version,
      } : {},
    });
    return Snapshot.deserializeBinary(response.data);
  }

  public async getOpsSince(docId: string, version: number): Promise<Commands> {
    let res = await this.axios.get(this.getUrl_(API.OPS, docId), {
      params: {
        'from': version
      }
    });
    return Commands.deserializeBinary(res.data);
  }

  public async save(docId: string, command: Command): Promise<any> {
    await this.axios.post(this.getUrl_(API.SAVE, docId), command.serializeBinary(), {
      headers: {
        'Content-Type': 'application/x-protobuf',
      },
    });
  }

  public async getWSChannel(docId: string): Promise<string> {
    let res = await this.axios.get(this.getUrl_(API.CHANNEL, docId), {
      responseType: 'text',
      headers: {
        'Accept': 'text/plain',
      },
    });
    return res.data;
  }

  private getUrl_(path: string, docId?: string): string {
    if (docId) {
      path = path.replace('{docId}', docId);
    }
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

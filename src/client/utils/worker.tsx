import axios from "axios";

export interface WorkerOptions {
  connection?: {
    headers?: { title: string, value: string }[]
  }
}

export interface WorkerParameters {
  fullName?: string,
  name?: {
    fName?: string,
    mName?: string,
    lName?: string
  },
  email?: string,
  phoneNumber?: string,
  photo?: string,
  birthDate?: string,
  childrensCount?: number,
  address?: string,
  post?: string,
  salary?: number
}

export class Worker {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: WorkerParameters;

  protected declare(parameters: any): WorkerParameters {
    return {
      fullName: parameters.name.fName + ' ' + parameters.name.mName + ' ' + parameters.name.lName,
      name: parameters.name,
      email: parameters.email,
      phoneNumber: parameters.phone || parameters.phoneNumber,
      photo: parameters.photo,
      birthDate: parameters.birth || parameters.birthDate,
      childrensCount: parameters.childrensCount,
      address: `${parameters.address.country} ${parameters.address.city} ${parameters.address.street} ${parameters.address.apartments}`,
      post: parameters.workInfo.post,
      salary: parameters.workInfo.salary || parameters.workInfo.currentSalary
    };
  }

  constructor(parameters: any, opts: WorkerOptions = {}) {
    this._parameters = this.declare(parameters);
  }

  public get parameters(): WorkerParameters {
    return this._parameters;
  }

  public static async getWorkers(opts?: WorkerOptions): Promise<Worker[]> {
    let workers: Worker[] = [];

    const response: any = await axios.post('/workers');

    try {
      if (Array.isArray(response.data.workers)) {
        response.data.workers.forEach((workerInfo: any) => {
          workers.push(new Worker(workerInfo, opts));
        });
      }
    } catch (err) {
      throw new Error(err);
    }

    return workers;
  }
}

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
  salary?: number,
  id?: string
}

export class Worker {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: WorkerParameters;

  protected declare(parameters: any): WorkerParameters {
    console.log("PARAMETERS:", parameters);
    return {
      id: parameters._id || undefined,
      fullName: parameters.name.fName + ' ' + parameters.name.mName + ' ' + parameters.name.lName,
      name: parameters.name,
      email: parameters.email,
      phoneNumber: parameters.phone || parameters.phoneNumber,
      photo: parameters.photo,
      birthDate: parameters.birth || parameters.birthDate,
      childrensCount: parameters.childrensCount,
      address: !parameters.address ? undefined : `${parameters.address.country} ${parameters.address.city} ${parameters.address.street} ${parameters.address.apartments}`,
      post: parameters.workInfo.post,
      salary: parameters.workInfo.salary || parameters.workInfo.currentSalary
    };
  }

  constructor(parameters: any, opts: WorkerOptions = {}) {
    this._parameters = this.declare(parameters);
  }

  public get parameters(): WorkerParameters | undefined {
    return this._parameters;
  }

  public get name(): string | undefined {
    return this._parameters.fullName;
  }

  public get email(): string | undefined {
    return this._parameters.email;
  }

  public get phone(): string | undefined {
    return this._parameters.phoneNumber;
  }

  public get photo(): string | undefined {
    return this._parameters.photo;
  }

  public get childrens(): number | undefined {
    return this._parameters.childrensCount;
  }

  public get address(): string | undefined {
    return this._parameters.address;
  }

  public get post(): string | undefined {
    return this._parameters.post;
  }

  public get salary(): number | undefined {
    return this._parameters.salary;
  }

  public get id(): string | undefined {
    return this._parameters.id;
  }

  public static async addWorker(projectId: string, workerId: string, opts: WorkerOptions = { connection: {} }): Promise<Worker> {
    let worker: Worker;
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/worker/create',
      headers: headers,
      data: { projectId, workerId }
    });

    console.log("NEW WORKER:", response.data);
    console.log("created WORKER:", new Worker(response.data.worker, opts))

    try {
      worker = new Worker(response.data.worker, opts);
    } catch(err) {
      throw new Error(err);
    }

    return worker;
  }

  public static async findWorker(projectId: string, queryParams: WorkerParameters, opts: WorkerOptions = { connection: {} }): Promise<Worker>  {
    let worker: Worker;

    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `/project/worker?projectId=${projectId}&query=${JSON.stringify(queryParams)}`,
      headers: headers
    });

    try {
      worker = new Worker(response.data, opts);
    } catch (err) {
      throw new Error(err);
    }

    return worker;
  }

  public static async getWorkers(projectId: string, opts: WorkerOptions = { connection: {} }): Promise<Worker[]> {
    let workers: Worker[] = [];

    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/project/workers',
      headers: headers,
      data: { projectId }
    });

    try {
      if (Array.isArray(response.data)) {
        response.data.forEach((workerInfo: any) => {
          workers.push(new Worker(workerInfo, opts));
        });
      }
    } catch (err) {
      throw new Error(err);
    }

    return workers;
  }
}

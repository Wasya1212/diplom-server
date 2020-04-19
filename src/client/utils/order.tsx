import axios from "axios";

import { Worker } from "./worker";
import { Product } from "./product";

export interface OrderOptions {
  connection?: {
    headers?: { title: string, value: string }[]
  }
}

export interface Coordinate {
  lng: number,
  lat: number
}

export interface OrderParameters {
  workers?: Worker[],
  address?: string,
  pointOnMap?: Coordinate,
  description?: string,
  products?: Product[],
  id?: string,
  deliveryDate?: Date,
  operator?: Worker,
  number?: number
}

export class Order {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: OrderParameters;

  protected declare(parameters: any): OrderParameters {
    return {
      id: parameters._id,
      workers: parameters.workers,
      address: parameters.address,
      pointOnMap: parameters.pointOnMap,
      description: parameters.description,
      deliveryDate: parameters.deliveryDate,
      products: parameters.products,
      operator: parameters.operator,
      number: parameters.number
    };
  }

  constructor(parameters: any, opts: OrderOptions = {}) {
    this._parameters = this.declare(parameters);
  }

  public get id(): string | undefined {
    return this._parameters.id;
  }

  public get workers(): Worker[] {
    return this._parameters.workers || [];
  }

  public get address(): string | undefined {
    return this._parameters.address;
  }

  public get pointOnMap(): Coordinate | undefined {
    return this._parameters.pointOnMap;
  }

  public get description(): string | undefined {
    return this._parameters.description;
  }

  public get deliveryDate(): Date | undefined {
    return this._parameters.deliveryDate;
  }

  public get products(): Product[] | undefined {
    return this._parameters.products || [];
  }

  public get operator(): Worker | undefined {
    return this._parameters.operator;
  }

  public get parameters(): OrderParameters | undefined {
    return this._parameters;
  }

  public get number(): number | undefined {
    return this._parameters.number;
  }

  public static async addOrder(
    projectId: string,
    orderDetails: Order | OrderParameters,
    opts: OrderOptions = { connection: {} }
  ): Promise<Order> {
    let order: Order;
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/order/create',
      headers: headers,
      data: { projectId, ...(orderDetails instanceof Order ? orderDetails.parameters : orderDetails) }
    });

    console.log("NEW Order:", response.data);
    console.log("created ORDER:", new Order(response.data.order, opts))

    try {
      order = new Order(response.data.order, opts);
    } catch(err) {
      throw new Error(err);
    }

    return order;
  }

  public static async getOrders(projectId: string, opts: OrderOptions = { connection: {} }): Promise<Order[]> {
    let orders: Order[] = [];

    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `/orders?projectId=${projectId}`,
      headers: headers
    });

    console.log("PFDAS", response.data);

    try {
      if (Array.isArray(response.data)) {
        response.data.forEach((order: any) => {
          orders.push(new Order(order, opts));
        });
      }
    } catch (err) {
      throw new Error(err);
    }

    return orders;
  }
}

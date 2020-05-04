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
  products?: { product: Product, count: number }[],
  id?: string,
  deliveryDate?: Date,
  operator?: Worker,
  number?: number
}

export class Order {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: OrderParameters;

  protected declare(parameters: OrderParameters): OrderParameters {
    return {
      //@ts-ignore
      id: parameters._id || parameters.id,
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

  public get products(): { product: Product, count: number }[] | undefined {
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

  public static async find(projectId: string, query: any, opts: OrderOptions = { connection: {} }): Promise<Order[]> {
    let orders: Order[] = [];
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `orders?${Object.keys(query).map(o => `${o}=${query[o].toString()}`).join('&')}&projectId=${projectId}`,
      headers: headers
    });

    try {
      orders = response.data.map(order => new Order(order));
    } catch (err) {
      console.error(err);
    }

    return orders;
  }

  public static async findById(projectId: string, orderId: string, opts: OrderOptions = { connection: {} }): Promise<Order> {
    let order: Order = new Order({});
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `order?id=${orderId}&projectId=${projectId}`,
      headers: headers
    });

    try {
      order = new Order(response.data);
    } catch (err) {
      console.error(err);
    }

    return order;
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

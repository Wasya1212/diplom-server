import axios from "axios";

import { Worker } from "./worker";
import { Order } from "./order";

export interface RouteOptions {
  connection?: {
    headers?: { title: string, value: string }[]
  }
}

export interface Coordinate {
  lng: number,
  lat: number
}

export interface Timeline {
  waypoint: Coordinate,
  date: Date,
  speed: number
}

export interface RouteParameters {
  id?: string,
  users?: Worker[],
  date?: string,
  orders?: Order[],
  plannedRoute?: string,
  waypoints?: Coordinate[],
  currentRoute?: string,
  timeline?: Timeline[],
  status?: string
}

export class Route {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: RouteParameters;

  protected declare(parameters: RouteParameters): RouteParameters {
    return {
      //@ts-ignore
      id: parameters._id || parameters.id,
      users: parameters.users,
      date: parameters.date,
      orders: parameters.orders,
      plannedRoute: parameters.plannedRoute,
      waypoints: parameters.waypoints,
      currentRoute: parameters.currentRoute,
      timeline: parameters.timeline,
      status: parameters.status
    };
  }

  constructor(parameters: any, opts: RouteOptions = {}) {
    this._parameters = this.declare(parameters);
  }

  public get id(): string | undefined {
    return this._parameters.id;
  }

  public get users(): Worker[] {
    return this._parameters.users || [];
  }

  public get date(): string | undefined {
    return this._parameters.date;
  }

  public get orders(): Order[] {
    return this._parameters.orders || [];
  }

  public get plannedRoute(): string | undefined {
    return this._parameters.plannedRoute;
  }

  public get waypoints(): Coordinate[] {
    return this._parameters.waypoints || [];
  }

  public get currentRoute(): string | undefined {
    return this._parameters.currentRoute;
  }

  public get timeline(): Timeline[] {
    return this._parameters.timeline || [];
  }

  public get status(): string | undefined {
    return this._parameters.status;
  }

  public get parameters(): RouteParameters | undefined {
    return this._parameters;
  }

  public static async closeRoute(projectId: string, routeId: string, opts: RouteOptions = { connection: {} }): Promise<Route> {
    let route: Route = new Route({});
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/route/close',
      headers: headers,
      data: { projectId, routeId }
    });

    try {
      route = new Route(response.data, opts);
    } catch(err) {
      throw new Error(err);
    }

    return route;
  }

  public static async find(projectId: string, query: any, opts: RouteOptions = { connection: {} }): Promise<Route[]> {
    let routes: Route[] = [];
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `routes?${Object.keys(query).map(o => `${o}=${query[o].toString()}`).join('&')}&projectId=${projectId}`,
      headers: headers
    });

    try {
      routes = response.data.map(route => new Route(route));
    } catch (err) {
      console.error(err);
    }

    return routes;
  }

  public static async addRoute(
    projectId: string,
    routeDetails: Route | RouteParameters,
    opts: RouteOptions = { connection: {} }
  ): Promise<Route> {
    let route: Route;
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/route/create',
      headers: headers,
      data: { projectId, ...(routeDetails instanceof Route ? routeDetails.parameters : routeDetails) }
    });

    try {
      route = new Route(response.data.route, opts);
    } catch(err) {
      throw new Error(err);
    }

    return route;
  }

  public static async getRoutes(projectId: string, opts: RouteOptions = { connection: {} }): Promise<Route[]> {
    let routes: Route[] = [];

    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `/routes?projectId=${projectId}`,
      headers: headers
    });

    try {
      if (Array.isArray(response.data)) {
        response.data.forEach((route: any) => {
          routes.push(new Route(route, opts));
        });
      }
    } catch (err) {
      throw new Error(err);
    }

    return routes;
  }
}

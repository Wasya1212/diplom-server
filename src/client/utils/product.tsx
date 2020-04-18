import axios from "axios";

export interface ProductOptions {
  connection?: {
    headers?: { title: string, value: string }[]
  }
}

export interface ProductParameters {
  code?: number,
  name?: string,
  category?: string,
  actualCount?: number,
  reserved?: number,
  id?: string
}

export class Product {
  private _headers: { title: string, value: string }[] = [];
  private _parameters: ProductParameters;

  protected declare(parameters: any): ProductParameters {
    return {
      id: parameters._id,
      name: parameters.name,
      code: parameters.code,
      category: parameters.category,
      actualCount: parameters.actualCount,
      reserved: parameters.reserved
    };
  }

  constructor(parameters: any, opts: ProductOptions = {}) {
    console.log("PRD", parameters)
    this._parameters = this.declare(parameters);
  }

  public get id(): string | undefined {
    return this._parameters.id;
  }

  public get name(): string | undefined {
    return this._parameters.name;
  }

  public get code(): number | undefined {
    return this._parameters.code;
  }

  public get category(): string | undefined {
    return this._parameters.category;
  }

  public get actualCount(): number | undefined {
    return this._parameters.actualCount;
  }

  public get reserved(): number | undefined {
    return this._parameters.reserved;
  }

  public static async addProduct(
    projectId: string,
    productDetails: { name: string, code: number, count: number, category: string },
    opts: ProductOptions = { connection: {} }
  ): Promise<Product> {
    let product: Product;
    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'POST',
      url: '/product/add',
      headers: headers,
      data: { projectId, ...productDetails }
    });

    console.log("NEW Product:", response.data);
    console.log("created PRODUCT:", new Product(response.data.product, opts))

    try {
      product = new Product(response.data.product, opts);
    } catch(err) {
      throw new Error(err);
    }

    return product;
  }

  public static async getProducts(projectId: string, opts: ProductOptions = { connection: {} }): Promise<Product[]> {
    let products: Product[] = [];

    let headers = {};

    if (opts.connection && opts.connection.headers && Array.isArray(opts.connection.headers)) {
      opts.connection.headers.forEach(header => {
        headers[header.title] = header.value;
      })
    }

    const response: any = await axios({
      method: 'GET',
      url: `/products?projectId=${projectId}`,
      headers: headers
    });

    console.log("PFDAS", response.data);

    try {
      if (Array.isArray(response.data)) {
        response.data.forEach((product: any) => {
          products.push(new Product(product, opts));
        });
      }
    } catch (err) {
      throw new Error(err);
    }

    return products;
  }
}

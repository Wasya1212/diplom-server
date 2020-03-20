interface DATABASE_COWS_SCHEMA {
  id: number,
  animalType: string,
  name: string,
  info: {
    currentYears: number,
    dateOfBirth: Date | string,
    lacrationStatus: string,
    code: string
  },
  statistics: {
    profit: {
      day: number,
      weak: number,
      year: number
    },
    milk: {
      day: number,
      weak: number
    }
  },
  previousOwner: string,
  transportationInfo: any
};

interface DATABASE_USERS_SCHEMA {
  id: number,
  login: string,
  password: string,
  name: string,
  accessLevel: number
}

enum AnimalTypes {
  cow = "COW",
  pig = "PIG"
};

enum LacrationStatuses {
  dry = "DRY"
}

const DATABASE_COWS: DATABASE_COWS_SCHEMA[] = [
  {
    id: 1,
    animalType: AnimalTypes.cow,
    name: "Milka",
    info: {
      currentYears: 5,
      dateOfBirth: '01.10.2015',
      lacrationStatus: LacrationStatuses.dry,
      code: "1qSt92Fp7"
    },
    statistics: {
      profit: {
        day: 325.0,
        weak: 2305.5,
        year: 95710.0
      },
      milk: {
        day: 18,
        weak: 126
      }
    },
    previousOwner: "Stefan Bszizinskiy",
    transportationInfo: "Some transportation info"
  },
  {
    id: 2,
    animalType: AnimalTypes.cow,
    name: "Star",
    info: {
      currentYears: 2,
      dateOfBirth: '15.03.2018',
      lacrationStatus: LacrationStatuses.dry,
      code: "Ko081J5z3"
    },
    statistics: {
      profit: {
        day: 360.5,
        weak: 2500.23,
        year: 88200.0
      },
      milk: {
        day: 21,
        weak: 138
      }
    },
    previousOwner: "Oleg Nimsloy",
    transportationInfo: "Some transportation info"
  }
];

const DATABASE_USERS: DATABASE_USERS_SCHEMA[] = [
  {
    id: 1,
    login: "root1",
    password: "password",
    name: "user1",
    accessLevel: 1
  },
  {
    id: 2,
    login: "root2",
    password: "password",
    name: "user2",
    accessLevel: 2
  },
  {
    id: 3,
    login: "root3",
    password: "password",
    name: "user3",
    accessLevel: 3
  }
];

interface ServerParameters {
  protocol?: string,
  host?: string,
  port?: number
}

class Database {
  private _accessLogin: string = "root";
  private _accessPassword: string = "password";

  private _connections: string[] = []; // rows of connected servers links

  // look at this line below
  private _uri: string = "https://some_database_host.com/?auth=admin&login=root&password=password";

  private _tables: any = {};

  private addConnection(serverInfo: ServerParameters) {
    const serverLink = `${serverInfo.protocol}://${serverInfo.host}:${serverInfo.port}`; // example: http://localhost:3000

    if (this._connections.indexOf(serverLink) === -1) {
      // add new connection if we don`t have this one
      // in our list of connections
      this._connections.push(serverLink);
    } else {
      console.error("This server is already connected to database!");
    }
  }

  private checkConnection(server: Server) {
    return this._connections.indexOf(`${server.parameters.protocol}://${server.parameters.host}:${server.parameters.port}`) === -1;
  }

  get uri(): string {
    return this._uri;
  }

  get connections(): string[] {
    return this._connections;
  }

  get tables(): string[] {
    return Object.keys(this._tables);
  }

  public connect(server: Server, login: string, password: string) {
    if (login == this._accessLogin && password == this._accessPassword) {
      // add new connection to our database
      this.addConnection(server.parameters);
    } else {
      console.error("Incorrect login or password database access data!");
    }
  }

  public registerTable(tableName: string) {
    this._tables[tableName] = [];
  }

  public save(tableName: string, tableData: any): any {
    if (this.tables.indexOf(tableName) === -1) {
      console.error(`Table: ${tableName} doesn't exists in database!`);
      return;
    }

    try {
      this._tables[tableName].push(tableData);
    } catch (err) {
      console.error(err);
    } finally {
      return this._tables[tableName][this._tables[tableName].length] || {};
    }
  }

  public find(server: Server, tableName: string, parameters: any): any {
    if (!this.checkConnection(server)) {
       console.error("Please login!");
       return;
    }

    const data = this.tables[tableName].find(parameters);

    return data;
  }
}

class Client {
  private _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  public sendGetRequest(url: string, queryParams: any, callback: (data: any) => void) {
    const serverResponse: any = this._server.emitGetRequest(url, queryParams);
    callback(serverResponse);
  }
}

class Server {
  private _parameters: ServerParameters;
  private _database: Database = new Database();
  private _listeners: any = {};

  public client: Client = new Client(this);

  constructor(parameters: ServerParameters = {}) { // default localhost
    this._parameters = {
      protocol: parameters.protocol || "http",
      host: parameters.host || "localhost",
      port: parameters.port || 3000
    };
  }

  get parameters(): ServerParameters {
    return this._parameters;
  }

  public findInDatabase(tableName: string, searchParameters: any): any {
    if (!this._database) {
      console.error("Any database was found!");
      return;
    }

    let data: any = this._database.find(this, tableName, searchParameters);

    return data;
  }

  public get(url: string, callback: (req: any, res: any) => void) {
    this._listeners[url] = (queryParams: any) => {
      callback(
        {
          queryParams: queryParams
        },
        {
        send: function(data: any) {
          this.client.response(data);
        }
      });
    }
  }

  public emitGetRequest(url: string, queryParams: any) {
    try {
      this._listeners[url](queryParams);
    } catch (err) {
      console.error(err);
    }
  }

  public useDatabase(database: Database) {
    this._database = database;
  }

  public listen() { // start server method
    const { port, host, protocol } = this._parameters;

    console.log(`Server started on: ${protocol}://${host}:${port}/...`); // example: http://localhost:3000/
  }
}

const SERVER_OPTS = {
  host: 'localhost',
  port: 3000,
  protocol: 'https'
};

const server: Server = new Server(SERVER_OPTS); // backend
const client: Client = server.client; // frontend

const database: Database = new Database();

database.registerTable('cows'); // create cow table in database
database.registerTable('users');

database.save('cows', DATABASE_COWS[0]); // add first cow to database
database.save('cows', DATABASE_COWS[1]); // add second cow to database

database.save('users', DATABASE_USERS[0]); // add user with access level 1
database.save('users', DATABASE_USERS[1]); // add user with access level 2
database.save('users', DATABASE_USERS[2]); // add user with access level 3

database.connect(server, "root", "password"); // login server in database

server.get('/cows', (req, res) => {
  let { login, password } = req.queryParams;

  // get cow info from database
  let cowsInfo: DATABASE_COWS_SCHEMA = server.findInDatabase('cows', { id: 1 });
  // get user info from database
  let userInfo: DATABASE_USERS_SCHEMA = server.findInDatabase('users', { login: login, password: password });

  console.log("cows:", cowsInfo);

  if (!userInfo) {
    res.send({ errMsg: "Incorrect login or password! Please, try again..." });
    return;
  }

  if (userInfo.accessLevel == 2) { // check user access level
    delete cowsInfo.transportationInfo;
  }

  if (userInfo.accessLevel == 3) { // check user access level
    delete cowsInfo.previousOwner;
    delete cowsInfo.statistics;
    delete cowsInfo.transportationInfo;
  }

  res.send({ data: cowsInfo }); // send cows info to client side
});

client.sendGetRequest('/cows', { login: "root1", password: "password" }, (response: any) => {
  // show cow info from server
  console.log("Cows info (1-st level access): ", JSON.stringify(response.data));
});

client.sendGetRequest('/cows', { login: "root2", password: "password" }, (response: any) => {
  // show cow info from server
  console.log("Cows info (2-nd level access): ", JSON.stringify(response.data));
});

client.sendGetRequest('/cows', { login: "root3", password: "password" }, (response: any) => {
  // show cow info from server
  console.log("Cows info (3-th level access): ", JSON.stringify(response.data));
});

server.listen(); // start server

import { createServer, IncomingMessage, ServerResponse } from "http";
import querystring from "querystring";
import fs from "fs";
import path from "path";

/**
 * @typedef {IncomingMessage &{query:object,body:object}} MyRequest 請求
 * @typedef {(req:MyRequest,res:ServerResponse)=>void} RouteCallback 路由回調
 */

const { STATIC_ROOT, ROUTE_BASE_FOLDER, CONTROLLER_BASE_FOLDER, PORT } =
    process.env;

/**
 * Server用以提供服務
 */
export class Server {
    /**
     * 構造函數
     * @param {object} config 配置項
     * @param {string} config.staticRoot 配置項
     * @param {string} config.routeBaseFolder 配置項
     * @param {string} config.controllerBaseFolder 配置項
     */
    constructor({
        staticRoot = STATIC_ROOT || "public",
        routeBaseFolder = ROUTE_BASE_FOLDER || "routes",
        controllerBaseFolder = CONTROLLER_BASE_FOLDER || "controllers",
    } = {}) {
        this.routes = { GET: new Map(), POST: new Map() };
        this.server = createServer(this.handleRequest.bind(this));
        this.staticRoot = staticRoot;
        this.routeBaseFolder = routeBaseFolder;
        this.controllerBaseFolder = controllerBaseFolder;
    }

    /**
     * 注冊GET路由
     * @param {string} pathname 請求路徑
     * @param {RouteCallback} callback 路由回調
     * @returns {Server}
     */
    get = this.createRouteRegister("GET");

    /**
     * 注冊POST路由
     * @param {string} pathname 請求路徑
     * @param {RouteCallback} callback 路由回調
     * @returns {Server}
     */
    post = this.createRouteRegister("POST");

    /**
     * 創建路由注冊器
     * @param {"GET"|"POST"} method 請求方式
     * @returns {(pathname:string,callback:RouteCallback)}
     */
    createRouteRegister(method) {
        return (pathname, callback) => {
            if (!pathname || typeof pathname !== "string")
                throw new Error("Pathname must be a non-empty string");
            if (
                !callback ||
                typeof callback !== "function" ||
                callback.length !== 2
            ) {
                throw new Error(
                    "Callback must be a function receives request and response",
                );
            }
            this.routes[method].set(pathname, callback);
            return this;
        };
    }

    /**
     * 根據請求路徑獲取路由回調函數
     * @param {MyRequest} req 請求對象
     * @returns {RouteCallback}
     */
    getCallback(req) {
        const method = req.method;
        const pathname = new URL(req.url, `http://${req.headers.host}`)
            .pathname;
        return this.routes[method].get(pathname) || this.notFound.bind(this);
    }

    /**
     * 找不到資源
     * @param {MyRequest} req 請求對象
     * @param {ServerResponse} res 響應對象
     */
    notFound(req, res) {
        res.setHeader("content-type", "application/json");
        res.end(
            JSON.stringify({
                code: 404,
                message: `Can't find resource for '${req.url}'`,
            }),
        );
    }

    /**
     * 提取Request的query和body
     * @param {MyRequest} req 請求對象
     */
    assemblyRequest(req) {
        const urlObject = new URL(req.url, `http://${req.headers.host}`);
        let query = Object.fromEntries(urlObject.searchParams.entries());
        req.query = query;
        req.body = {};
        if (req.method == "POST") {
            let chunks = Buffer.alloc(0);
            req.on(
                "data",
                (chunk) => (chunks = Buffer.concat([chunks, chunk])),
            );
            req.on("end", () => {
                const contentType = req.headers["content-type"];
                if (!contentType) return;
                const bodyString = chunks.toString();
                if (contentType.includes("application/json")) {
                    try {
                        req.body = Object.assign(
                            req.body,
                            JSON.parse(bodyString),
                        );
                    } catch (e) {
                        // 啥也別幹
                    }
                } else if (
                    contentType.includes("application/x-www-form-urlencoded")
                ) {
                    req.body = querystring.parse(bodyString);
                }
            });
        }
    }

    /**
     * 從指定目錄加載路由
     * @param {string} folder 路由所在根目錄
     * @returns {Promise<{method:string,pathname:string,callback:RouteCallback}[]>} 結果
     */
    async loadRoutes(folder) {
        folder = folder || this.routeBaseFolder;
        let routes = [];
        if (!fs.existsSync(folder)) return routes;
        let files = fs.readdirSync(folder);

        let filepaths = files.map((f) => path.join(folder, f));
        for (let filepath of filepaths) {
            let stats = fs.statSync(filepath);
            if (stats.isDirectory()) {
                routes = [...routes, ...(await this.loadRoutes(filepath))];
                continue;
            }
            if (stats.isFile()) {
                let method = path.basename(filepath).replace(/\.js$/g, "");
                // 這裏先加載get路由
                if (!"get post".split(/\s+/).includes(method)) continue;
                let module = await import("./" + filepath);
                Object.entries(module).forEach(([fname, callback]) => {
                    routes.push({
                        method,
                        pathname: path
                            .join(path.dirname(filepath), fname)
                            .replace(/\\/g, "/")
                            .replace(this.routeBaseFolder, ""),
                        callback: callback,
                    });
                });
            }
        }
        return routes;
    }

    /**
     * 從指定目錄加載工具
     * @param {string} folder Controller根目錄
     * @returns {Promise<{method:string,pathname:string,callback:(args:{[key:string]:any})=>any}[]>}
     */
    async loadControllers(folder) {
        let controllers = [];
        folder = folder || this.controllerBaseFolder;
        let filepaths = fs
            .readdirSync(folder)
            .map((f) => path.join(folder, f.replace(/\\/g, "/")));
        for (let filepath of filepaths) {
            let stats = fs.statSync(filepath);
            if (stats.isDirectory()) {
                controllers = [
                    ...controllers,
                    ...(await this.loadControllers(filepath)),
                ];
            } else if (stats.isFile()) {
                let method = path.basename(filepath).replace(/\.js$/g, "");
                if (!"get post".split(/\s+/).includes(method)) continue;
                let module = await import("./" + filepath);
                Object.entries(module).forEach(([pathname, callback]) => {
                    controllers.push({
                        method,
                        pathname: path
                            .join(
                                filepath
                                    .replace(this.controllerBaseFolder, "")
                                    .replace(path.basename(filepath), ""),

                                pathname,
                            )
                            .replace(/\\/g, "/"),
                        callback,
                    });
                });
            }
        }
        return controllers;
    }

    /**
     * 嘗試處理靜態資源
     * @param {string} pathname 請求路徑
     * @param {ServerResponse<IncomingMessage>} res 響應對象
     * @returns {Promise<string|boolean>}
     */
    tryStatic(pathname, res) {
        return new Promise((resolve, reject) => {
            if (pathname == "/" || pathname == "")
                return reject("It's not a static request");
            let filepath = path.join(this.staticRoot, pathname.substring(1));
            fs.stat(filepath, (err, stats) => {
                if (err) return reject("Failed to tell filepath info");
                if (!stats.isFile()) return reject("It's not a file");
                res.setHeader("Author", "Your All Mighty Father");
                fs.createReadStream(filepath).pipe(res);
                resolve(true);
            });
        });
    }

    /**
     * 處理請求
     * @param {IncomingMessage} req 請求對象
     * @param {ServerResponse} res 響應對象
     */
    handleRequest(req, res) {
        let urlObject = new URL(req.url, `http://${req.headers.host}`);
        let pathname = urlObject.pathname;
        this.tryStatic(pathname, res).catch((err) => {
            this.assemblyRequest(req);
            let callback = this.getCallback(req);
            setTimeout(callback.bind(this, req, res));
        });
    }

    /**
     * 打印路由信息
     */
    printRoutesInfo() {
        let routeInfos = [];
        for (let method in this.routes)
            for (let key of this.routes[method].keys())
                routeInfos.push(`- [${method}] ${key}`);

        routeInfos.forEach((line) => console.log(line));
    }

    async loadExtralRoutes() {
        let [routes, controllers] = await Promise.all([
            this.loadRoutes(),
            this.loadControllers(),
        ]);

        routes.forEach((r) => this[r.method](r.pathname, r.callback));
        controllers.forEach((c) => {
            this[c.method](c.pathname, (req, res) => {
                let data = c.method == "get" ? req.query : req.body;
                res.setHeader("content-type", "application/json");
                let result = { code: 400 };
                try {
                    result = c.callback.call(this, data, req.headers);
                    result = { code: 200, result };
                } catch (e) {
                    result = Object.assign(result, { reason: e });
                }
                res.end(JSON.stringify(result));
            });
        });
        this.printRoutesInfo();
    }
    /**
     * 啓動服務
     */
    async start() {
        await this.loadExtralRoutes();
        this.server.listen(PORT, () => {
            console.log(`Server running at ${PORT}`);
        });
    }

    async getloadedRoutes() {
        let result = await this.loadRoutes();
        return result;
    }
}

export const server = new Server();

server.get("/calculate", (req, res) => {
    let { a, b } = req.query;
    if (!a || !b) {
        return res.end(
            JSON.stringify({
                success: false,
                message: "Both a and b are required",
            }),
        );
    }

    try {
        a = parseInt(a);
        b = parseInt(b);
        if (isNaN(a) || isNaN(b)) {
            throw new Error("Either a or b is not a number");
        }
        return res.end(
            JSON.stringify({
                success: true,
                message: "success",
                result: a + b,
            }),
        );
    } catch (e) {
        return res.end(JSON.stringify({ success: false, message: e.message }));
    }
});

server.get("/data", (req, res) => {
    const username = req.body.username || "Demo";
    const data = {
        message: `My name is ${username}`,
    };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(data));
});

export const tool = {
    async getData(username, { host = "localhost", port = 8822 } = {}) {
        const headers = {
            "content-type": "application/json",
        };
        const response = await fetch(`http://${host}:${port}/data`, {
            method: "POST",
            headers,
            body: JSON.stringify({ username }),
        });
        const result = await response.json();
        return result;
    },
    async calculate(a, b, { host = "localhost", port = 8822 } = {}) {
        const url = `http://${host}:${port}/calculate?a=${a}&b=${b}`;
        const response = await fetch(url);
        const result = await response.json();
        return result;
    },
};

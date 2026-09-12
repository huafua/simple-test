import process from "process";
import http from "http";
import path from "path";
import fs from "fs";
import querystring from "querystring";

/**
 * @typedef {{code:number,message:string,data?:any}} WrappedResponse
 */

/**
 * 請求，增强http.IncomingMessage,添加了query對象，但此處只用於類型定義 *
 */
export class MyRequest extends http.IncomingMessage {
    constructor() {
        super();
        this.query = {};
        this.body = {};
    }
}

/**
 * 響應，增强http.ServerResponse，添加了json和redirect方法，但此處只用於類型定義
 */
export class MyResponse extends http.ServerResponse {
    constructor() {
        super();
    }
    /**
     * 輸出為json
     * @param {object|string|boolean|number} o
     */
    json(o) {}
    /**
     * 重定向
     * @param {string} url 要重定向的地址
     */
    redirect(url) {}
}

/**
 * 路由回調函數
 * @param {MyRequest} req  請求對象
 * @param {MyResponse} res 響應對象
 */
export function RouteCallback(req, res) {}

/**
 * @typedef {(req:MyRequest,res:MyResponse)=>void} RouteCallback 路由回調函數
 */

export class WebServer {
    /**
     * 構造函數
     * @param {object} config 配置項
     * @param {number} config.port 監聽端口
     * @param {string} config.staticRoot 靜態目錄
     * @param {string} config.apiFolder 路由目錄
     */
    constructor({
        port = process.env.PORT,
        staticRoot = "www",
        apiFolder = "apis",
    } = {}) {
        if (!port || typeof port != "number")
            throw new Error("Port must be a number");
        if (!staticRoot || typeof staticRoot != "string")
            throw new Error("StaticRoot must be a string");
        this.port = port;
        this.staticRoot = staticRoot;
        this.apiFolder = apiFolder;
        this.init();
    }

    init() {
        this.routes = new Map();
        this.routes.set("GET", new Map());
        this.routes.set("POST", new Map());
        this.server = http.createServer(this.handleRequest.bind(this));
        /**
         * 一個用於管理路由文件與請求類型的映射
         */
        this.mapping = {
            "get.js": "get",
            "post.js": "post",
        };
    }

    /**
     * 注冊GET請求
     * @param {string} pathname 請求路徑
     * @param {RouteCallback} callback 路由回調函數
     */
    get = this.createRouteRegister("GET");
    post = this.createRouteRegister("POST");

    /**
     * 創建路由注冊工具
     * @param {"GET"|"POST"} method 請求方法，僅先GET和POST
     * @returns {(pathname:string,callback:RouteCallback)=>WebServer}
     */
    createRouteRegister(method) {
        return (pathname, callback) => {
            if (!this.routes.get(method)) return this;
            if (!pathname || typeof pathname !== "string")
                throw new Error("Pathname must be a non-empty string");
            if (!callback || typeof callback !== "function")
                throw new Error(
                    "Callback must be a function receives request and response",
                );
            let routesByMethod = this.routes.get(method);
            if (routesByMethod.has(pathname)) return this;
            routesByMethod.set(pathname, callback);
            return this;
        };
    }

    /**
     * 根據request對應的路由回調函數
     * @param {MyRequest} req 請求對象
     * @returns {RouteCallback}
     */
    getCallback(req) {
        if (!req) throw new Error("Req is not a valid Request");
        let urlObject = new URL(req.url, `http://${req.headers.host}`);
        let pathname = urlObject.pathname;
        if (!this.routes.has(req.method)) return this.notFound.bind(this);
        let routeByMethod = this.routes.get(req.method);
        if (!routeByMethod.has(pathname)) return this.notFound.bind(this);
        return routeByMethod.get(pathname);
    }

    /**
     * 找不到資源
     * @param {MyRequest} req 請求對象
     * @param {MyResponse} res 響應對象
     */
    notFound(req, res) {
        res.json({
            code: 404,
            message: `Can't found resource for ${req.url}`,
        });
    }

    /**
     * 根據文件路徑猜測其mime類型
     * @param {string} filepath 文件路徑
     * @returns {string}
     */
    guessContentType(filepath) {
        let ext = path.extname(filepath);
        return (
            {
                ".css": "text/css",
                ".html": "text/html",
                ".json": "application/json",
                ".js": "text/javascript",
                ".txt": "text/plain",
                ".jpg": "image/jpg",
                ".png": "image/png",
            }[ext] || "application/octet-stream"
        );
    }

    /**
     * 處理請求
     * @param {MyRequest} req 請求對象
     * @param {MyResponse} res 響應對象
     */
    async handleRequest(req, res) {
        let urlObject = new URL(req.url, `http://${req.headers.host}`);
        let filepath = path.join(
            this.staticRoot,
            urlObject.pathname.substring(1),
        );
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            res.setHeader("Content-type", this.guessContentType(filepath));
            return fs.createReadStream(filepath).pipe(res);
        }
        req.query = Object.fromEntries([...urlObject.searchParams]);
        let contentType = req.headers["content-type"];
        if ((req.method == "POST" || req.method == "GET") && contentType) {
            let chunks = Buffer.alloc(0);
            req.on("data", (chunk) => {
                chunks = Buffer.concat([chunks, chunk]);
            });
            req.on("end", () => {
                let result = {};
                let bodyString = chunks.toString();
                if (contentType.includes("application/json")) {
                    try {
                        result = JSON.parse(bodyString);
                    } catch (e) {}
                } else if (
                    contentType.includes("application/x-www-form-urlencoded")
                ) {
                    result = querystring.parse(bodyString);
                }
                req.body = result;
            });
        }
        res.json = (o) => {
            res.setHeader("Content-type", "application/json");
            res.end(JSON.stringify(o));
        };
        res.redirect = (url) => {
            res.setHeader("Location", url);
            res.writeHead(302, "Temporarily moved");
            return res.end();
        };

        let callback = this.getCallback(req);
        setImmediate(() => callback.call(this, req, res));
    }

    /**
     * 加載ApiFolder中的路由
     * @deprecated 已過期，推薦使用{@link loadApiFolderNew}
     */
    async loadApiFolder() {
        let routes = await this.listRoutes();
        return routes.forEach((item) => this.get(item.pathname, item.callback));
    }

    /**
     * 加載ApiFolder中的路由
     */
    async loadApiFolderNew() {
        let routes = await this.listRoutesNew();
        return routes.forEach((item) => {
            this[item.method].call(this, item.pathname, item.callback);
        });
    }

    /**
     * 列舉路由
     * @param {string?} folder 要掃描的路由所在目錄
     * @returns {Promise<{method:string,pathname:string,callback:RouteCallback}[]>}
     */
    async listRoutesNew(folder) {
        let allFiles = [];
        if (!folder) folder = this.apiFolder;
        if (!fs.existsSync(folder)) return allFiles;
        let files = fs.readdirSync(folder);
        for (let file of files) {
            file = path.join(folder, file);
            if (fs.statSync(file).isDirectory()) {
                allFiles = [...allFiles, ...(await this.listRoutesNew(file))];
                continue;
            }
            let basename = path.basename(file).toLowerCase();
            if (!(basename in this.mapping)) return allFiles;
            let method = this.mapping[basename];
            let p =
                "/" + file.replace(/\\/g, "/").replace(/\/(get|post)\.js/g, "");
            let a = await import("./" + file.replace(/\\/g, "/"));
            for (let name in a) {
                let pathname = (p + "/" + name)
                    .replace(/([A-Z])/g, "_$1")
                    .toLowerCase()
                    .replace(this.apiFolder + "/", "");
                let callback = a[name];
                if (typeof name != "string" || typeof callback !== "function") {
                    console.warn(`The value for ${name} is not a function`);
                    continue;
                }
                allFiles.push({
                    method,
                    pathname,
                    callback,
                });
            }
        }
        return allFiles;
    }

    /**
     * 從指定目錄加載路由
     * @param {string} folder
     * @returns {Promise<{pathname:string,callback:RouteCallback}[]>}
     * @deprecated 已過期，求見使用{@link listRoutesNew}
     */
    async listRoutes(folder) {
        let allFiles = [];
        if (!folder) folder = this.apiFolder;
        if (!fs.existsSync(folder)) return allFiles;
        let files = fs.readdirSync(folder);
        for (let file of files) {
            file = path.join(folder, file);
            if (fs.statSync(file).isDirectory()) {
                allFiles = [...allFiles, ...(await this.listRoutes(file))];
                continue;
            }
            if (!file.endsWith(".js")) return allFiles;
            let p = "/" + file.replace(/\\/g, "/").replace(/\.js/g, "");
            let a = await import("./" + file.replace(/\\/g, "/"));
            for (let name in a) {
                let pathname = (p + "/" + name)
                    .replace(/([A-Z])/g, "_$1")
                    .toLowerCase()
                    .replace(this.apiFolder + "/", "");
                let callback = a[name];
                if (typeof name != "string" || typeof callback !== "function") {
                    console.warn(`The value for ${name} is not a function`);
                    continue;
                }
                allFiles.push({
                    pathname,
                    callback,
                });
            }
        }
        return allFiles;
    }

    /**
     * 啓動服務
     */
    start() {
        this.loadApiFolderNew().then(() => {
            let methods = [...this.routes.keys()];
            let i = 1;
            methods.forEach((method) => {
                let keys = [...this.routes.get(method).keys()];
                keys.forEach((key) => {
                    console.log(`\x1b[33m- ${i++} ${key} [${method}]\x1b[0m `);
                });
            });
            this.server.listen(this.port, () =>
                console.log(`\x1b[36mServer running at ${this.port}\x1b[0m`),
            );
        });
    }
}

/**
 * 成功
 * @param {any} data 數據
 * @returns {WrappedResponse}
 */
export function ok(data) {
    return {
        code: 200,
        message: "Successfully handled",
        data,
    };
}

/**
 * 錯誤
 * @param {Error|string} error 錯誤對象
 * @returns {WrappedResponse}
 */
export function error(error) {
    return {
        code: 500,
        message: error.Message,
    };
}

/**
 * 失敗
 * @param {string} message 失敗消息
 * @returns {WrappedResponse}
 */
export function fail(message) {
    return {
        code: 400,
        message,
    };
}

/**
 * 找不到在資源
 * @returns {WrappedResponse}
 */
export function notFound() {
    return {
        code: 404,
        message: "Not found",
    };
}

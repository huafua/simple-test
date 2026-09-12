import { createServer, IncomingMessage, ServerResponse } from "http";
import querystring from "querystring";

/**
 * @typedef {IncomingMessage &{query:object,body:object}} MyRequest 請求
 */

/**
 * Server用以提供服務
 */
class Server {
    constructor() {
        this.routes = { GET: {} };
        this.server = createServer(this.handleRequest.bind(this));
    }

    /**
     * 注冊GET路由
     * @param {string} pathname 請求路徑
     * @param {(req:MyRequest,res:ServerResponse)=>void} callback 路由回調
     * @returns {Server}
     */
    get(pathname, callback) {
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
        this.routes.GET[pathname] = callback;
        return this;
    }

    /**
     * 根據請求路徑獲取路由回調函數
     * @param {string} pathname 請求路徑
     * @returns {(req:MyRequest,res:ServerResponse)=>void}
     */
    getCallback(pathname) {
        return this.routes.GET[pathname] || this.notFound.bind(this);
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
        let chunks = Buffer.alloc(0);
        req.on("data", (chunk) => (chunks = Buffer.concat([chunks, chunk])));
        req.on("end", () => {
            const contentType = req.headers["content-type"];
            if (!contentType) return;
            const bodyString = chunks.toString();
            if (contentType.includes("application/json")) {
                try {
                    req.body = JSON.parse(bodyString);
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

    /**
     * 處理請求
     * @param {IncomingMessage} req 請求對象
     * @param {ServerResponse} res 響應對象
     */
    handleRequest(req, res) {
        let urlObject = new URL(req.url, `http://${req.headers.host}`);
        let pathname = urlObject.pathname;
        this.assemblyRequest(req);
        let callback = this.getCallback(pathname);
        setTimeout(callback.bind(this, req, res));
    }

    /**
     * 啓動服務
     */
    start() {
        const PORT = process.env.PORT || 8822;
        this.server.listen(PORT, () =>
            console.log(`Server running at ${PORT}`),
        );
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
        return res.end(
            JSON.stringify({
                success: false,
                message: e.message,
            }),
        );
    }
});

server.get("/data", (req, res) => {
    const username = req.body.username || "Demo";
    res.setHeader("content-type", "application/json");
    res.end(
        JSON.stringify({
            message: `My name is ${username}`,
        }),
    );
});

export const tool = {
    async getData(username, { host = "localhost", port = 8822 } = {}) {
        const response = await fetch(`http://${host}:${port}/data`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        const result = await response.json();
        return result;
    },
    async calculate(a, b, { host = "localhost", port = 8822 } = {}) {
        const response = await fetch(
            `http://${host}:${port}/calculate?a=${a}&b=${b}`,
        );
        const result = await response.json();
        return result;
    },
};

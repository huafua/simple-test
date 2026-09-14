import { ServerResponse, IncomingMessage } from "http";
/**
 *
 * @param {import("../../core").MyRequest} req 請求對象
 * @param {ServerResponse<IncomingMessage>} res 響應對象
 */
export function info(req, res) {
    res.setHeader("content-type", "text/plain");
    res.end("hello world");
}

/**
 *
 * @param {import("../../core").MyRequest} req 請求對象
 * @param {ServerResponse} res 響應對象
 */
export function demo(req, res) {
    res.end("demo");
}

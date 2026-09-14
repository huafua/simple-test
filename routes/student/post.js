import { ServerResponse } from "http";
/**
 *
 * @param {import("../../core").MyRequest} req 請求對象
 * @param {ServerResponse} res 響應對象
 */
export function create(req, res) {
    res.setHeader("Content-type", "application/json");
    res.end(
        JSON.stringify({
            code: 200,
        }),
    );
}

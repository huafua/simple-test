import { MyRequest, MyResponse, ok } from "../../server.js";

/**
 * 加法
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function addTwoNumbers(req, res) {
    let { a, b } = req.body;
    res.json(ok(a + b));
}

/**
 * 減法
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function subtractTwoNumbers(req, res) {
    let { a, b } = req.body;
    res.json(ok(a - b));
}

/**
 * 乘法
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function multiplyTwoNumbers(req, res) {
    let { a, b } = req.body;
    res.json(ok(a * b));
}

/**
 * 除法
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function divideTwoNumbers(req, res) {
    let { a, b } = req.body;
    res.json(ok(a / b));
}

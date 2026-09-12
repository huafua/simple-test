import { MyRequest, MyResponse, ok, fail, notFound } from "../../server.js";
import students from "../../data.js";
/**
 *
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function hello(req, res) {
    res.json({ code: 200, message: "hello hello" });
}

/**
 * 根據Id獲取學生資料
 * @param {MyRequest} req
 * @param {MyResponse} res
 */
export function getStudentById(req, res) {
    let id = req.query.id;
    let student = students.find((s) => s.id == id);
    let resData = notFound();
    if (student) resData = ok(student);

    res.json(resData);
}

/**
 * 獲取全部學生資料
 * @param {MyRequest} req 請求對象
 * @param {MyResponse} res 響應對象
 */
export function getAllStudents(req, res) {
    res.json(ok(paginate(students, req.query)));
}

/**
 * 獲取指定範圍年齡的學生資料
 * @param {MyRequest} req 請求對象
 * @param {MyResponse} res 響應對象
 */
export function getStudentsByAgeRange(req, res) {
    let { min, max } = req.query;
    if (!min || !max) return res.json(fail("Both min and max are required"));
    let foundStudents = students.filter((s) => s.age >= min && s.age <= max);
    if (!foundStudents) return res.json(notFound());
    let sortedStudents = foundStudents.sort((x, y) => -x.age + y.age);
    res.json(ok(paginate(sortedStudents, req.query)));
}

/**
 * 查詢，請求參數為by和val，分別表示根據字段查詢指定值的學生資料
 * @param {MyRequest} req 請求獨享
 * @param {MyResponse} res 響應對象
 */
export function getStudents(req, res) {
    let { by, val } = req.query;
    if (!by || !val) return res.json(fail("Both by and val are required"));
    let foundStudents = students.filter((s) => s[by] == val);
    if (!foundStudents) return res.json(notFound());
    res.json(ok(paginate(foundStudents, req.query)));
}

/**
 * 分頁輔助函數
 * @param {any[]} array 原始陣列
 * @param {object} query 請求查詢參數
 * @returns {{ items: any[], total: number, page: number, limit: number, totalPages: number }}
 */
function paginate(array = [], query = {}) {
    let page = parseInt(query.page, 10);
    let limit = parseInt(query.limit, 10);

    if (isNaN(page) || page < 1) {
        page = 1;
    }
    if (isNaN(limit) || limit < 1) {
        limit = 10;
    }

    const total = array.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = array.slice(startIndex, endIndex);

    return {
        items,
        total,
        page,
        limit,
        totalPages,
    };
}

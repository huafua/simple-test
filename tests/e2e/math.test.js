import { describe, it } from "node:test";
import assert from "node:assert";

const baseUrl = "http://localhost:8888/math";

/**
 * 計算
 * @param {"add"|"subtract"|"multiply"|"divide"} algrithm 算法
 * @param {number} a  計算參數1
 * @param {number} b  計算參數2
 * @returns {Promise<number>}
 */
async function doCalculate(algrithm, a, b) {
    const response = await fetch(`${baseUrl}/${algrithm}_two_numbers`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ a, b }),
    });
    const result = await response.json();
    return result.data;
}

describe("Mathematical algrithom tests", () => {
    it("22 plus 21 should be 43", async () => {
        let result = await doCalculate("add", 22, 21);
        assert.equal(result, 43);
    });

    it("22 subtract 20 should be 2", async () => {
        let result = await doCalculate("subtract", 22, 20);
        assert.equal(result, 2);
    });

    it("22 multiply 20 should be 440", async () => {
        let result = await doCalculate("multiply", 22, 20);
        assert.equal(result, 440);
    });

    it("22 divide 20 should be 1.1", async () => {
        let result = await doCalculate("divide", 22, 20);
        assert.equal(result, 1.1);
    });
});

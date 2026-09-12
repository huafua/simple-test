import { describe, it } from "node:test";
import assert from "node:assert";

describe("remote calculation", () => {
    it("22 plus 21 should be 43", async () => {
        let response = await fetch(
            `http://localhost:${process.env.PORT}/calculate?a=22&b=21`,
        );
        let result = await response.json();
        assert.equal(result.result, 43);
    });
});

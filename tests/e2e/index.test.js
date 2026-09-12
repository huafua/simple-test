import { describe, it } from "node:test";
import assert from "node:assert";

import { tool } from "../../core.js";

describe("remote calculation", () => {
    const { calculate, getData } = tool;
    it("22 plus 21 should be 43", async () => {
        let result = await calculate(22, 21);
        assert.equal(result.result, 43);
    });

    it("It should respond 'My name is Thomas'", async () => {
        let result = await getData("Thomas");
        assert.equal(result.message, "My name is Thomas");
    });
});

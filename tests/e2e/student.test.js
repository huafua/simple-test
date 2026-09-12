import { describe, it } from "node:test";
import assert from "node:assert";

describe("Student query and some tests", () => {
    it("hello", async () => {
        let response = await fetch(
            "http://localhost:8888/student/get_all_students",
        );
        let result = await response.json();
        assert.equal(result.data.items.length, 10);
    });
});

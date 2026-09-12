import { createServer } from "http";

createServer((req, res) => {
    const urlObject = new URL(req.url, `http://${req.headers.host}`);
    let pathname = urlObject.pathname;
    let { a, b } = Object.fromEntries(urlObject.searchParams.entries());
    res.setHeader("content-type", "application/json");
    if (pathname == "/calculate") {
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
    }
    res.end(
        JSON.stringify({
            success: false,
            message: "left undone",
        }),
    );
}).listen(process.env.PORT, () =>
    console.log(`Server running at ${process.env.PORT}`),
);

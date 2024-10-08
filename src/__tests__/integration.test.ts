import express, { Express, RequestHandler } from "express";
import request from "supertest";

import msgpack from "..";

const unpacked = { hello: "world" };
const raw = Buffer.from([129, 165, 104, 101, 108, 108, 111, 165, 119, 111, 114, 108, 100]);
const packed = raw.toString("utf8");

const createApp = (middleware: RequestHandler): Express => {
	const app = express();
	app.use(express.json());
	app.use(middleware);
	app.get("/api", (_, res) => {
		res.json(unpacked);
	});
	app.post("/api", (req, res) => {
		res.json(req.body);
	});
	return app;
};

describe("expressMsgpack", () => {
	let app: Express;

	describe("default settings", () => {
		beforeEach(() => {
			app = createApp(msgpack());
		});

		describe("get", () => {
			it("returns regular JSON by default", () => {
				return request(app)
					.get("/api")
					.expect("Content-Type", /^application\/json/)
					.expect(200, unpacked);
			});

			it("returns messagepack if requested", () => {
				return request(app)
					.get("/api")
					.set("Accept", "application/msgpack")
					.expect("Content-Type", /^application\/msgpack/)
					.expect(200)
					.then((response) => {
						expect(response.text).toEqual(packed);
					});
			});

			it("rejects unsupported requests", () => {
				return request(app)
					.get("/api")
					.set("Accept", "text/html")
					.expect(406);
			});
		});

		describe("post", () => {
			it("receives regular JSON by default", () => {
				return request(app)
					.post("/api")
					.send(unpacked)
					.expect("Content-Type", /^application\/json/)
					.expect(200, unpacked);
			});

			it("returns messagepack if requested", () => {
				return request(app)
					.post("/api")
					.send(raw)
					.set("Accept", "application/msgpack")
					.set("Content-Type", "application/msgpack")
					.expect("Content-Type", /^application\/msgpack/)
					.expect(200)
					.then((response) => {
						expect(response.text).toEqual(packed);
					});
			});

			it("can cross over", () => {
				return request(app)
					.post("/api")
					.send(raw)
					.set("Accept", "application/json")
					.set("Content-Type", "application/msgpack")
					.expect("Content-Type", /^application\/json/)
					.expect(200, unpacked);
			});

			it("rejects unsupported requests", () => {
				return request(app)
					.get("/api")
					.set("Accept", "text/html")
					.expect(406);
			});
		});
	});

	describe("with alternative MIME type", () => {
		const mimeType = "application/x-msgpack";

		beforeEach(() => {
			app = createApp(msgpack({ mimeType }));
		});

		it("handles messagepack", () => {
			return request(app)
				.post("/api")
				.send(raw)
				.set("Accept", mimeType)
				.set("Content-Type", mimeType)
				.expect("Content-Type", new RegExp(`^${mimeType}`))
				.expect(200)
				.then((response) => {
					expect(response.text).toEqual(packed);
				});
		});
	});

	describe("with a request limit", () => {
		it("accepts appropriate requests", () => {
			return request(createApp(msgpack({ limit: "16b" })))
				.post("/api")
				.send(raw)
				.set("Content-Type", "application/msgpack")
				.expect(200);
		});

		it("rejects oversized requests", () => {
			return request(createApp(msgpack({ limit: "1b" })))
				.post("/api")
				.send(raw)
				.set("Content-Type", "application/msgpack")
				.expect(413);
		});
	});
});

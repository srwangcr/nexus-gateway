import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import jwt from 'jsonwebtoken';

import type { AuthenticatedRequest } from '../../src/core/interfaces/request.interface.js';
import { errorHandler, AppError } from '../../src/middlewares/error.handler.js';

async function startServer(app: express.Express): Promise<{ url: string; close: () => Promise<void> }> {
	const server = app.listen(0);
	await new Promise((resolve) => server.once('listening', resolve));
	const { port } = server.address() as AddressInfo;

	return {
		url: `http://127.0.0.1:${port}`,
		close: () => new Promise((resolve) => server.close(() => resolve())),
	};
}

test('authMiddleware rejects requests without token', async () => {
	const previousSecret = process.env.JWT_SECRET;
	process.env.JWT_SECRET = 'test-secret';

	try {
		const { authMiddleware } = await import('../../src/middlewares/auth.middleware.js');

		const app = express();
		app.get('/secure', authMiddleware, (_req, res) => {
			res.status(200).json({ ok: true });
		});
		app.use(errorHandler);

		const server = await startServer(app);

		const res = await fetch(`${server.url}/secure`);
		assert.equal(res.status, 401);

		await server.close();
	} finally {
		process.env.JWT_SECRET = previousSecret;
	}
});

test('authMiddleware allows valid token and sets user', async () => {
	const previousSecret = process.env.JWT_SECRET;
	process.env.JWT_SECRET = 'test-secret';

	try {
		const { authMiddleware } = await import('../../src/middlewares/auth.middleware.js');

		const app = express();
		app.get('/secure', authMiddleware, (req, res) => {
			const request = req as AuthenticatedRequest;
			res.json({ userId: request.user?.id });
		});
		app.use(errorHandler);

		const token = jwt.sign(
			{ sub: 'user-1', email: 'user@example.com', role: 'admin', permissions: ['*'] },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' },
		);

		const server = await startServer(app);

		const res = await fetch(`${server.url}/secure`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		assert.equal(res.status, 200);

		const body = await res.json();
		assert.equal(body.userId, 'user-1');

		await server.close();
	} finally {
		process.env.JWT_SECRET = previousSecret;
	}
});

test('errorHandler returns AppError status and message', async () => {
	const app = express();
	app.get('/boom', () => {
		throw new AppError('boom', 418, true);
	});
	app.use(errorHandler);

	const server = await startServer(app);

	const res = await fetch(`${server.url}/boom`);
	assert.equal(res.status, 418);

	const body = await res.json();
	assert.equal(body.message, 'boom');
	assert.equal(body.statusCode, 418);

	await server.close();
});

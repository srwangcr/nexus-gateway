import test from 'node:test';
import assert from 'node:assert/strict';

import {
	TokenBucket,
	SlidingWindow,
	calculateExponentialBackoff,
} from '../../src/core/algorithms/rate-limit.logic.js';

test('calculateExponentialBackoff returns value within expected range', () => {
	const attempt = 2;
	const base = 100 * 2 ** attempt;
	const value = calculateExponentialBackoff(attempt);

	assert.ok(value >= base);
	assert.ok(value <= base + 99);
});

test('TokenBucket consumes and refills over time', () => {
	const originalNow = Date.now;
	let now = 0;
	Date.now = () => now;

	try {
		const bucket = new TokenBucket(2, 1);

		assert.equal(bucket.consume(), true);
		assert.equal(bucket.consume(), true);
		assert.equal(bucket.consume(), false);

		now = 1000;
		assert.equal(bucket.consume(), true);
	} finally {
		Date.now = originalNow;
	}
});

test('SlidingWindow enforces limits and resets after window', () => {
	const originalNow = Date.now;
	let now = 0;
	Date.now = () => now;

	try {
		const window = new SlidingWindow(2, 1);

		assert.equal(window.isAllowed('client-1'), true);
		assert.equal(window.isAllowed('client-1'), true);
		assert.equal(window.isAllowed('client-1'), false);

		now = 1001;
		assert.equal(window.isAllowed('client-1'), true);
	} finally {
		Date.now = originalNow;
	}
});

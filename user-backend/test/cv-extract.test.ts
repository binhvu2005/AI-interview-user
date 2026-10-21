import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { extractCVText } from '../src/services/cv.service';

// cv-sample.pdf was printed from HTML by Chrome, like a CV exported from a browser or Google Docs.
const sample = fs.readFileSync(path.join(__dirname, 'fixtures', 'cv-sample.pdf'));
const file = (buffer: Buffer, mimetype: string) => ({ buffer, mimetype, originalname: 'cv' } as Express.Multer.File);

test('extractCVText reads the text layer of a PDF instead of its binary bytes', async () => {
  const text = await extractCVText(file(sample, 'application/pdf'));
  assert.match(text, /KỸ NĂNG\s+Node\.js, PostgreSQL, Redis, Kafka/);
  assert.doesNotMatch(text, /%PDF|\u0000/);
});

test('extractCVText returns plain text files as they are', async () => {
  assert.equal(await extractCVText(file(Buffer.from('Kỹ năng: React', 'utf-8'), 'text/plain')), 'Kỹ năng: React');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, finalizeEvaluation, getCheatPenalty } from '../src/utils/evaluation-score';
import { extractJSON } from '../src/services/ai.service';

const breakdown = (v: number) => ({ technical: v, problemSolving: v, coding: v, communication: v, architectureAndFit: v });

test('totalScore is the weighted breakdown on a 0-100 scale, ignoring any model-provided total', () => {
  const result = finalizeEvaluation({ breakdown: breakdown(8), totalScore: 12, decision: 'REJECT' }, 'mid', 0, 'vi');
  assert.equal(result.totalScore, 80);
  assert.equal(result.decision, 'HIRE');
});

test('technical below 5 forces REJECT regardless of the other scores', () => {
  const result = finalizeEvaluation({ breakdown: { ...breakdown(10), technical: 4 } }, 'senior', 0, 'en');
  assert.equal(result.decision, 'REJECT');
  assert.equal(decide(95, 4.9), 'REJECT');
});

test('decision mapping boundaries', () => {
  assert.equal(decide(85, 9), 'STRONG HIRE');
  assert.equal(decide(84, 9), 'HIRE');
  assert.equal(decide(70, 9), 'HIRE');
  assert.equal(decide(69, 9), 'WEAK HIRE');
  assert.equal(decide(60, 9), 'WEAK HIRE');
  assert.equal(decide(59, 9), 'REJECT');
});

test('cheat penalty: below threshold is noise, above it deducts and adds a neutral note', () => {
  assert.deepEqual(getCheatPenalty(2), { tabSwitches: 2, flagged: false, penalty: 0 });
  assert.equal(getCheatPenalty(50).penalty, 20);

  const result = finalizeEvaluation({ breakdown: breakdown(8), cons: ['a'] }, 'mid', 4, 'vi');
  assert.equal(result.totalScore, 72);
  assert.equal(result.integrity.flagged, true);
  assert.match(result.cons[0], /4 lần/);
  // Skill scores are not touched by the integrity penalty.
  assert.equal(result.breakdown.communication, 8);
});

test('malformed model values are clamped and sanitised', () => {
  const result = finalizeEvaluation({
    breakdown: { technical: '7', problemSolving: 99, coding: -3, communication: 'abc' },
    pros: ['x', '', 3, 'y'],
    detailedFeedback: [{ question: 'q', score: 15, status: 'great' }],
  }, 'mid', 0, 'en');
  assert.deepEqual(result.breakdown, { technical: 7, problemSolving: 10, coding: 0, communication: 0, architectureAndFit: 0 });
  assert.deepEqual(result.pros, ['x', 'y']);
  assert.equal(result.detailedFeedback[0].score, 10);
  assert.equal(result.detailedFeedback[0].status, 'incorrect');
});

test('extractJSON returns null for truncated or non-JSON output instead of echoing raw text', () => {
  assert.equal(extractJSON('{"feedback": "abc", "nextQuestion": "trunc'), null);
  assert.equal(extractJSON('Sorry, I cannot help'), null);
  // Truncated output whose last complete piece is an inner object must not be accepted.
  assert.equal(extractJSON('{"breakdown":{"technical":7},"detailedFeedback":[{"q":"Q1"},{"q":"Q2"},{"q":"Q3","sco'), null);
  assert.deepEqual(extractJSON('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJSON('Here: {"a":{"b":2}} done'), { a: { b: 2 } });
  // Code fences inside string values (the debug question) must survive.
  const snippet = 'Xem code:\n```js\nx()\n```';
  assert.equal(extractJSON(JSON.stringify({ q: snippet })).q, snippet);
  assert.equal(extractJSON('```json\n' + JSON.stringify({ q: snippet }) + '\n```').q, snippet);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import ms from 'milsymbol';
import {
  symbolCatalog,
  symbolCode,
  defaultSettings,
  identities,
  echelons,
  symbolCategories,
} from '../data/symbology/catalog';
import { rankQuizItems } from '../data/ranks/learning';
import { rankCountries, rankServices, rankRows } from '../data/ranks/model';
import { generateQuiz } from '../data/quiz/engine';
import type { QuizItem } from '../data/quiz/engine';
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
void test('every symbol has a unique identifier, a description, a reference and a valid rendering', () => {
  assert.equal(
    new Set(symbolCatalog.map((r) => r.id)).size,
    symbolCatalog.length,
  );
  for (const r of symbolCatalog) {
    assert(r.description.length > 40);
    assert(r.reference);
    assert.equal(symbolCode(r).length, 30);
    assert(new ms.Symbol(symbolCode(r), { standard: 'APP6' }).isValid(), r.id);
  }
});
void test('corps, function, HQ and status remain separate; reference examples ignore builder state', () => {
  const unit = symbolCatalog.find((r) => r.id === 'unspecified')!;
  const code = symbolCode(unit, {
    ...defaultSettings,
    echelon: '22',
    modifier: '2',
    status: '1',
  });
  const s = new ms.Symbol(code, { standard: 'APP6' }).getMetadata();
  assert.equal(s.echelon, 'Corps/MEF');
  assert.equal(s.headquarters, true);
  assert.equal(s.functionid, '0000000000');
  assert(s.notpresent);
  for (const r of symbolCatalog.filter(
    (r) => !['functions', 'aviation'].includes(r.category),
  ))
    assert.equal(
      symbolCode(r),
      symbolCode(r, {
        identity: '6',
        echelon: '24',
        modifier: '6',
        status: '1',
      }),
    );
});
void test('all exposed builder combinations render without invalid paths', () => {
  for (const r of symbolCatalog.filter((r) =>
    ['functions', 'aviation'].includes(r.category),
  ))
    for (const identity of identities)
      for (const echelon of echelons)
        for (const modifier of ['0', '2', '4', '6', '1']) {
          assert(
            new ms.Symbol(
              symbolCode(r, {
                identity: identity.code,
                echelon: echelon.code,
                modifier,
                status: '1',
              }),
              { standard: 'APP6' },
            ).isValid(),
            `${r.id}/${identity.code}/${echelon.code}/${modifier}`,
          );
        }
});
void test('rank learning records cover the entire collection without inventing missing artwork', () => {
  assert.equal(
    rankQuizItems.length,
    rankRows.flatMap((r) => Object.values(r.cells).filter(Boolean)).length,
  );
  assert(rankQuizItems.every((i) => i.description && i.context && i.link));
  assert(
    rankQuizItems
      .filter((i) => i.country === 'NCC' && i.category?.startsWith('ano'))
      .every((i) => !i.image),
  );
});
function validate(items: QuizItem[]) {
  for (let seed = 1; seed <= 20; seed++) {
    const questions = generateQuiz(items, 10, seeded(seed));
    assert(questions.length > 0);
    assert.equal(
      new Set(questions.map((q) => q.item.id)).size,
      questions.length,
    );
    for (const q of questions) {
      assert.equal(q.options.length, 6);
      assert.equal(new Set(q.options.map((o) => o.name)).size, 6);
      assert.equal(q.options.filter((o) => o.id === q.item.id).length, 1);
      assert(q.options.every((o) => o.pool === q.item.pool));
      if (q.kind === 'image') assert(q.item.image);
    }
  }
}
void test('six-choice rank quizzes stay within each question’s country and service across every filter', () => {
  validate(rankQuizItems);
  for (const country of Object.keys(rankCountries))
    for (const service of rankServices)
      validate(
        rankQuizItems.filter(
          (i) => i.country === country && i.service === service,
        ),
      );
});
void test('every symbol topic produces six-choice questions with both image and text prompts', () => {
  const items = symbolCatalog.map((r) => ({
    id: r.id,
    name: r.name,
    context: r.category,
    pool: r.category,
    description: r.description,
    image: symbolCode(r),
    link: '/symbols',
  }));
  for (const category of Object.keys(symbolCategories)) {
    const filtered = items.filter((r) => r.pool === category);
    validate(filtered);
    const kinds = new Set(generateQuiz(filtered).map((q) => q.kind));
    assert.equal(kinds.size, 2);
  }
});
void test('insufficient pools cannot fabricate options; ambiguous images become text questions', () => {
  assert.deepEqual(generateQuiz(rankQuizItems.slice(0, 3)), []);
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    name: `Entry ${i}`,
    context: 'test',
    pool: 'test',
    description: `Description ${i}`,
    image: 'same.svg',
    link: '/',
  }));
  assert(generateQuiz(items).every((q) => q.kind === 'description'));
});

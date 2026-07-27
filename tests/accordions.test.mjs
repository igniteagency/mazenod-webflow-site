import assert from 'node:assert/strict';
import test from 'node:test';

import { openDefaultAccordion } from '../src/components/accordions.ts';

function createParent(attributeValue, itemCount = 3) {
  const items = Array.from({ length: itemCount }, () => ({ open: false }));

  return {
    items,
    parent: {
      getAttribute: () => attributeValue,
      querySelectorAll: () => items,
    },
  };
}

test('opens the indexed accordion when the parent attribute is present', () => {
  const { items, parent } = createParent('2');

  openDefaultAccordion(parent);

  assert.deepEqual(
    items.map(({ open }) => open),
    [false, true, false]
  );
});

test('defaults to the first accordion when the parent attribute has no value', () => {
  const { items, parent } = createParent('');

  openDefaultAccordion(parent);

  assert.deepEqual(
    items.map(({ open }) => open),
    [true, false, false]
  );
});

test('does not open an accordion when the parent attribute is absent', () => {
  const { items, parent } = createParent(null);

  openDefaultAccordion(parent);

  assert.deepEqual(
    items.map(({ open }) => open),
    [false, false, false]
  );
});

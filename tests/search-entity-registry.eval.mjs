import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function loadRegistry() {
  const source = fs.readFileSync(path.resolve('search-entity-registry.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'search-entity-registry.js' });
  return sandbox.window.SEARCH_ENTITY_REGISTRY;
}

const registry = loadRegistry();

assert.equal(typeof registry.version, 'string');
assert(Array.isArray(registry.entities), 'entities should be an array');
assert(registry.entities.length > 0, 'entities should not be empty');

const entityIds = registry.entities.map((entry) => entry.entityId);
assert.equal(entityIds.length, new Set(entityIds).size, 'entity ids should be unique');

const requiredEntities = [
  'disney-imagination-garden',
  'wayfinder-bay',
  'baymax-cinemas',
  'concierge-lounge',
  'concierge-sundeck-pool',
  'walt-disney-theatre',
  'pics-photo-shop',
  'disney-cruise-line-photos',
  'photo-unlimited-package'
];

requiredEntities.forEach((entityId) => {
  const entry = registry.entities.find((item) => item.entityId === entityId);
  assert(entry, `missing required entity: ${entityId}`);
  assert.equal(typeof entry.officialNameEn, 'string');
  assert(entry.officialNameEn.trim().length > 0, `${entityId} officialNameEn should not be empty`);
  assert.equal(typeof entry.displayNameZh, 'string');
  assert(entry.displayNameZh.trim().length > 0, `${entityId} displayNameZh should not be empty`);
  assert(entry.translationType === 'official' || entry.translationType === 'site-localized');
  assert(entry.sourceAuthority === 'official' || entry.sourceAuthority === 'trusted-secondary');
  assert(Array.isArray(entry.aliases), `${entityId} aliases should be an array`);
  assert(Array.isArray(entry.categoryFamilies), `${entityId} categoryFamilies should be an array`);
  assert(Array.isArray(entry.capabilityTags), `${entityId} capabilityTags should be an array`);
  assert(Array.isArray(entry.sourceUrls) && entry.sourceUrls.length > 0, `${entityId} should have sourceUrls`);
});

const entityMap = new Map(registry.entities.map((entry) => [entry.entityId, entry]));
registry.entities.forEach((entry) => {
  (entry.relatedEntityIds || []).forEach((relatedId) => {
    assert(entityMap.has(relatedId), `${entry.entityId} has unresolved relatedEntityId ${relatedId}`);
  });
});

Object.entries(registry.bindings || {}).forEach(([groupName, bindings]) => {
  Object.entries(bindings || {}).forEach(([bindingKey, binding]) => {
    assert(Array.isArray(binding.entityRefs), `${groupName}:${bindingKey} should have entityRefs`);
    binding.entityRefs.forEach((entityId) => {
      assert(entityMap.has(entityId), `${groupName}:${bindingKey} has unresolved entityRef ${entityId}`);
    });
    (binding.supportForEntityRefs || []).forEach((entityId) => {
      assert(entityMap.has(entityId), `${groupName}:${bindingKey} has unresolved supportForEntityRef ${entityId}`);
    });
  });
});

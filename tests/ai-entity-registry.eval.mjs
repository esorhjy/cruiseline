import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function loadRegistry() {
  const source = fs.readFileSync(path.resolve('ai-entity-registry.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'ai-entity-registry.js' });
  return sandbox.window.AI_ENTITY_REGISTRY;
}

const registry = loadRegistry();

assert.equal(typeof registry.version, 'string');
assert(Array.isArray(registry.entities), 'entities should be an array');

const entityIds = registry.entities.map((entry) => entry.entityId);
assert.equal(entityIds.length, new Set(entityIds).size, 'entity ids should be unique');

const requiredEntities = [
  'disney-imagination-garden',
  'wayfinder-bay',
  'baymax-cinemas',
  'concierge-lounge',
  'concierge-sundeck-pool',
  'walt-disney-theatre',
  'gramma-talas-kitchen',
  'mowglis-eatery',
  'duffy-and-friends-shop',
  'royal-society-for-friendship-and-tea'
];

requiredEntities.forEach((entityId) => {
  const entry = registry.entities.find((item) => item.entityId === entityId);
  assert(entry, `missing required entity: ${entityId}`);
  assert.equal(typeof entry.officialNameEn, 'string');
  assert.equal(typeof entry.displayNameZh, 'string');
  assert(entry.officialNameEn.trim().length > 0, `${entityId} officialNameEn should not be empty`);
  assert(entry.displayNameZh.trim().length > 0, `${entityId} displayNameZh should not be empty`);
  assert(entry.translationType === 'official' || entry.translationType === 'site-localized');
  assert(entry.sourceAuthority === 'official' || entry.sourceAuthority === 'trusted-secondary');
  assert(Array.isArray(entry.sourceUrls) && entry.sourceUrls.length >= 1, `${entityId} should have sourceUrls`);
  assert(Array.isArray(entry.categoryFamilies), `${entityId} should have categoryFamilies`);
  assert(Array.isArray(entry.capabilityTags), `${entityId} should have capabilityTags`);
});

const entityMap = new Map(registry.entities.map((entry) => [entry.entityId, entry]));
const validCategoryFamilies = new Set(['場館', '表演', '餐廳', '快餐', '商店', '遊戲', '泳池', '兒童俱樂部', '酒廊', 'Spa / 健身', '服務', '活動']);
const validCapabilityTags = new Set(['swim', 'eat', 'drink', 'watch-show', 'kids-play', 'rest', 'shop', 'spa']);

registry.entities.forEach((entry) => {
  (entry.relatedEntityIds || []).forEach((relatedId) => {
    assert(entityMap.has(relatedId), `${entry.entityId} has unresolved relatedEntityId ${relatedId}`);
  });
  (entry.categoryFamilies || []).forEach((label) => {
    assert(validCategoryFamilies.has(label), `${entry.entityId} has invalid category family ${label}`);
  });
  (entry.capabilityTags || []).forEach((capabilityId) => {
    assert(validCapabilityTags.has(capabilityId), `${entry.entityId} has invalid capability tag ${capabilityId}`);
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

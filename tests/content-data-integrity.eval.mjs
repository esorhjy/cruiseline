import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function loadData() {
  const source = fs.readFileSync(path.resolve('data.js'), 'utf8');
  const wrapped = `${source}\nmodule.exports = { cruiseSchedule, deckGuideData, showGuideData, playbookGuideData };`;
  const sandbox = {
    module: { exports: {} },
    exports: {}
  };
  vm.runInNewContext(wrapped, sandbox, { filename: 'data.js' });
  return sandbox.module.exports;
}

function loadRegistry() {
  const source = fs.readFileSync(path.resolve('search-entity-registry.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'search-entity-registry.js' });
  return sandbox.window.SEARCH_ENTITY_REGISTRY;
}

function assertText(value, label) {
  assert.equal(typeof value, 'string', `${label} should be a string`);
  assert(value.trim().length > 0, `${label} should not be empty`);
}

function assertUniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(ids.length, new Set(ids).size, `${label} ids should be unique`);
}

const data = loadData();
const registry = loadRegistry();

assertUniqueIds(data.cruiseSchedule, 'cruiseSchedule');
data.cruiseSchedule.forEach((day) => {
  assertText(day.id, 'schedule day id');
  assertText(day.tabTitle, `${day.id} tabTitle`);
  assertText(day.dateTitle, `${day.id} dateTitle`);
  assert(Array.isArray(day.goals), `${day.id} goals should be an array`);
  assert(Array.isArray(day.periods) && day.periods.length > 0, `${day.id} should have periods`);
  day.periods.forEach((period, periodIndex) => {
    assertText(period.name, `${day.id}:${periodIndex} period name`);
    assert(Array.isArray(period.events) && period.events.length > 0, `${day.id}:${periodIndex} should have events`);
    period.events.forEach((event, eventIndex) => {
      assertText(event.time, `${day.id}:${periodIndex}:${eventIndex} event time`);
      assertText(event.title, `${day.id}:${periodIndex}:${eventIndex} event title`);
      assert(Array.isArray(event.desc) && event.desc.length > 0, `${day.id}:${periodIndex}:${eventIndex} event desc should not be empty`);
    });
  });
});

assertUniqueIds(data.deckGuideData, 'deckGuideData');
data.deckGuideData.forEach((deck) => {
  assertText(deck.id, 'deck id');
  assertText(deck.label, `${deck.id} label`);
  assertText(deck.title, `${deck.id} title`);
  assertText(deck.theme, `${deck.id} theme`);
  assertText(deck.tripFocus, `${deck.id} tripFocus`);
  assert(Array.isArray(deck.badges), `${deck.id} badges should be an array`);
  assert(Array.isArray(deck.facilities) && deck.facilities.length > 0, `${deck.id} facilities should not be empty`);
  deck.facilities.forEach((facility, facilityIndex) => {
    assertText(facility.icon, `${deck.id}:${facilityIndex} icon`);
    assertText(facility.name, `${deck.id}:${facilityIndex} name`);
    assertText(facility.summary, `${deck.id}:${facilityIndex} summary`);
    assertText(facility.bestTime, `${deck.id}:${facilityIndex} bestTime`);
    assertText(facility.tripUse, `${deck.id}:${facilityIndex} tripUse`);
    assert.equal(typeof facility.highlight, 'boolean', `${deck.id}:${facilityIndex} highlight should be boolean`);
  });
});

assertUniqueIds(data.showGuideData, 'showGuideData');
data.showGuideData.forEach((group) => {
  assertText(group.id, 'show group id');
  assertText(group.title, `${group.id} title`);
  assertText(group.icon, `${group.id} icon`);
  assertText(group.intro, `${group.id} intro`);
  assert(Array.isArray(group.shows) && group.shows.length > 0, `${group.id} shows should not be empty`);
  group.shows.forEach((show, showIndex) => {
    assertText(show.name, `${group.id}:${showIndex} name`);
    assertText(show.theme, `${group.id}:${showIndex} theme`);
    assertText(show.location, `${group.id}:${showIndex} location`);
    assertText(show.timingTip, `${group.id}:${showIndex} timingTip`);
    assertText(show.tripLink, `${group.id}:${showIndex} tripLink`);
  });
});

assertUniqueIds(data.playbookGuideData, 'playbookGuideData');
data.playbookGuideData.forEach((mission) => {
  assertText(mission.id, 'playbook mission id');
  assertText(mission.label, `${mission.id} label`);
  assertText(mission.intro, `${mission.id} intro`);
  assert(Array.isArray(mission.items) && mission.items.length > 0, `${mission.id} items should not be empty`);
  mission.items.forEach((item, itemIndex) => {
    assertText(item.title, `${mission.id}:${itemIndex} title`);
    assertText(item.icon, `${mission.id}:${itemIndex} icon`);
    assert(['official', 'concierge', 'community'].includes(item.sourceType), `${mission.id}:${itemIndex} sourceType should be recognized`);
    assertText(item.whenToUse, `${mission.id}:${itemIndex} whenToUse`);
    assertText(item.action, `${mission.id}:${itemIndex} action`);
    assertText(item.tripFit, `${mission.id}:${itemIndex} tripFit`);
    assertText(item.caution, `${mission.id}:${itemIndex} caution`);
  });
});

const dataKeys = {
  deckFacilities: new Set(data.deckGuideData.flatMap((deck) => deck.facilities.map((_, index) => `${deck.id}:${index}`))),
  shows: new Set(data.showGuideData.flatMap((group) => group.shows.map((_, index) => `${group.id}:${index}`))),
  scheduleEvents: new Set(data.cruiseSchedule.flatMap((day) =>
    day.periods.flatMap((period, periodIndex) =>
      period.events.map((_, eventIndex) => `${day.id}:${periodIndex}:${eventIndex}`)
    )
  )),
  playbookItems: new Set(data.playbookGuideData.flatMap((mission) => mission.items.map((_, index) => `${mission.id}:${index}`)))
};

Object.entries(registry.bindings || {}).forEach(([groupName, bindings]) => {
  const knownKeys = dataKeys[groupName];
  assert(knownKeys, `registry binding group ${groupName} should be known`);
  Object.keys(bindings || {}).forEach((bindingKey) => {
    assert(knownKeys.has(bindingKey), `${groupName}:${bindingKey} should point to an existing data card`);
  });
});

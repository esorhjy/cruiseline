import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const data = vm.runInNewContext(fs.readFileSync('data.js', 'utf8') + '\n({cruiseSchedule, deckGuideData, showGuideData, playbookGuideData})');
const sandbox = {window: {}};
for (const file of ['journey-presentation-data.js', 'menu-lookup-data.js']) {
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
}
const display = sandbox.window.JOURNEY_PRESENTATION_DATA;
const events = data.cruiseSchedule.flatMap(day => day.periods.flatMap(period => period.events));
const cards = [...data.deckGuideData.flatMap(deck => deck.facilities), ...data.showGuideData.flatMap(group => group.shows), ...data.playbookGuideData.flatMap(group => group.items)];
const knownCards = new Set(cards.map(card => card.id));
const menuIds = new Set(sandbox.window.MENU_LOOKUP_DATA.restaurants.map(item => item.id));
const confirmed = ['search-schedule-day1-2-0', 'search-schedule-day2-4-0', 'search-schedule-day3-4-0', 'search-schedule-day3-royal-gathering'];
assert.deepEqual(Object.keys(display.events).sort(), Array.from(events, event => event.id).sort());
assert.deepEqual(Object.entries(display.events).filter(([, value]) => value.status === 'confirmed').map(([id]) => id).sort(), confirmed.sort());
const checkMenus = options => options.forEach(option => {
    assert(menuIds.has(option.id), `existing restaurant filter: ${option.id}`);
    assert(option.label);
});
events.forEach(event => {
    const item = display.events[event.id];
    assert(item.shortTitle && item.location);
    assert(['confirmed', 'reserved', 'pending'].includes(item.status));
    assert(item.shortTitle.length <= 25, 'short title, not another paragraph: ' + event.id);
    assert(item.essentialNote.length <= 100, 'essential reminder stays concise: ' + event.id);
    item.targets.forEach(target => assert(knownCards.has(target.id), 'exact target exists: ' + target.id));
    checkMenus(item.menu || []);
    if (item.status === 'confirmed') assert.match(event.desc.join(' '), /已確認|通知確認/);
});
Object.entries(display.menusByCard).forEach(([cardId, options]) => {
    assert(knownCards.has(cardId));
    assert.equal(new Set(options.map(option => option.id)).size, options.length);
    checkMenus(options);
});
const view = id => display.events['search-schedule-' + id];
assert.equal(view('day1-2-1').targets[0].id, 'search-deck-deck5-0', 'generic theatre must not arbitrarily select Remember');
assert.equal(view('day3-moana').targets[0].id, 'search-show-open-air-night-0');
assert.equal(view('day3-moana').status, 'pending');
assert.equal(view('day1-1-3').status, 'pending', 'mandatory attendance does not confirm its time');
assert.equal(view('day4-0-0').status, 'reserved', 'numeric times do not confirm a booking');
assert.match(view('day1-1-3').essentialNote, /全員必到/);
assert.match(view('day1-1-0').essentialNote, /不是託管.*3–10.*如廁/);
assert.match(view('day1-1-2').essentialNote, /成人監督.*4–8.*122.*不穿水鞋/);
assert.match(view('day2-3-1').essentialNote, /11–14.*僅小寶/);
for (const [id, menu, target] of [
    ['day1-2-0', 'animator', 'search-deck-deck9-animators-table'],
    ['day2-4-0', 'pixar', 'search-deck-deck6-0'],
    ['day3-4-0', 'nav', 'search-deck-deck8-3']
]) {
    assert.match(view(id).essentialNote, /15 分鐘/);
    assert.equal(view(id).menu[0].id, menu);
    assert.equal(view(id).targets[0].id, target);
    assert.equal(display.menusByCard[target][0].id, menu);
}
assert.equal(display.menusByCard['search-deck-deck17-2'].length, 4, 'composite food card must let readers choose');
const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
assert(html.indexOf('journey-presentation-data.js') < html.indexOf('<script src="script.js'));
assert(sw.includes("'journey-presentation-data.js'"));
console.log('Journey presentation: all 38 events, 4 confirmed bookings, exact destinations, safety notes and menu filters passed.');

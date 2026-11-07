import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}};
vm.createContext(context);
for (const file of ['data.js','onboard-lookup-data.js','explore-presentation-data.js']) vm.runInContext(fs.readFileSync(file,'utf8'), context);
const {deckGuideData:decks,showGuideData:shows,playbookGuideData:missions} = vm.runInContext('({deckGuideData,showGuideData,playbookGuideData})',context);
const p=context.window.EXPLORE_PRESENTATION;
const equalIds=(map,items)=>assert.deepEqual(Object.keys(map).sort(),Array.from(items,item=>item.id).sort());
equalIds(p.facilities,decks.flatMap(d=>d.facilities));
equalIds(p.shows,shows.flatMap(g=>g.shows));
equalIds(p.playbook,missions.flatMap(m=>m.items));
assert.equal(p.topics.length,7);
for (const item of Object.values(p.playbook)) {
    assert(p.topics.some(topic=>topic.id===item.topic));
    assert(item.title.length<=26 && item.preview.length<=70);
}
assert.equal(p.playbook['search-playbook-daily-ops-3'].topic,'dining');
assert.equal(p.playbook['search-playbook-concierge-plus-6'].topic,'shows-photos');
assert.equal(p.playbook['search-playbook-stateroom-family-4'].topic,'daily');
for (const mapping of [...Object.values(p.facilities),...Object.values(p.shows),...p.venues]) {
    for (const id of mapping.deckIds || []) assert(decks.some(deck=>deck.id===id));
    assert(['forward','mid','aft','unknown'].includes(mapping.area));
}
const raw=context.window.ONBOARD_LOOKUP_DATA.records;
const groups=p.groupActivities(raw);
assert.equal(groups.reduce((sum,g)=>sum+g.records.length,0),550);
assert.equal(new Set(groups.flatMap(g=>g.records.map(r=>r.id))).size,550);
const dLounge=groups.filter(g=>g.record.venueEnglish==='D Lounge');
assert(dLounge.length && dLounge.every(g=>!g.venue.deckIds.length),'no guessed D Lounge deck');
assert(p.shows['search-show-garden-shows-1'].locationStatus==='possible');
const base={id:'a',englishName:'Bingo',venueEnglish:'Edge',audience:'11–14',participation:'activity'};
assert.equal(p.groupActivities([base,{...base,id:'b',sourceTimeHint:'later'},{...base,id:'c',audience:'All ages'},{...base,id:'d',participation:'registration'},{...base,id:'e',feeNote:'Paid'}]).length,4);
const allIds=new Set([...Object.keys(p.facilities),...Object.keys(p.playbook),...Object.keys(p.shows)]);
for (const links of Object.values(p.related)) for (const id of links) assert(allIds.has(id));
assert(fs.readFileSync('sw.js','utf8').includes("'explore-presentation-data.js'"));
console.log('Explore mapping: 45 facilities, 8 shows, 41 tips, 7 topics and all 550 activity records preserved.');

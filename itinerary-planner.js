// Local overlays only. Never mutate the published itinerary or its booking facts.
window.ITINERARY_PLANNER = (() => {
    const STORAGE_KEY = 'dcl_itinerary_draft_v1';
    const FORMAT = 'dcl-itinerary-draft';
    const TRIP = 'disney-adventure-2027-01-25';
    const MAX_BYTES = 262144;
    const fields = ['candidate', 'time', 'position', 'backup'];
    const clone = value => JSON.parse(JSON.stringify(value));
    const plain = value => value && typeof value === 'object' && !Array.isArray(value);
    const hash = value => {
        let h = 2166136261;
        for (const char of JSON.stringify(value)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
        return (h >>> 0).toString(16).padStart(8, '0');
    };
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const text = value => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    function candidates({decks, shows, registry, presentation, explore, lookup}) {
        const result = [{id:'rest', kind:'rest', title:'休息／自由活動', location:'自行安排', note:'不代表新增船方預約。', essentialNote:'', targets:[], menu:[], source:'家庭自訂'}];
        const entities = new Map(registry.entities.map(e => [e.entityId, e]));
        const seen = new Set();
        const splitMenus = {
            'spellbound':['bev-spellbound'], 'buccaneer-bar':['bev-buccaneer'],
            'garden-bar':['bev-garden'], 'taverna-portorosso':['bev-taverna'],
            'pixar-market-restaurant':['pixar'], 'pizza-planet':['pizza-planet'],
            'wheezys-freezies':['wheezy-soft-serve','bev-wheezy'], 'jetfinity-bar':['bev-infinity']
        };
        decks.forEach(deck => deck.facilities.forEach(card => {
            const refs = (registry.bindings.deckFacilities[card.bindingKey]?.entityRefs || []).filter(ref => entities.get(ref)?.entityType !== 'tip');
            refs.forEach(ref => {
                if (seen.has(ref)) return;
                seen.add(ref);
                const e = entities.get(ref);
                if (!e) return;
                const meta = explore.facilities[card.id] || {};
                const restaurant = ['restaurant','quick-service','lounge'].includes(e.entityType);
                const menus = presentation.menusByCard[card.id] || [];
                result.push({id:'entity:'+ref, kind:restaurant?'restaurant':'facility',
                    title:refs.length === 1 ? (meta.title || e.displayNameZh) : e.displayNameZh,
                    english:e.officialNameEn, aliases:e.aliases || [],
                    location:[(meta.deckIds || [deck.id]).map(id => id.replace('deck','Deck ')).join('／'), e.area || '分區依船內指標'].join(' · '),
                    note:[meta.essential, text(card.summary), text(card.tripUse)].filter(Boolean).join(' '),
                    essentialNote:meta.essential || (ref.includes('concierge') ? '禮賓權益依各房資格；開放與供應查當日通知。' : '開放、資格與費用依當日確認；詳情請看地點卡。'),
                    targets:[{id:card.id,label:'查看地點與限制'}],
                    menu:refs.length === 1 ? menus : menus.filter(m => (splitMenus[ref] || []).includes(m.id)),
                    source:card.sourceNote || '本站船上探索；開放與資格依當航次確認'});
            });
        }));
        shows.forEach(group => group.shows.forEach(card => {
            const refs = registry.bindings.shows?.[card.bindingKey]?.entityRefs || [];
            const options = refs.map(ref => entities.get(ref)).filter(e => e?.entityType === 'show');
            (options.length ? options : [null]).forEach(e => result.push({
                id:e ? 'show:'+e.entityId : 'show:'+card.id, kind:'activity',
                title:e?.displayNameZh || text(card.name), english:e?.officialNameEn || text(card.name),
                location:card.location, note:text(card.timingTip), source:card.sourceNote || '本站表演導覽',
                essentialNote:'場次與入場方式待確認；加入草案不代表已預約。',
                targets:[{id:card.id,label:'查看表演與入場規則'}], menu:[]
            }));
        }));
        explore.groupActivities(lookup.records).forEach(group => {
            const r = group.record;
            result.push({id:'activity:'+r.id, kind:'activity', title:r.zhLabel, english:r.englishName,
                aliases:r.aliases || [], location:[group.venue.label, r.venueEnglish, r.deckHint].filter(Boolean).join(' · '),
                note:[r.audience || '參加資格待確認',r.participationNote,r.feeNote,'收錄不代表本航次開放或已預約。'].filter(Boolean).join(' '),
                essentialNote:[r.audience || '參加資格待確認',r.participationNote,r.feeNote,'場次未確認，尚未預約。'].filter(Boolean).join(' '),
                source:'本站活動文件整理（歷史航次）；場次、資格與費用查 Navigator',
                targets:[{id:group.id,label:'查看活動資格與來源'}], menu:[]});
        });
        return result;
    }

    function create({schedule, presentation, options}) {
        if (schedule.some(day=>day.periods.some(period=>period.events.some(event=>!presentation.events?.[event.id])))) {
            throw Error('行程確認狀態對照不完整，暫停編輯以保護正式安排。');
        }
        const catalog = new Map(options.map(c => [c.id,c]));
        const originals = new Map();
        schedule.forEach(day => day.periods.forEach((period, pi) => period.events.forEach((event, ei) => {
            const display = presentation.events[event.id] || {shortTitle:text(event.title), status:'pending',targets:[]};
            const values = {candidate:'original', time:display.timeLabel || event.time,
                position:{dayId:day.id,periodIndex:pi,rank:ei*100},backup:false};
            const bases = {candidate:hash([event.title,event.desc,display]),time:hash([event.time,display.timeLabel,display.status]),
                position:hash([values.position,schedule.map(d=>[d.id,d.periods.map(p=>p.name)])]),backup:hash(false)};
            originals.set(event.id,{event,display,values,bases,
                protected:display.status === 'confirmed' || event.id === 'search-schedule-day1-1-3'});
        })));
        const baseVersion = hash([...originals].map(([id,o])=>[id,o.bases]));
        const empty = () => ({format:FORMAT,schemaVersion:1,tripId:TRIP,baseVersion,edits:{}});
        function validate(data) {
            if (!plain(data) || data.format !== FORMAT || data.schemaVersion !== 1 || data.tripId !== TRIP || !plain(data.edits)
                || typeof data.baseVersion !== 'string' || !/^[a-f0-9]{8}$/.test(data.baseVersion)) throw Error('不是支援的本次航程草案檔，或版本不相容。');
            if (Object.keys(data).some(k=>!['format','schemaVersion','tripId','baseVersion','edits'].includes(k))) throw Error('草案含有不支援的欄位。');
            if (Object.keys(data.edits).length > 100) throw Error('草案項目過多。');
            for (const [id, edits] of Object.entries(data.edits)) {
                if (!/^search-schedule-[a-z0-9-]+$/.test(id) || !plain(edits) || Object.keys(edits).some(f=>!fields.includes(f))) throw Error('草案行程或欄位格式不正確。');
                for (const [field, change] of Object.entries(edits)) {
                    if (!plain(change) || Object.keys(change).sort().join() !== 'base,value' || typeof change.base !== 'string' || !/^[a-f0-9]{8}$/.test(change.base)) throw Error('草案缺少有效的原始版本。');
                    const v = change.value;
                    if (field === 'candidate' && (typeof v !== 'string' || !/^[a-z0-9:-]{1,160}$/.test(v))) throw Error('地點識別格式不正確。');
                    if (field === 'time' && (typeof v !== 'string' || !v.trim() || v.length > 80 || /[\u0000-\u001f\u007f]/.test(v))) throw Error('時段需為 1–80 字。');
                    if (field === 'backup' && typeof v !== 'boolean') throw Error('備案設定不正確。');
                    if (field === 'position' && (!plain(v) || Object.keys(v).sort().join() !== 'dayId,periodIndex,rank' || !/^day[1-4]$/.test(v.dayId) || !Number.isInteger(v.periodIndex) || v.periodIndex < 0 || v.periodIndex > 10 || !Number.isFinite(v.rank) || Math.abs(v.rank)>1000000)) throw Error('移動位置格式不正確。');
                }
            }
            return clone(data);
        }
        function parse(raw) {
            if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BYTES) throw Error('檔案超過 256 KB，請選擇本工具匯出的 JSON。');
            try { return validate(JSON.parse(raw)); }
            catch (error) { throw Error(error instanceof SyntaxError ? '檔案不是有效的 JSON，原草案未變更。' : error.message); }
        }
        function conflicts(draft) {
            const list=[];
            for (const [id,edits] of Object.entries(draft.edits)) for (const [field,change] of Object.entries(edits)) {
                const o=originals.get(id);
                const missing = !o || (field==='candidate' && change.value!=='original' && !catalog.has(change.value))
                    || (field==='position' && !schedule.find(d=>d.id===change.value.dayId)?.periods[change.value.periodIndex]);
                if (missing || (change.base !== o.bases[field] && !same(change.value,o.values[field]))) list.push({id,field,missing,reason:missing?'原項目或候選已不存在，請移除此變更。':'正式資料的同一欄已更新，請選擇採用哪一版。'});
            }
            return list;
        }
        function effective(draft, {preview=false}={}) {
            const blocked=new Set(conflicts(draft).filter(c=>!preview || c.missing).map(c=>c.id+':'+c.field));
            const days=schedule.map(d=>({...d,periods:d.periods.map(p=>({...p,events:[]}))}));
            for (const [id,o] of originals) {
                const values=clone(o.values), changes=draft.edits[id] || {};
                const applied=[];
                for (const [f,c] of Object.entries(changes)) if (!blocked.has(id+':'+f)) {values[f]=clone(c.value);applied.push(f);}
                const candidate=catalog.get(values.candidate);
                const display={...o.display, timeLabel:values.time};
                if (candidate) Object.assign(display,{shortTitle:candidate.title,location:candidate.location,
                    essentialNote:candidate.essentialNote,targets:candidate.targets,menu:candidate.menu});
                if (applied.length) display.status=values.backup?'backup':'draft';
                const target=days.find(d=>d.id===values.position.dayId).periods[values.position.periodIndex];
                target.events.push({...o.event,local:{values,changed:applied.length>0,protected:o.protected,display},rank:values.position.rank});
            }
            days.forEach(d=>d.periods.forEach(p=>p.events.sort((a,b)=>a.rank-b.rank)));
            return days;
        }
        function edit(draft,id,values,acknowledged=false) {
            const o=originals.get(id);
            if (!o) throw Error('找不到原行程。');
            if (conflicts(draft).length) throw Error('請先處理正式版本衝突。');
            if (o.protected && !acknowledged) throw Error('請先確認：這只修改家庭草案，不更改船方預約或免除安全演練。');
            const next=clone(draft), entry={};
            for (const f of fields) if (!same(values[f],o.values[f])) entry[f]={base:o.bases[f],value:clone(values[f])};
            if (Object.keys(entry).length) next.edits[id]=entry; else delete next.edits[id];
            next.baseVersion=baseVersion;
            validate(next);
            if (conflicts(next).length) throw Error('候選或位置已變更，請重新選擇。');
            return next;
        }
        function resolve(draft, choices) {
            const next=clone(draft);
            for (const c of conflicts(next)) {
                const choice=choices[c.id+':'+c.field];
                if (choice==='official') delete next.edits[c.id][c.field];
                else if (choice==='draft' && !c.missing) next.edits[c.id][c.field].base=originals.get(c.id).bases[c.field];
                else throw Error('每一項版本衝突都需要先選擇。');
            }
            for (const [id,entry] of Object.entries(next.edits)) if (!Object.keys(entry).length) delete next.edits[id];
            next.baseVersion=baseVersion;
            return validate(next);
        }
        return {empty,parse,validate,conflicts,effective,edit,resolve,originals,catalog,baseVersion};
    }
    return {STORAGE_KEY,MAX_BYTES,candidates,create};
})();

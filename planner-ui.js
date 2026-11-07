// A separate local draft controller; publishing still happens through the project.
window.createItineraryPlannerUI = function ({model, schedule, onChange, escapeHtml:esc}) {
    const KEY=window.ITINERARY_PLANNER.STORAGE_KEY;
    const clone=value=>JSON.parse(JSON.stringify(value));
    let draft=model.empty(), savedRaw=null, invalidRaw=null, storageProblem='', externalChange=false;
    let editingDay=null, undo=[], trigger=null, previousOverflow='', returnFocusId=null;
    try {
        savedRaw=localStorage.getItem(KEY);
        if (savedRaw) {try {draft=model.parse(savedRaw);} catch(error) {invalidRaw=savedRaw;storageProblem=error.message;}}
    } catch {storageProblem='瀏覽器不允許讀取本機資料。';}
    const dialog=document.createElement('dialog');
    dialog.id='planner-dialog'; dialog.className='planner-dialog'; dialog.setAttribute('aria-labelledby','planner-title');
    document.body.append(dialog);
    function status() {
        const count=Object.keys(draft.edits).length, conflicts=model.conflicts(draft).length;
        const el=document.getElementById('planner-status');
        el.hidden=!(count || storageProblem || externalChange || conflicts);
        el.textContent=[count ? `本機草案 · ${count} 段調整，正式行程未變更。` : '',
            conflicts ? `${conflicts} 個欄位與正式版本不同，暫顯示正式內容，請核對版本。` : '',
            externalChange ? '另一個分頁已更新草案；請先匯出此頁，再載入最新草案。' : '',
            storageProblem ? `未能安全儲存：${storageProblem} 請先匯出備份。` : count ? '已儲存本機，沒有自動同步。' : '',
            conflicts || storageProblem || externalChange ? '請從「調整行程 → 草案與備份」處理。' : ''].filter(Boolean).join(' ');
    }
    function save(next, {force=false,focusEventId=null}={}) {
        if (invalidRaw!==null && !force) throw Error('舊記錄無法讀取；請先匯出原記錄，再明確重設。');
        let raw;
        try {raw=localStorage.getItem(KEY);} catch {raw=savedRaw;}
        if (raw!==savedRaw) {externalChange=true;status();throw Error('另一分頁有更新，請先匯出此頁，再載入最新草案。');}
        undo.push(clone(draft)); if (undo.length>20) undo.shift();
        draft=clone(next); invalidRaw=null; externalChange=false;
        try {const raw=JSON.stringify(draft);localStorage.setItem(KEY,raw);savedRaw=raw;storageProblem='';}
        catch {storageProblem='本次改動只留在這個分頁，重新整理可能遺失。';}
        if(focusEventId) editingDay=model.effective(draft).find(d=>d.periods.some(p=>p.events.some(e=>e.id===focusEventId)))?.id || editingDay;
        onChange({focusEventId});status();
    }
    function close() {dialog.close();}
    dialog.addEventListener('close',()=>{
        document.body.style.overflow=previousOverflow;
        const target=(returnFocusId && document.getElementById(returnFocusId)) || (trigger?.isConnected && trigger)
            || document.querySelector('.day-container:not([hidden]) [data-planner-action="toggle"]');
        if (target?.isConnected) target.focus({preventScroll:true});
        returnFocusId=null;
    });
    function show(title,body,submitLabel,submit) {
        if (!dialog.open) {trigger=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
        dialog.innerHTML=`<form id="planner-form"><header class="planner-heading"><h2 id="planner-title">${esc(title)}</h2><button type="button" data-planner-close aria-label="關閉行程調整">關閉</button></header><div class="planner-body">${body}<p id="planner-error" role="alert"></p></div><footer class="planner-footer"><button type="button" data-planner-close>取消</button>${submitLabel?`<button type="submit" class="planner-primary">${esc(submitLabel)}</button>`:''}</footer></form>`;
        dialog.querySelectorAll('[data-planner-close]').forEach(b=>b.onclick=close);
        dialog.querySelector('form').onsubmit=e=>{e.preventDefault();try {submit?.();}catch(error){const el=dialog.querySelector('#planner-error');el.textContent=error.message;el.scrollIntoView({block:'nearest'});}};
        if (!dialog.open) dialog.showModal();
        dialog.querySelector('.planner-body').scrollTop=0;
    }
    function acknowledge() {
        return '<label class="planner-check"><input id="planner-ack" type="checkbox">我知道這只修改本機家庭安排，不會更改已確認的船方預約，安全演練仍須全員參加。</label>';
    }
    function requireAck() {if (!dialog.querySelector('#planner-ack')?.checked) throw Error('請先勾選確認：正式預約與安全責任不會因草案改變。');}
    const labelOf=id=>model.originals.get(id)?.display.shortTitle || id;
    function positionLabel(p,version,id) {
        const day=schedule.find(d=>d.id===p.dayId),period=day?.periods[p.periodIndex];
        const events=model.effective(version,{preview:true}).find(d=>d.id===p.dayId)?.periods[p.periodIndex]?.events || [];
        const index=events.findIndex(e=>e.id===id);
        return `${day?.tabTitle || '原日期已不存在'} · ${period?.name.split('｜')[0] || '原時段已不存在'}${index<0?'':` · 第 ${index+1} 段`}`;
    }
    function valueLabel(field,value,version=draft,id=null) {
        if (field==='candidate') return value==='original'?'原本安排':model.catalog.get(value)?.title || `已移除候選 (${value})`;
        if (field==='position') return positionLabel(value,version,id);
        if (field==='backup') return value?'備案':'主要安排';
        return String(value);
    }
    function edit(id) {
        if (model.conflicts(draft).length) {review(draft,false);return;}
        const event=model.effective(draft).flatMap(d=>d.periods.flatMap(p=>p.events)).find(e=>e.id===id);
        if (!event) return;
        const o=model.originals.get(id), values=clone(event.local.values), candidate=model.catalog.get(values.candidate);
        returnFocusId=id+'-edit';
        show('調整這段行程',`<p class="planner-official">正式安排：${esc(labelOf(id))} · ${esc(o.values.time)}${o.protected?' · 受保護項目':''}</p>
            <p>以下只存這台裝置。選活動不等於預約成功；當日時間、資格與空位仍查 Navigator。</p>
            <fieldset><legend>替換地點或活動</legend><div class="planner-fields">
                <label>種類<select id="planner-kind"><option value="all">全部候選</option><option value="restaurant">餐廳</option><option value="facility">設施</option><option value="activity">表演／活動</option><option value="rest">休息／自由活動</option></select></label>
                <label>找名稱、樓層<input id="planner-query" type="search" placeholder="例如：毛克利、Deck 10" autocomplete="off"></label></div>
                <label>選擇安排<select id="planner-candidate" size="5"></select></label>
                <p id="planner-candidate-count" class="group-note" role="status"></p><div id="planner-candidate-preview"></div></fieldset>
            <fieldset><legend>時段與順序</legend><label>暫定時間或相對時段<input id="planner-time" maxlength="80" required value="${esc(values.time)}" placeholder="例如：12:30、早餐後"></label>
                <p class="group-note">替換活動會先改成「時間待確認」，不套用歷史場次；移動以清單順序為準，不自動依文字時間排序。</p>
                <div class="planner-fields"><label>日期<select id="planner-day">${schedule.map(d=>`<option value="${d.id}">${esc(d.tabTitle)}</option>`).join('')}</select></label>
                <label>所在時段<select id="planner-period"></select></label></div><label>放在哪一段前面<select id="planner-before"></select></label>
                <label class="planner-check"><input type="checkbox" id="planner-backup" ${values.backup?'checked':''}>設為彈性備案（不刪除）</label></fieldset>
            ${o.protected?acknowledge():''}`, '儲存本機草案',()=>{
                if (o.protected) requireAck();
                const dayId=dialog.querySelector('#planner-day').value, periodIndex=Number(dialog.querySelector('#planner-period').value);
                const beforeId=dialog.querySelector('#planner-before').value;
                let position=values.position;
                if (positionDirty) {
                    const list=peers(); const idx=list.findIndex(e=>e.id===beforeId);
                    const rank=idx<0 ? (list.at(-1)?.rank ?? -100)+100 : idx===0 ? list[0].rank-100 : (list[idx-1].rank+list[idx].rank)/2;
                    position={dayId,periodIndex,rank};
                }
                const next=model.edit(draft,id,{candidate:selected,time:dialog.querySelector('#planner-time').value.trim(),position,backup:dialog.querySelector('#planner-backup').checked},Boolean(o.protected));
                save(next,{focusEventId:id});close();
            });
        let selected=values.candidate, positionDirty=false;
        const kind=dialog.querySelector('#planner-kind'), query=dialog.querySelector('#planner-query'), select=dialog.querySelector('#planner-candidate');
        function preview() {
            const c=model.catalog.get(selected);
            dialog.querySelector('#planner-candidate-preview').innerHTML=c ? `<p><strong>${esc(c.title)}</strong> ${esc(c.english || '')}</p><p>${esc(c.location)}</p><p>${esc(c.note)}</p><details><summary>資料來源與限制</summary><p>${esc(c.source)}</p></details>` : '<p>保留原本地點、詳細攻略與連結。</p>';
        }
        function filter() {
            const words=query.value.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
            const matches=[...model.catalog.values()].filter(c=>(kind.value==='all' || c.kind===kind.value) && words.every(w=>[c.title,c.english,c.location,...(c.aliases || [])].join(' ').normalize('NFKC').toLowerCase().includes(w)));
            const current=model.catalog.get(selected);
            const rows=current && !matches.includes(current)?[current,...matches]:matches;
            select.innerHTML=`<option value="original">原本：${esc(labelOf(id))}</option>`+rows.map(c=>`<option value="${esc(c.id)}">${esc(c.title)} · ${esc(c.english || '')} · ${esc(c.location)}${c.kind==='activity'?' · '+esc(c.note):''}</option>`).join('');
            select.value=selected;
            dialog.querySelector('#planner-candidate-count').textContent=`${matches.length} 個候選；已選項目會保留，資格與來源見下方。`;
        }
        kind.onchange=filter;query.oninput=filter;
        query.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();if(!event.isComposing)select.focus();}};
        select.onchange=()=>{selected=select.value;dialog.querySelector('#planner-time').value=selected===values.candidate?values.time:'時間待確認';preview();};
        if(candidate)kind.value=candidate.kind;
        filter();preview();
        const day=dialog.querySelector('#planner-day'), period=dialog.querySelector('#planner-period'), before=dialog.querySelector('#planner-before');
        day.value=values.position.dayId;
        function peers() {return model.effective(draft).find(d=>d.id===day.value).periods[Number(period.value)].events.filter(e=>e.id!==id);}
        function order() {
            const list=peers();before.innerHTML=list.map(e=>`<option value="${e.id}">${esc(e.local.display.shortTitle)}</option>`).join('')+'<option value="">這個時段最後</option>';
            before.value=day.value===values.position.dayId && Number(period.value)===values.position.periodIndex ? list.find(e=>e.rank>values.position.rank)?.id || '' : '';
        }
        function periods(index=0) {period.innerHTML=schedule.find(d=>d.id===day.value).periods.map((p,i)=>`<option value="${i}">${esc(p.name.split('｜')[0])}</option>`).join('');period.value=String(index);order();}
        periods(values.position.periodIndex);
        day.onchange=()=>{positionDirty=true;periods();};period.onchange=()=>{positionDirty=true;order();};before.onchange=()=>{positionDirty=true;};
    }
    function download(raw,name) {
        const url=URL.createObjectURL(new Blob([raw],{type:'application/json;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),10000);
    }
    function exportDraft() {download(invalidRaw!==null?invalidRaw:JSON.stringify(draft,null,2),invalidRaw!==null?'cruise-unreadable-backup.json':'cruise-itinerary-draft.json');}
    const fieldLabels={candidate:'安排',time:'時段',position:'日期／順序',backup:'備案'};
    function review(incoming,importing) {
        const conflicts=model.conflicts(incoming);
        const protectedEdits=Object.keys(incoming.edits).some(id=>model.originals.get(id)?.protected);
        const ids=[...new Set([...Object.keys(draft.edits),...Object.keys(incoming.edits)])];
        const rows=ids.map(id=>{
            const o=model.originals.get(id), old=draft.edits[id] || {}, next=incoming.edits[id] || {};
            const fields=[...new Set([...Object.keys(old),...Object.keys(next)])];
            return `<li><strong>${esc(labelOf(id))}</strong><ul>${fields.map(f=>`<li>${fieldLabels[f]}：${esc(valueLabel(f,old[f]?.value ?? o?.values[f] ?? '已移除',draft,id))} → ${esc(valueLabel(f,next[f]?.value ?? o?.values[f] ?? '已移除',incoming,id))}</li>`).join('')}</ul></li>`;
        }).join('');
        show(importing?'匯入前確認差異':'核對正式版本',`<p>${importing?'套用會取代這台裝置目前的整份草案；不會改網站正式行程。建議先匯出目前草案。':'正式版本更新後，有衝突的欄位尚未套用。請逐項決定，其他改動保留。'}</p>
            <ul class="planner-diff">${rows || '<li>此檔沒有調整；套用後回到正式行程。</li>'}</ul>
            ${conflicts.map((c,i)=>`<fieldset><legend>${esc(labelOf(c.id))} · ${fieldLabels[c.field]}</legend><p>${esc(c.reason)}</p><p>新版正式：${esc(valueLabel(c.field,model.originals.get(c.id)?.values[c.field] ?? '已移除',model.empty(),c.id))}<br>檔案草案：${esc(valueLabel(c.field,incoming.edits[c.id][c.field].value,incoming,c.id))}</p><label>採用版本<select data-conflict="${i}" required><option value="">請選擇</option><option value="official">採用新版正式／移除此變更</option>${c.missing?'':'<option value="draft">保留草案的改動</option>'}</select></label></fieldset>`).join('')}
            ${protectedEdits?acknowledge():''}`,importing?'確認匯入草案':'套用版本選擇',()=>{
                if(protectedEdits)requireAck();
                const choices={};conflicts.forEach((c,i)=>{choices[c.id+':'+c.field]=dialog.querySelector(`[data-conflict="${i}"]`).value;});
                save(model.resolve(incoming,choices));close();
            });
    }
    function confirmReset(id=null) {
        show(id?'還原這段正式安排':'還原整份正式行程',`<p>${id?esc(labelOf(id)):'所有本機調整'}將還原為網站的正式內容。其他清單勾選不會改變。</p>${invalidRaw!==null?'<p>無法讀取的舊記錄將被取代，請先匯出原記錄留存。</p>':''}`, '確認還原',()=>{
            const next=id?clone(draft):model.empty();if(id)delete next.edits[id];
            save(next,{force:invalidRaw!==null,focusEventId:id});close();
        });
    }
    function manage() {
        show('本機草案與備份',`<p>只有這台裝置、這個網站網址會記住草案。家人仍看到正式行程；你可以匯出檔案交回專案，核對後再正式發布。清除瀏覽器資料可能遺失草案。</p>
            <p>${Object.keys(draft.edits).length} 段調整${storageProblem?'；尚未安全儲存':''}</p>
            <div class="planner-management"><button type="button" data-planner-action="export">匯出${invalidRaw!==null?'原記錄':'草案 JSON'}</button><button type="button" data-planner-action="undo" ${undo.length?'':'disabled'}>復原上一步</button>
            <button type="button" data-planner-action="reset">還原正式行程</button><button type="button" data-planner-action="reload">載入此裝置最新草案</button></div>
            <label>選擇要匯入的 JSON（先預覽，不直接覆蓋）<input id="planner-import" type="file" accept=".json,application/json"></label>
            ${model.conflicts(draft).length?'<button type="button" data-planner-action="resolve">核對正式版本衝突</button>':''}`,'',null);
        dialog.querySelector('#planner-import').onchange=async e=>{
            const file=e.target.files[0];if(!file)return;
            try {
                if(file.size>window.ITINERARY_PLANNER.MAX_BYTES)throw Error('檔案超過 256 KB。');
                const parsed=model.parse(await file.text());
                if(dialog.open && e.target.isConnected) review(parsed,true);
            } catch(error) {if(dialog.open && e.target.isConnected)dialog.querySelector('#planner-error').textContent=error.message;}
        };
    }
    document.addEventListener('click',event=>{
        const b=event.target.closest('[data-planner-action]');if(!b)return;
        const action=b.dataset.plannerAction,id=b.dataset.eventId;
        try {
            if(action==='toggle') {editingDay=editingDay===b.dataset.day?null:b.dataset.day;onChange();document.getElementById(b.id)?.focus({preventScroll:true});}
            else if(action==='edit')edit(id);
            else if(action==='manage')manage();
            else if(action==='export')exportDraft();
            else if(action==='reset')confirmReset(id);
            else if(action==='resolve')review(draft,false);
            else if(action==='undo' && undo.length) {const previous=undo.pop(), history=undo.slice();try {save(previous);undo=history;close();} catch(error){undo.push(previous);throw error;}}
            else if(action==='reload') {
                show('載入已儲存的草案','<p>這個分頁尚未儲存的改動會捨棄；請先匯出需要保留的版本。</p>','確認載入',()=>{
                    const raw=localStorage.getItem(KEY);const next=raw?model.parse(raw):model.empty();draft=next;savedRaw=raw;invalidRaw=null;storageProblem='';externalChange=false;undo=[];onChange();status();close();
                });
            }
        }catch(error){if(dialog.open)dialog.querySelector('#planner-error').textContent=error.message;else {storageProblem=error.message;status();}}
    });
    window.addEventListener('storage',event=>{if(event.key===KEY || event.key===null){externalChange=true;status();}});
    status();
    return {
        schedule:()=>model.effective(draft),
        dayButton:day=>`<button type="button" class="planner-toggle" id="${day}-planner-toggle" data-planner-action="toggle" data-day="${day}" aria-pressed="${editingDay===day}">${editingDay===day?'完成調整':'調整行程'}</button>`,
        dayTools:day=>editingDay===day?`<div class="planner-day-tools"><span>只改本機草案</span><button type="button" data-planner-action="manage">草案與備份</button><button type="button" data-planner-action="undo" ${undo.length?'':'disabled'}>復原上一步</button></div>`:'',
        eventTools:(event,day)=>editingDay===day?`<div class="planner-event-tools"><button type="button" id="${event.id}-edit" data-planner-action="edit" data-event-id="${event.id}">替換／時段／移動</button>${draft.edits[event.id]?`<button type="button" data-planner-action="reset" data-event-id="${event.id}">還原這段</button>`:''}</div>`:'',
        note:event=>event.local?.changed?`<p class="planner-official">正式安排仍為：${esc(labelOf(event.id))} · ${esc(model.originals.get(event.id).values.time)}${event.local.protected?'。船方預約與全員演練責任不變。':''}</p>`:'',
        hasDraft:()=>Object.keys(draft.edits).length>0
    };
};

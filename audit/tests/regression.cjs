undefined
(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const start=script.indexOf('function pageTextWasFetched('),end=script.indexOf('function auditCsvPageValue(',start);
assert(start>=0&&end>start,'page retrieval status has a shared helper');
const c={};vm.createContext(c);vm.runInContext(script.slice(start,end)+';this.pageTextWasFetched=pageTextWasFetched;',c);
assert.equal(c.pageTextWasFetched(null),false);
assert.equal(c.pageTextWasFetched({}),false);
assert.equal(c.pageTextWasFetched({raw:null}),false);
assert.equal(c.pageTextWasFetched({raw:undefined}),false);
assert.equal(c.pageTextWasFetched({raw:''}),true,'empty text is still a successfully retrieved response');
assert.equal(c.pageTextWasFetched({raw:'text'}),true);
assert(script.includes('const usable=pages.filter(page=>pageTextWasFetched(page)&&page.parsed);'));
assert(script.includes('crawlMeta.scanned=pages.filter(pageTextWasFetched).length;'));
assert(script.includes('const loaded=pages.filter(pageTextWasFetched).length'));
assert(script.includes('pageTextWasFetched(item)?(inbound.get(auditLinkKey(item.url))??0):null'));
assert(!/pages\.filter\(\s*(?:page|item)=>\s*(?:page|item)\.raw\b/.test(script),'page inclusion must not depend on body truthiness');
assert(!/if\(!(?:page|item|pageItem)\.raw\b/.test(script),'empty response body must not count as an unavailable fetch');
console.log('PASS: fetched empty page bodies remain measured rather than being mistaken for failed reads');
})();

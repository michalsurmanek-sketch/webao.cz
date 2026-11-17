'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const scoring = script.slice(script.indexOf('  const pageSpeedRecommendations=[]'), script.indexOf('  window.currentAuditScreenshots=pageSpeedScreenshots;'));
assert(scoring.includes('pageSpeedResults.forEach'), 'exercise the actual report scoring path');

for (const score of [0, 0.4949, 0.495, 0.4999, 0.5, 0.7449, 0.745, 0.7499, 0.75, 0.8949, 0.895, 0.8999, 0.9, 1, null]) {
  let csv;
  const out = {innerHTML:'', querySelector:()=>null, querySelectorAll:()=>[]};
  const context = {URL:class extends URL {static createObjectURL(){return 'blob:fixture'} static revokeObjectURL(){}},
    window:{}, document:{querySelector:selector=>selector==='#result'?out:{}, createElement:()=>({click(){}})},
    localStorage:{getItem:()=>null, setItem(){}}, setTimeout:()=>{}, TextEncoder,
    Blob:class {constructor(parts){csv=parts[0]}}};
  vm.createContext(context);
  vm.runInContext(script.slice(0, script.indexOf("form.addEventListener('submit'")), context);
  const audit = title=>({score,title,scoreDisplayMode:score===null?'error':'numeric'});
  const result = strategy=>({status:'fulfilled',value:{lighthouseResult:{configSettings:{emulatedFormFactor:strategy},
    categories:Object.fromEntries(['performance','accessibility','seo','best-practices'].map(id=>[id,{score}])),
    audits:{viewport:audit('Viewport'), 'third-party-cookies':audit('Third-party cookies')}}}});
  context.pageSpeedResults=[result('mobile'),result('desktop')];
  context.url=new URL('https://example.cz/');
  context.findings=[];
  vm.runInContext(scoring,context);
  const measured=context.findings.filter(item=>item.name==='Lighthouse mobil — Viewport'||item.name.startsWith('Lighthouse mobil — viewport —')||item.name.startsWith('PageSpeed Insights — ')||item.name.startsWith('Lighthouse — cookies třetích stran'));
  assert.equal(measured.length,10);
  for(const finding of measured){
    const passed=score!==null&&score>=0.9;
    assert.equal(Boolean(finding.ok),passed,`${finding.name}: raw score ${score} must control pass/fail`);
    assert.equal(finding.points,score===null?null:Math.round(score*100));
    if(score===null)assert.equal(finding.state,'NELZE OVĚŘIT');
    else if(passed)assert.equal(finding.severity,'Nízká');
    else if(finding.name.startsWith('PageSpeed Insights'))assert.equal(finding.severity,score<0.5?'Kritická':score<0.75?'Závažná':'Střední');
    else if(finding.name.startsWith('Lighthouse mobil'))assert.equal(finding.severity,score<0.5?'Závažná':'Střední');
    else assert.equal(finding.severity,'K prověření');
    assert.equal(context.isPriorityFinding(finding),score!==null&&!passed,'failed boundary result stays in the repair plan');
  }
  context.renderReport('example.cz',context.findings);
  context.downloadAuditCsv();
  for(const finding of measured){
    const row=csv.split('\r\n').find(row=>row.startsWith('"Nález"')&&row.includes('"'+finding.name+'"'));
    assert(row,`${finding.name}: finding is included in CSV`);
    assert(row.includes('"'+(score===null?'NELZE OVĚŘIT':score>=0.9?'V POŘÁDKU':'OPRAVIT')+'"'));
  }
  if(score===0.895){
    assert(out.innerHTML.includes('Lighthouse mobil — Viewport'));
    assert(out.innerHTML.includes('OPRAVIT'));
    assert(!measured.some(item=>item.ok),'rounded 90 cannot conceal a failed control');
  }
}
console.log('PASS: raw Lighthouse boundaries preserve findings, severity, repair plan and CSV for both devices');

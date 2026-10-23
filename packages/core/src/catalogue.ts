import type { BrandPack, ComponentDefinition, OutputPreset, TemplateDefinition } from './types.js';

export const presets: OutputPreset[] = [
  {id:'course-hd', width:1920, height:1080, fps:30},
  {id:'social-landscape', width:1920, height:1080, fps:30},
  {id:'social-portrait', width:1080, height:1350, fps:30},
  {id:'story-vertical', width:1080, height:1920, fps:30},
  {id:'social-square', width:1080, height:1080, fps:30},
  {id:'transparent-overlay-hd', width:1920, height:1080, fps:30, alpha:true},
  {id:'thumbnail', width:1280, height:720, fps:1, stillOnly:true}
];

const font = {display:'Inter, Helvetica, Arial, sans-serif', heading:'Inter, Helvetica, Arial, sans-serif', body:'Inter, Helvetica, Arial, sans-serif', mono:'SFMono-Regular, Menlo, Consolas, monospace', label:'Inter, Helvetica, Arial, sans-serif', caption:'Inter, Helvetica, Arial, sans-serif'};
export const brands: BrandPack[] = [
  {id:'neutral',version:'1.0.0',name:'Neutral',description:'Clean, client-ready base pack.',colours:{canvas:'#F5F5F1',surface:'#FFFFFF',surfaceAlt:'#EAEAE4',text:'#171715',muted:'#6D6D66',accent:'#3157D5',accentAlt:'#8BA2F5',success:'#2E8B62',warning:'#B7791F',danger:'#C53030',line:'#D5D5CE'},typography:font,motion:{easing:'calm',speed:1,staggerFrames:5,drift:.018,radius:22},writing:['Clear','Unbranded','Evidence-led']}
];

export const components: ComponentDefinition[] = [
  ['title','Title system',['text','shape'],'Brand-led open or chapter scene',['eyebrow','title','body'],['fade','rise']],
  ['process-flow','Process flow',['diagram','text','shape'],'Progressive staged process with connectors',['title','items'],['rise','draw','pulse']],
  ['network','Network / memory graph',['diagram','text'],'Connected nodes and animated relationships',['title','nodes'],['scale','trace','pulse']],
  ['swimlane','Authority lanes',['diagram','text','shape'],'Swimlanes, owners and gates',['title','items'],['wipe','rise']],
  ['comparison','Before / after',['text','shape','image'],'Side-by-side comparison',['title','items'],['slide-left','fade']],
  ['architecture','Layered architecture',['diagram','text'],'Service or system boundary reveal',['title','items'],['rise','draw']],
  ['timeline','Timeline',['diagram','text'],'Temporal or causal sequence',['title','items'],['draw','rise']],
  ['evidence-gate','Evidence gate',['diagram','text','shape'],'Checks, scorecards and release evidence',['title','items'],['scale','highlight']],
  ['terminal','Terminal demonstration',['terminal','text'],'Typed commands and streamed output',['title','code'],['type','focus']],
  ['metric','Metric proof',['chart','text'],'Build and hold a proof point',['metric','metricLabel'],['count','rise']],
  ['presenter','Presenter frame',['presenter','caption','text'],'Presenter open, close or picture-in-picture',['title','body'],['fade','rise']],
  ['closing','Closing / CTA',['text','shape'],'Resolved end-state with action',['title','cta'],['scale','fade']]
].map(([id,name,layerTypes,description,inputs,motion])=>({id,name,layerTypes,description,inputs,motion})) as ComponentDefinition[];

const allRatios = presets.map(p=>p.id);
export const templates: TemplateDefinition[] = [
  ['foundation.title','Title / chapter','foundation','Brand-led title, chapter or divider.',3,12,['title'],['eyebrow','body'],'title'],
  ['foundation.closing','Closing / CTA','foundation','Clear end state and next action.',3,12,['title'],['body','cta'],'closing'],
  ['teaching.process','Process flow','teaching','Progressively disclose a process or operating loop.',6,30,['title','items'],['body'],'process-flow'],
  ['teaching.network','Network and context flow','teaching','Explain connected memory, data or services.',6,30,['title','nodes'],['body'],'network'],
  ['teaching.swimlane','Authority lane','teaching','Show ownership, gates and handoffs.',6,30,['title','items'],['body'],'swimlane'],
  ['teaching.comparison','Before / after','teaching','Compare two approaches or states.',4,20,['title','items'],['body'],'comparison'],
  ['teaching.architecture','Layered architecture','teaching','Reveal boundaries and dependencies.',6,30,['title','items'],['body'],'architecture'],
  ['teaching.timeline','Timeline / causal chain','teaching','Trace events, causes or progress.',6,30,['title','items'],['body'],'timeline'],
  ['teaching.evidence','Evidence gate','teaching','Show checks and release criteria.',5,20,['title','items'],['body'],'evidence-gate'],
  ['teaching.terminal','Terminal demo','teaching','Render deterministic typed commands and output.',4,90,['title','code'],['body'],'terminal'],
  ['social.proof','Four-scene proof post','social','Problem, mechanism, proof and CTA.',12,45,['title'],['body','metric','cta'],'metric'],
  ['longform.presenter','Presenter and captions','long-form','Presenter or demo layer with timed captions.',4,600,['title'],['body'],'presenter']
].map(([id,name,category,description,minDuration,maxDuration,required,optional,component])=>({id,name,category,description,ratios:allRatios,minDuration,maxDuration,required,optional,textLimits:{title:90,body:220,item:72},component})) as TemplateDefinition[];

export const getBrand = (id:string) => brands.find(b=>b.id===id);
export const getPreset = (id:string) => presets.find(p=>p.id===id);
export const getTemplate = (id:string) => templates.find(t=>t.id===id);
export const registerBrand = (pack:BrandPack) => {const index=brands.findIndex(b=>b.id===pack.id);if(index>=0)brands[index]=pack;else brands.push(pack);return pack};

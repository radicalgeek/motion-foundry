import {projectSchema} from './schema.js';
import {getBrand,getPreset,getTemplate} from './catalogue.js';
import type {Diagnostic, MotionProject} from './types.js';

export function validateProject(input:unknown): Diagnostic[] {
  const diagnostics: Diagnostic[]=[];
  const parsed=projectSchema.safeParse(input);
  if(!parsed.success){
    for(const issue of parsed.error.issues) diagnostics.push({code:'SCHEMA_INVALID',severity:'error',path:'/'+issue.path.join('/'),message:issue.message,suggestion:'Match the project v2 schema.'});
    return diagnostics;
  }
  const p=parsed.data as MotionProject;
  const brand=getBrand(p.brand.id);
  if(!brand) diagnostics.push({code:'BRAND_UNKNOWN',severity:'error',path:'/brand/id',message:`Unknown brand “${p.brand.id}”.`,suggestion:'Use brands.list or add a versioned brand pack.'});
  else if(brand.version!==p.brand.version) diagnostics.push({code:'BRAND_VERSION_MISMATCH',severity:'error',path:'/brand/version',message:`Pinned ${p.brand.version}, available ${brand.version}.`,suggestion:`Set brand.version to ${brand.version}.`});
  if(p.metadata.product && brand?.products?.length && !brand.products.includes(p.metadata.product)) diagnostics.push({code:'PRODUCT_BRAND_MISMATCH',severity:'error',path:'/brand/id',message:`Product ${p.metadata.product} is not approved for ${brand.name}.`,suggestion:`Use brand “${p.metadata.product}” or declare a co-brand policy.`});
  const preset=getPreset(p.preset);
  if(!preset) diagnostics.push({code:'PRESET_UNKNOWN',severity:'error',path:'/preset',message:`Unknown output preset “${p.preset}”.`,suggestion:'Use a preset returned by presets.list.'});
  if(preset && p.fps!==preset.fps && !preset.stillOnly) diagnostics.push({code:'FPS_PRESET_OVERRIDE',severity:'warning',path:'/fps',message:`Project uses ${p.fps}fps; ${preset.id} defaults to ${preset.fps}fps.`});
  const ids=new Set<string>(); let duration=0;
  p.scenes.forEach((scene,i)=>{
    const path=`/scenes/${i}`; duration+=scene.duration;
    if(ids.has(scene.id)) diagnostics.push({code:'SCENE_ID_DUPLICATE',severity:'error',path:path+'/id',message:`Duplicate scene id “${scene.id}”.`,suggestion:'Give every scene a stable unique id.'});
    ids.add(scene.id);
    const template=getTemplate(scene.template);
    if(!template) diagnostics.push({code:'TEMPLATE_UNKNOWN',severity:'error',path:path+'/template',message:`Unknown template “${scene.template}”.`,suggestion:'Choose from templates.list.'});
    else {
      if(scene.duration<template.minDuration||scene.duration>template.maxDuration) diagnostics.push({code:'DURATION_OUTSIDE_TEMPLATE_RANGE',severity:'warning',path:path+'/duration',message:`${scene.duration}s is outside ${template.minDuration}–${template.maxDuration}s for ${template.name}.`});
      for(const key of template.required) if(!(scene.content as any)[key]?.length) diagnostics.push({code:'TEMPLATE_FIELD_REQUIRED',severity:'error',path:`${path}/content/${key}`,message:`${template.name} requires ${key}.`});
      if(scene.content.title.length>template.textLimits.title) diagnostics.push({code:'TEXT_LIMIT_EXCEEDED',severity:'warning',path:path+'/content/title',message:`Title is ${scene.content.title.length} characters; recommended maximum is ${template.textLimits.title}.`,suggestion:'Shorten the title or split the scene.'});
      if(scene.content.body && scene.content.body.length>template.textLimits.body) diagnostics.push({code:'TEXT_LIMIT_EXCEEDED',severity:'warning',path:path+'/content/body',message:`Body copy exceeds the ${template.textLimits.body}-character reading limit.`});
    }
    if(scene.brandOverride && !getBrand(scene.brandOverride)) diagnostics.push({code:'SCENE_BRAND_UNKNOWN',severity:'error',path:path+'/brandOverride',message:`Unknown scene brand “${scene.brandOverride}”.`});
    scene.layers?.forEach((layer,j)=>{
      if(layer.color && brand && !(layer.color in brand.colours)) diagnostics.push({code:'BRAND_TOKEN_UNKNOWN',severity:'error',path:`${path}/layers/${j}/color`,message:`Unknown semantic colour token “${layer.color}”.`,suggestion:`Use one of: ${Object.keys(brand.colours).join(', ')}.`});
      if(p.qa?.generatedMediaProvenanceRequired&&layer.asset&&!layer.provenance) diagnostics.push({code:'GENERATED_MEDIA_PROVENANCE_MISSING',severity:'error',path:`${path}/layers/${j}/provenance`,message:'Asset provenance is required for generated-media projects.',suggestion:'Record source, role, workflow profile, host, workflow hash and review state.'});
    });
    scene.captions?.forEach((c,j)=>{if(c.end>scene.duration) diagnostics.push({code:'CAPTION_OUTSIDE_SCENE',severity:'error',path:`${path}/captions/${j}/end`,message:'Caption ends after the scene.'});});
  });
  if(Math.abs(duration-p.duration)>.001) diagnostics.push({code:'PROJECT_DURATION_MISMATCH',severity:'error',path:'/duration',message:`Scene total is ${duration}s but project duration is ${p.duration}s.`,suggestion:`Set duration to ${duration}.`});
  const trackIds=new Set<string>();
  p.tracks?.forEach((track,i)=>{
    const trackPath=`/tracks/${i}`;
    if(trackIds.has(track.id)) diagnostics.push({code:'TRACK_ID_DUPLICATE',severity:'error',path:trackPath+'/id',message:`Duplicate track id “${track.id}”.`,suggestion:'Give every media track a stable unique id.'});
    trackIds.add(track.id);
    const visual=['video','presenter','demo'].includes(track.type);
    if(track.composite&&!visual) diagnostics.push({code:'COMPOSITE_ON_NON_VISUAL_TRACK',severity:'error',path:trackPath+'/composite',message:'Compositing controls apply to video, presenter and demo tracks.'});
    if(track.start+(track.duration||p.duration-track.start)>p.duration+.001) diagnostics.push({code:'TRACK_OUTSIDE_PROJECT',severity:'warning',path:trackPath+'/duration',message:'Track extends beyond the project duration and will be clipped.'});
    const c=track.composite;
    if(p.qa?.generatedMediaProvenanceRequired&&track.asset&&!track.provenance) diagnostics.push({code:'GENERATED_MEDIA_PROVENANCE_MISSING',severity:'error',path:trackPath+'/provenance',message:'Asset provenance is required for generated-media projects.',suggestion:'Record source, role, workflow profile, host, workflow hash and review state.'});
    if(p.qa?.generatedMediaProvenanceRequired&&c?.mask?.asset&&!c.mask.provenance) diagnostics.push({code:'GENERATED_MEDIA_PROVENANCE_MISSING',severity:'error',path:trackPath+'/composite/mask/provenance',message:'Mask provenance is required for generated-media projects.',suggestion:'Record the segmentation workflow profile, host, workflow hash and QA evidence.'});
    if(c?.blendMode&&c.blendMode!=='normal'){
      if((c.x??0)!==0||(c.y??0)!==0||c.width!==undefined||c.height!==undefined) diagnostics.push({code:'BLEND_REQUIRES_FULL_FRAME',severity:'error',path:trackPath+'/composite',message:'Blend-mode tracks must fill the full frame; omit x, y, width and height.',suggestion:'Use blendMode normal for positioned overlays.'});
      if(!['cover','fill'].includes(c.fit||'')) diagnostics.push({code:'BLEND_FIT_REQUIRED',severity:'error',path:trackPath+'/composite/fit',message:'Blend-mode tracks require fit “cover” or “fill”.'});
      if(c.key||c.mask) diagnostics.push({code:'BLEND_ALPHA_UNSUPPORTED',severity:'error',path:trackPath+'/composite',message:'Keying and masks use normal overlay composition. Apply the blend in a separate full-frame track.'});
    }
  });
  const hasNarration=p.scenes.some(s=>s.narration?.asset||s.narration?.text)||p.tracks?.some(t=>t.type==='narration');
  const hasCaptions=p.scenes.some(s=>s.captions?.length)||p.tracks?.some(t=>t.type==='captions'&&t.cues?.length);
  if((p.qa?.captionsRequired||hasNarration)&&!hasCaptions) diagnostics.push({code:'CAPTIONS_MISSING',severity:'error',path:'/tracks',message:'Narrated content requires captions.',suggestion:'Add timed caption cues or disable captionsRequired.'});
  if(!diagnostics.some(d=>d.severity==='error')) diagnostics.push({code:'VALID',severity:'info',path:'/',message:'Project is structurally valid and ready for visual inspection.'});
  return diagnostics;
}

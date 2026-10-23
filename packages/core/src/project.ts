import {createHash, randomUUID} from 'node:crypto';
import type {MotionProject, Scene} from './types.js';
import {getBrand,getPreset} from './catalogue.js';

export const now=()=>new Date().toISOString();
export const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const hashObject=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function createProject(input:{title:string;brand:string;preset?:string;template?:string;content?:Partial<Scene['content']>;id?:string}):MotionProject{
  const brand=getBrand(input.brand);if(!brand)throw new Error(`Unknown brand ${input.brand}`);const preset=getPreset(input.preset||'course-hd');if(!preset)throw new Error(`Unknown preset ${input.preset}`);const date=now();const scene:Scene={id:'scene-1',type:'foundation',template:input.template||'foundation.title',duration:6,content:{title:input.content?.title||input.title,...input.content}};
  return {schemaVersion:'2.0',id:input.id||slugify(input.title)||randomUUID(),version:1,title:input.title,brand:{id:brand.id,version:brand.version},preset:preset.id,fps:preset.fps,duration:scene.duration,scenes:[scene],metadata:{createdAt:date,updatedAt:date,language:'en-GB'},qa:{safeArea:.06}};
}
export function cloneProject(project:MotionProject,patch:Partial<Pick<MotionProject,'title'|'preset'>> & {brand?:string}={}):MotionProject{const b=patch.brand?getBrand(patch.brand):undefined;if(patch.brand&&!b)throw new Error(`Unknown brand ${patch.brand}`);const date=now();return {...structuredClone(project),id:`${project.id}-${randomUUID().slice(0,6)}`,version:1,title:patch.title||`${project.title} — variant`,preset:patch.preset||project.preset,brand:b?{id:b.id,version:b.version}:project.brand,metadata:{...project.metadata,createdAt:date,updatedAt:date}}}
export function patchProject(project:MotionProject,patch:Partial<MotionProject>,expectedVersion?:number):MotionProject{if(expectedVersion&&project.version!==expectedVersion)throw new Error(`VERSION_CONFLICT: expected ${expectedVersion}, current ${project.version}`);const next={...project,...patch,id:project.id,version:project.version+1,metadata:{...project.metadata,...patch.metadata,updatedAt:now()}} as MotionProject;next.duration=next.scenes.reduce((n,s)=>n+s.duration,0);return next}

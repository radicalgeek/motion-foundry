import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {hashObject,renderVideo,type MotionProject,type RenderJob} from '@motion-foundry/core';
import {Store} from './store.js';

export class RenderQueue{
  private running=false; constructor(private store:Store){}
  async enqueue(project:MotionProject,preset?:string,idempotencyKey?:string){const jobs=await this.store.listJobs();if(idempotencyKey){const prior=jobs.find(j=>j.idempotencyKey===idempotencyKey&&j.projectId===project.id);if(prior)return prior}const cacheKey=hashObject({engine:'1.0.2',project,preset:preset||project.preset});const cached=jobs.find(j=>j.status==='complete'&&j.cacheKey===cacheKey);if(cached)return cached;const date=new Date().toISOString();const job:RenderJob={id:randomUUID(),projectId:project.id,status:'queued',progress:0,stage:'queued',createdAt:date,updatedAt:date,idempotencyKey,cacheKey};await this.store.saveJob(job);this.pump();return job}
  async resume(){for(const j of await this.store.listJobs())if(j.status==='running'){j.status='queued';j.stage='resuming';j.updatedAt=new Date().toISOString();await this.store.saveJob(j)}this.pump()}
  private async pump(){if(this.running)return;this.running=true;try{while(true){const jobs=await this.store.listJobs();const job=jobs.filter(j=>j.status==='queued').sort((a,b)=>a.createdAt.localeCompare(b.createdAt))[0];if(!job)break;await this.run(job)}}finally{this.running=false}}
  private async run(job:RenderJob){try{job.status='running';job.stage='loading';job.updatedAt=new Date().toISOString();await this.store.saveJob(job);const p=await this.store.getProject(job.projectId);const output=path.join(this.store.renders,`${p.id}-${job.id.slice(0,8)}.${p.preset==='transparent-overlay-hd'?'webm':'mp4'}`);const result=await renderVideo(p,output,{baseDir:this.store.root,progress:async(progress,stage)=>{job.progress=progress;job.stage=stage;job.updatedAt=new Date().toISOString();await this.store.saveJob(job)}});job.status='complete';job.progress=1;job.output=result.output;job.manifest=result.output+'.manifest.json';job.stage='complete'}catch(e){job.status='failed';job.error=e instanceof Error?e.message:String(e);job.stage='failed'}job.updatedAt=new Date().toISOString();await this.store.saveJob(job)}
}

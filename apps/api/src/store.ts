import {mkdir,readFile,readdir,rename,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import type {BrandPack, MotionProject, RenderJob} from '@motion-foundry/core';
import {registerBrand} from '@motion-foundry/core';

export class Store {
  root:string; projects:string; jobs:string; renders:string; assets:string; brands:string;
  constructor(root=path.resolve('.motion-foundry')){this.root=root;this.projects=path.join(root,'projects');this.jobs=path.join(root,'jobs');this.renders=path.join(root,'renders');this.assets=path.join(root,'assets');this.brands=path.join(root,'brands')}
  async init(){for(const d of [this.root,this.projects,this.jobs,this.renders,this.assets,this.brands])await mkdir(d,{recursive:true});for(const f of await readdir(this.brands)){if(!f.endsWith('.json'))continue;try{registerBrand(JSON.parse(await readFile(path.join(this.brands,f),'utf8')))}catch{}}}
  private async atomic(file:string,value:unknown){const tmp=`${file}.${randomUUID()}.tmp`;await writeFile(tmp,JSON.stringify(value,null,2));await rename(tmp,file)}
  async saveProject(p:MotionProject){await this.atomic(path.join(this.projects,p.id+'.json'),p);return p}
  async getProject(id:string){return JSON.parse(await readFile(path.join(this.projects,path.basename(id)+'.json'),'utf8')) as MotionProject}
  async listProjects(){const files=(await readdir(this.projects)).filter(f=>f.endsWith('.json'));return Promise.all(files.map(async f=>JSON.parse(await readFile(path.join(this.projects,f),'utf8')) as MotionProject))}
  async saveJob(j:RenderJob){await this.atomic(path.join(this.jobs,j.id+'.json'),j);return j}
  async getJob(id:string){return JSON.parse(await readFile(path.join(this.jobs,path.basename(id)+'.json'),'utf8')) as RenderJob}
  async listJobs(){const files=(await readdir(this.jobs)).filter(f=>f.endsWith('.json'));return Promise.all(files.map(async f=>JSON.parse(await readFile(path.join(this.jobs,f),'utf8')) as RenderJob))}
  async saveBrand(b:BrandPack){registerBrand(b);await this.atomic(path.join(this.brands,b.id+'.json'),b);return b}
  async exists(file:string){try{await access(file);return true}catch{return false}}
}

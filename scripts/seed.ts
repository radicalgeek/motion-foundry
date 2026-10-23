import {access, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {cloneProject, type MotionProject} from '@motion-foundry/core';

const root = path.resolve('.motion-foundry');
const projects = path.join(root, 'projects');
const assets = path.join(root, 'assets');
await mkdir(projects, {recursive: true});
await mkdir(assets, {recursive: true});

for (const directory of await readdir(path.resolve('examples'), {withFileTypes: true})) {
  if (!directory.isDirectory()) continue;
  const file = path.join('examples', directory.name, 'project.motion.json');
  const project = JSON.parse(await readFile(file, 'utf8')) as MotionProject;
  await writeFile(path.join(projects, project.id + '.json'), JSON.stringify(project, null, 2));
  if (project.id !== 'getting-started') continue;
  for (const preset of ['social-portrait', 'story-vertical', 'social-square', 'transparent-overlay-hd']) {
    const variant = cloneProject(project, {preset, title: `${project.title} — ${preset}`});
    variant.id = `getting-started-${preset}`;
    await writeFile(path.join(projects, variant.id + '.json'), JSON.stringify(variant, null, 2));
  }
}

const run = (command: string, args: string[]) => new Promise<void>((resolve, reject) => {
  const child = spawn(command, args, {stdio: 'ignore'});
  child.on('close', code => code === 0 ? resolve() : reject(new Error(`${command} failed ${code}`)));
  child.on('error', reject);
});
const exists = async (file: string) => {
  try { await access(file); return true; } catch { return false; }
};
const bed = path.join(assets, 'demo-bed.wav');
if (!await exists(bed)) {
  await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'sine=frequency=82:duration=20',
    '-af', 'volume=0.15,afade=t=in:st=0:d=1,afade=t=out:st=18:d=2', bed]);
}
const aiff = path.join(assets, 'demo-narration.aiff');
const wav = path.join(assets, 'demo-narration.wav');
if (!await exists(wav)) {
  const text = 'Combine titles, diagrams and captions in one project. Choose a template, write the content and set the timing. Preview the frames, render the video and save the result. Your sequence is ready. Try another layout or add a scene.';
  try {
    await run('say', ['-r', '174', '-o', aiff, text]);
    await run('ffmpeg', ['-y', '-i', aiff, '-af', 'apad=pad_dur=10', '-t', '20', wav]);
  } catch {
    // The example remains usable on systems without the macOS speech command.
    await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '20', wav]);
  }
}
console.log(`Seeded generic Motion Foundry examples in ${root}`);

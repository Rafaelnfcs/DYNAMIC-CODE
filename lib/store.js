import fs from 'fs'; import path from 'path';
const file=path.join(process.cwd(),'data.json');
function init(){if(!fs.existsSync(file)) fs.writeFileSync(file,JSON.stringify({items:[]},null,2));}
export function all(){init();return JSON.parse(fs.readFileSync(file)).items}
export function save(items){fs.writeFileSync(file,JSON.stringify({items},null,2))}
export function get(slug){return all().find(x=>x.slug===slug)}

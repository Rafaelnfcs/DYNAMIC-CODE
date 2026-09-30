import {adminDb} from './supabase/server';
export async function currentUser(req){const token=req.headers.get('authorization')?.replace('Bearer ','');if(!token)return null;return (await adminDb().auth.getUser(token)).data.user||null}
export async function currentProfile(req){const u=await currentUser(req);if(!u)return null;const {data:p}=await adminDb().from('profiles').select('*').eq('id',u.id).single();return p?{...p,email:u.email}:null}
export async function requireAdmin(req){const p=await currentProfile(req);return p?.role==='admin'?p:null}

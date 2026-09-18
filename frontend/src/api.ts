import type { Job, JobStatus } from './types';
const BASE = import.meta.env.VITE_API_URL || '/api';
async function request<T>(path:string, options?:RequestInit):Promise<T>{
  const res = await fetch(`${BASE}${path}`, {headers:{'Content-Type':'application/json'},...options});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
export const api = {
  jobs:()=>request<Job[]>('/jobs'),
  create:(payload:{title:string;type:string})=>request<Job>('/jobs',{method:'POST',body:JSON.stringify(payload)}),
  status:(id:string,status:JobStatus,version:number)=>request<Job>(`/jobs/${id}/status`,{method:'PATCH',body:JSON.stringify({status,version})}),
  remove:(id:string)=>request(`/jobs/${id}`,{method:'DELETE'}),
};

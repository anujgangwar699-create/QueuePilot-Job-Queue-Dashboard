import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, CircleDot, Clock3, LogOut, Plus, RefreshCw, Search, Trash2, XCircle, Zap } from 'lucide-react';
import { api } from './api';
import type { Job, JobStatus } from './types';
import art from './assets/queue-illustration.svg';

const statuses:JobStatus[]=['pending','running','completed','failed'];
const nextStatus=(job:Job):JobStatus[]=> job.status==='pending'?['running','failed']:job.status==='running'?['completed','failed']:[];

function Login({onLogin}:{onLogin:()=>void}){
 const [email,setEmail]=useState('intern@queuepilot.dev');
 return <div className="login-page">
   <motion.section className="login-visual" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}}>
     <div className="brand"><span className="logo"><Zap size={20}/></span> QueuePilot</div>
     <div className="hero-copy"><span className="eyebrow">JOB ORCHESTRATION, SIMPLIFIED</span><h1>Keep every job moving.</h1><p>A compact queue dashboard for tracking work from pending to done — without losing control of state.</p></div>
     <motion.img src={art} className="login-art" alt="Animated queue dashboard illustration" animate={{y:[0,-10,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}}/>
     <div className="glow glow-one"/><div className="glow glow-two"/>
   </motion.section>
   <motion.section className="login-panel" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}}>
     <div className="login-card"><div className="mobile-brand"><span className="logo"><Zap size={18}/></span> QueuePilot</div><h2>Welcome back</h2><p>Sign in to manage your job queue.</p>
       <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
       <label>Password</label><input type="password" defaultValue="password"/>
       <button className="primary wide" onClick={()=>{localStorage.setItem('qp-auth','1');onLogin()}}>Sign in <span>→</span></button>
       <p className="demo-note">Demo login — any values work.</p>
     </div>
   </motion.section>
 </div>
}

function Dashboard({onLogout}:{onLogout:()=>void}){
 const [jobs,setJobs]=useState<Job[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[filter,setFilter]=useState<'all'|JobStatus>('all'),[query,setQuery]=useState(''),[title,setTitle]=useState(''),[type,setType]=useState('Email'),[busy,setBusy]=useState('');
 const load=async()=>{setLoading(true);setError('');try{setJobs(await api.jobs())}catch(e:any){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const counts=useMemo(()=>Object.fromEntries(statuses.map(s=>[s,jobs.filter(j=>j.status===s).length])),[jobs]);
 const shown=jobs.filter(j=>(filter==='all'||j.status===filter)&&(`${j.title} ${j.type}`.toLowerCase().includes(query.toLowerCase())));
 const create=async(e:React.FormEvent)=>{e.preventDefault(); if(!title.trim())return;setBusy('new');try{const j=await api.create({title:title.trim(),type});setJobs(x=>[j,...x]);setTitle('')}catch(e:any){setError(e.message)}finally{setBusy('')}};
 const change=async(j:Job,s:JobStatus)=>{setBusy(j.id);try{const updated=await api.status(j.id,s,j.version);setJobs(x=>x.map(v=>v.id===j.id?updated:v))}catch(e:any){setError(e.message);await load()}finally{setBusy('')}};
 const remove=async(id:string)=>{setBusy(id);try{await api.remove(id);setJobs(x=>x.filter(j=>j.id!==id))}catch(e:any){setError(e.message)}finally{setBusy('')}};
 return <div className="app-shell">
   <aside><div className="brand"><span className="logo"><Zap size={20}/></span> QueuePilot</div><nav><button className="nav active"><Activity size={18}/> Dashboard</button><button className="nav" onClick={()=>setFilter('pending')}><Clock3 size={18}/> Pending</button><button className="nav" onClick={()=>setFilter('running')}><CircleDot size={18}/> Running</button></nav><div className="side-bottom"><div className="mini-profile"><span>AI</span><div><strong>Intern User</strong><small>Demo workspace</small></div></div><button className="nav" onClick={onLogout}><LogOut size={18}/> Logout</button></div></aside>
   <main><header><div><span className="eyebrow">OPERATIONS</span><h1>Job Queue Dashboard</h1><p>Monitor, create and advance background work safely.</p></div><button className="ghost" onClick={load}><RefreshCw size={16}/> Refresh</button></header>
   {error&&<motion.div className="error" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}}><XCircle size={18}/>{error}<button onClick={()=>setError('')}>×</button></motion.div>}
   <section className="stats">{statuses.map((s,i)=>{const Icon=s==='pending'?Clock3:s==='running'?CircleDot:s==='completed'?CheckCircle2:XCircle;return <motion.button key={s} className={`stat ${filter===s?'selected':''}`} onClick={()=>setFilter(s)} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*.06}}><span className={`stat-icon ${s}`}><Icon size={20}/></span><div><small>{s}</small><strong>{counts[s]||0}</strong></div></motion.button>})}</section>
   <section className="workspace"><form className="create-card" onSubmit={create}><div><span className="eyebrow">NEW JOB</span><h3>Queue fresh work</h3><p>Every new job starts in pending.</p></div><label>Job title</label><input placeholder="e.g. Generate weekly report" value={title} onChange={e=>setTitle(e.target.value)}/><label>Job type</label><select value={type} onChange={e=>setType(e.target.value)}><option>Email</option><option>Report</option><option>Export</option><option>Sync</option><option>Media</option></select><button className="primary" disabled={busy==='new'}><Plus size={17}/>{busy==='new'?'Creating…':'Create job'}</button><img src={art} className="card-art" alt="Queue illustration"/></form>
   <div className="jobs-card"><div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search jobs..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="chips"><button className={filter==='all'?'on':''} onClick={()=>setFilter('all')}>All</button>{statuses.map(s=><button key={s} className={filter===s?'on':''} onClick={()=>setFilter(s)}>{s}</button>)}</div></div>
   {loading?<div className="empty"><div className="spinner"/>Loading jobs…</div>:shown.length===0?<div className="empty"><Clock3 size={30}/><strong>No jobs here yet</strong><span>Create a job or choose another filter.</span></div>:<div className="job-list"><AnimatePresence>{shown.map(j=><motion.article className="job-row" key={j.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:20}}><span className={`dot ${j.status}`}/><div className="job-main"><strong>{j.title}</strong><span>{j.type} · {new Date(j.createdAt).toLocaleString()}</span></div><span className={`badge ${j.status}`}>{j.status}</span><div className="actions">{nextStatus(j).map(s=><button key={s} disabled={busy===j.id} onClick={()=>change(j,s)}>{s}</button>)}<button className="trash" disabled={busy===j.id} onClick={()=>remove(j.id)} aria-label="Delete job"><Trash2 size={16}/></button></div></motion.article>)}</AnimatePresence></div>}</div></section>
   </main>
 </div>
}

export default function App(){const [auth,setAuth]=useState(()=>localStorage.getItem('qp-auth')==='1');return auth?<Dashboard onLogout={()=>{localStorage.removeItem('qp-auth');setAuth(false)}}/>:<Login onLogin={()=>setAuth(true)}/>}

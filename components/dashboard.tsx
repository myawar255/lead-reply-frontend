"use client";
import Link from "next/link";import {useEffect,useState} from "react";import {conversations,leads,settings,templates} from "@/lib/api";import type {Conversation,Lead} from "@/lib/types";import {Alert,Empty,PageTitle,Spinner} from "./ui";import {SetupProgress,type SetupState} from "./setup-progress";
const rejection=(result:PromiseSettledResult<unknown>)=>result.status==="rejected"?result.reason:null;
export function Dashboard(){
 const [data,setData]=useState<{leads:Lead[];conversations:Conversation[]}|null>(null),[setup,setSetup]=useState<SetupState|null>(null),[error,setError]=useState("");
 useEffect(()=>{Promise.allSettled([leads.list("per_page=5"),conversations.list("per_page=5"),settings.workspace(),settings.acknowledgement(),templates.list()]).then(([leadResult,conversationResult,workspaceResult,ackResult,templateResult])=>{
  const failure=rejection(leadResult)||rejection(conversationResult);if(failure){setError(failure instanceof Error?failure.message:"Dashboard could not be loaded.");return}
  if(leadResult.status!=="fulfilled"||conversationResult.status!=="fulfilled")return;
  setData({leads:leadResult.value.data,conversations:conversationResult.value.data});
  if(workspaceResult.status==="fulfilled"&&ackResult.status==="fulfilled"&&templateResult.status==="fulfilled"){
   const workspace=workspaceResult.value.data,ack=ackResult.value.data;
   setSetup({profile:Boolean(workspace.name&&workspace.timezone&&workspace.country_code&&workspace.default_currency&&workspace.industry),template:templateResult.value.data.some(item=>item.type==="email"&&item.is_active),acknowledgement:Boolean(ack.enabled&&ack.template_uuid),lead:leadResult.value.meta.total>0});
  }
 })},[]);
 if(error)return <Alert>{error}</Alert>;if(!data)return <Spinner/>;
 const businessUuid=localStorage.getItem("leadreply_business_uuid");
 return <><PageTitle title="Good to see you" detail="Here’s the latest from your workspace."/>{setup&&businessUuid&&<SetupProgress state={setup} businessUuid={businessUuid}/>}<div className="grid gap-5 lg:grid-cols-2"><RecentLeads items={data.leads}/><RecentConversations items={data.conversations}/></div></>
}
function RecentLeads({items}:{items:Lead[]}){return <section><div className="mb-3 flex justify-between"><h2 className="font-bold">Recent leads</h2><Link href="/app/leads" className="text-sm font-bold">View all</Link></div>{items.length?<div className="card divide-y divide-[var(--line)]">{items.map(item=><Link className="flex min-w-0 justify-between gap-3 p-4 hover:bg-[#f8faf8]" href={`/app/leads/${item.uuid}`} key={item.uuid}><span className="min-w-0"><strong className="block truncate">{item.name||item.email||"Unnamed lead"}</strong><small className="muted block truncate">{item.company_name||item.email}</small></span><span className="badge self-start">{item.status.name}</span></Link>)}</div>:<Empty title="Your workspace is ready" detail="Leads will appear here when they are submitted to this workspace." action={<Link className="btn btn-secondary" href="/app/leads">Learn about leads</Link>}/>}</section>}
function RecentConversations({items}:{items:Conversation[]}){return <section><div className="mb-3 flex justify-between"><h2 className="font-bold">Recent conversations</h2><Link href="/app/conversations" className="text-sm font-bold">View all</Link></div>{items.length?<div className="card divide-y divide-[var(--line)]">{items.map(item=><Link className="block min-w-0 p-4 hover:bg-[#f8faf8]" href={`/app/conversations/${item.uuid}`} key={item.uuid}><strong className="block truncate">{item.lead?.name||item.lead?.email||"Conversation"}</strong><p className="muted mt-1 truncate text-sm">{item.latest_message?.preview||item.subject||"No messages"}</p></Link>)}</div>:<Empty title="No conversations yet" detail="Conversations will appear after a lead receives or sends an email." action={<Link className="btn btn-secondary" href="/app/templates">Review email templates</Link>}/>}</section>}

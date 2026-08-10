"use client";
export class ApiError extends Error { constructor(public status:number,message:string,public errors:Record<string,string[]>={}){super(message)} }
const apiUrl=()=>{const value=process.env.NEXT_PUBLIC_API_URL;if(!value) throw new Error("NEXT_PUBLIC_API_URL is not configured");return value.replace(/\/$/,"")};
const cookie=(name:string)=>document.cookie.split("; ").find(v=>v.startsWith(`${name}=`))?.split("=").slice(1).join("=");
export async function csrf(){await fetch(`${apiUrl()}/sanctum/csrf-cookie`,{credentials:"include",headers:{Accept:"application/json"}})}
export async function api<T>(path:string,init:RequestInit={},businessUuid?:string):Promise<T>{
 const method=(init.method||"GET").toUpperCase(); if(!["GET","HEAD","OPTIONS"].includes(method)) await csrf();
 const headers=new Headers(init.headers); headers.set("Accept","application/json"); if(init.body) headers.set("Content-Type","application/json");
 const token=cookie("XSRF-TOKEN"); if(token) headers.set("X-XSRF-TOKEN",decodeURIComponent(token));
 const selected=businessUuid||localStorage.getItem("leadreply_business_uuid"); if(selected) headers.set("X-Business-UUID",selected);
 const res=await fetch(`${apiUrl()}${path}`,{...init,headers,credentials:"include"});
 if(res.status===204) return undefined as T; const json=await res.json().catch(()=>({}));
 if(!res.ok){const messages:Record<string,string[]>=json.errors||{}; const fallback=res.status===401?"Please sign in to continue.":res.status===403?"You do not have permission to do that.":res.status===429?"Too many requests. Please wait and try again.":res.status>=500?"The service is temporarily unavailable.":json.message||"Something went wrong."; throw new ApiError(res.status,fallback,messages)} return json as T;
}

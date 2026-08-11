"use client";
export class ApiError extends Error{constructor(public status:number,message:string,public errors:Record<string,string[]>={}){super(message)}}
const apiUrl=()=>{const value=process.env.NEXT_PUBLIC_API_URL;if(!value)throw new Error("NEXT_PUBLIC_API_URL is not configured");return value.replace(/\/$/,"")};
const cookie=(name:string)=>document.cookie.split("; ").find(value=>value.startsWith(`${name}=`))?.split("=").slice(1).join("=");
export async function csrf(){const response=await fetch(`${apiUrl()}/sanctum/csrf-cookie`,{credentials:"include",headers:{Accept:"application/json"}});if(!response.ok)throw new ApiError(response.status,"Secure session initialization failed. Please refresh and try again.")}
export async function api<T>(path:string,init:RequestInit={},businessUuid?:string):Promise<T>{
 const method=(init.method||"GET").toUpperCase();if(!["GET","HEAD","OPTIONS"].includes(method))await csrf();
 const headers=new Headers(init.headers);headers.set("Accept","application/json");if(init.body)headers.set("Content-Type","application/json");
 const token=cookie("XSRF-TOKEN");if(token)headers.set("X-XSRF-TOKEN",decodeURIComponent(token));
 const selected=businessUuid||localStorage.getItem("leadreply_business_uuid");if(selected)headers.set("X-Business-UUID",selected);
 const response=await fetch(`${apiUrl()}${path}`,{...init,headers,credentials:"include"});
 if(response.status===204)return undefined as T;
 const json=await response.json().catch(()=>({})) as {message?:string;errors?:Record<string,string[]>};
 if(!response.ok){
  if(response.status===401)window.dispatchEvent(new Event("leadreply:unauthorized"));
  const message=response.status===401?"Please sign in to continue.":response.status===403?"You do not have permission to do that.":response.status===404?"The requested record could not be found.":response.status===409?json.message||"The request conflicts with the current state.":response.status===429?"Too many requests. Please wait and try again.":response.status>=500?"The service is temporarily unavailable.":json.message||"Something went wrong.";
  throw new ApiError(response.status,message,json.errors||{});
 }
 return json as T;
}

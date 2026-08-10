import type {PublicPlan} from "../types";
const base=()=>process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,"");
export async function publicPlans(currency?:string):Promise<PublicPlan[]>{const url=base();if(!url)throw new Error("Pricing is temporarily unavailable.");const query=currency?`?currency=${encodeURIComponent(currency)}`:"";const response=await fetch(`${url}/api/public/plans${query}`,{headers:{Accept:"application/json"},next:{revalidate:300}});if(!response.ok)throw new Error("Pricing is temporarily unavailable.");const body=await response.json() as {data:PublicPlan[]};return body.data;}

import {LeadDetail} from "@/components/lead-detail";export default async function Page({params}:{params:Promise<{uuid:string}>}){return <LeadDetail uuid={(await params).uuid}/>}

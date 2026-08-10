import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.leadreply.com";
export const metadata: Metadata = {
  metadataBase: new URL(appUrl), title:{default:"LeadReply — Turn every enquiry into a conversation",template:"%s | LeadReply"},
  description:"A focused lead inbox for teams that want to respond faster and keep every opportunity moving.",
  openGraph:{title:"LeadReply",description:"Turn every enquiry into a conversation.",type:"website",siteName:"LeadReply"},
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }

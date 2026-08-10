import type {Metadata} from "next"; import {Brand} from "@/components/brand";
export const metadata:Metadata={robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <main className="grid min-h-screen place-items-center px-4 py-10"><div className="w-full max-w-md"><div className="mb-7 flex justify-center"><Brand/></div>{children}</div></main>}

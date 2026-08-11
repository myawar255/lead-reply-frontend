import {NextRequest,NextResponse} from "next/server";
const redirect=(request:NextRequest,path:string)=>NextResponse.redirect(new URL(path,request.url));
export async function proxy(request:NextRequest){
 const path=request.nextUrl.pathname,appRoute=path.startsWith("/app"),adminRoute=path.startsWith("/admin"),guestRoute=path==="/login"||path==="/register",verificationRoute=path==="/verify-email";
 const base=process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,"");
 if(!base)return appRoute||adminRoute||verificationRoute?redirect(request,"/login"):NextResponse.next();
 try{
  const response=await fetch(`${base}${adminRoute?"/api/admin/me":"/api/auth/me"}`,{headers:{Accept:"application/json",Cookie:request.headers.get("cookie")||""},cache:"no-store"});
  if(adminRoute)return response.ok?NextResponse.next():redirect(request,"/login");
  if(!response.ok)return appRoute||verificationRoute?redirect(request,"/login"):NextResponse.next();
  const body=await response.json() as {user?:{email_verified_at:string|null}},verified=Boolean(body.user?.email_verified_at);
  if(!verified)return verificationRoute?NextResponse.next():redirect(request,"/verify-email");
  if(guestRoute||verificationRoute)return redirect(request,"/app");
  return NextResponse.next();
 }catch{return appRoute||adminRoute||verificationRoute?redirect(request,"/login"):NextResponse.next()}
}
export const config={matcher:["/app/:path*","/admin/:path*","/login","/register","/verify-email"]};

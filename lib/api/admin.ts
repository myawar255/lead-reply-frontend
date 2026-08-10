import {api} from "./client";
import type {AdminBusiness,AdminIntegrationError,AdminOverview,AdminSystemHealth,AdminUser,Page,PlatformAdmin} from "../types";
const query=(p:URLSearchParams|string="")=>typeof p==="string"?p:p.toString();
export const admin={me:()=>api<{admin:PlatformAdmin}>("/api/admin/me"),overview:()=>api<AdminOverview>("/api/admin/overview"),businesses:(p:URLSearchParams|string="")=>api<Page<AdminBusiness>>(`/api/admin/businesses?${query(p)}`),users:(p:URLSearchParams|string="")=>api<Page<AdminUser>>(`/api/admin/users?${query(p)}`),integrationErrors:(p:URLSearchParams|string="")=>api<Page<AdminIntegrationError>>(`/api/admin/integration-errors?${query(p)}`),systemHealth:()=>api<{data:AdminSystemHealth[]}>("/api/admin/system-health")};

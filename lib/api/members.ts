import {api} from "./client";
import type {Assignee,BusinessMember,Page} from "../types";
export const members={list:(params:URLSearchParams|string="")=>api<Page<BusinessMember>>(`/api/app/members?${typeof params==="string"?params:params.toString()}`),assignees:()=>api<{data:Assignee[]}>("/api/app/assignees")};

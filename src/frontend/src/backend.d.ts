import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    lastVisitTime: bigint;
    totalVisits: bigint;
    totalSearches: bigint;
}
export interface EmployeeCount {
    name: string;
    count: bigint;
}
export interface SearchRecord {
    name: string;
    timestamp: bigint;
}
export interface backendInterface {
    getMostSearched(limit: bigint): Promise<Array<EmployeeCount>>;
    getRecentSearches(limit: bigint): Promise<Array<SearchRecord>>;
    getStats(): Promise<Stats>;
    getVisits(): Promise<bigint>;
    incrementVisits(): Promise<bigint>;
    recordSearch(name: string): Promise<bigint>;
}

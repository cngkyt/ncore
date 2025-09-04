export default COOKIE;
declare namespace COOKIE {
    function SET(key: any, sec: any, value: any): boolean;
    function GET(key: any, sec: any): any;
    function REMOVE(key: any, sec: any): void;
    function CLEAR(): void;
    function HAS(key: any, sec: any): boolean;
    function KEYS(): string[];
    function SIZE(): number;
    function GET_STORAGE_INFO(): {
        used: number;
        estimated: number;
        usage: number;
        count: number;
    };
}

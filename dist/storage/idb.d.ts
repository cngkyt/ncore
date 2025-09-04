export default IDB;
declare namespace IDB {
    function INIT(): Promise<any>;
    function SET(key: any, value: any): Promise<any>;
    function GET(key: any): Promise<any>;
    function REMOVE(key: any): Promise<any>;
    function CLEAR(): Promise<any>;
    function HAS(key: any): Promise<any>;
    function KEYS(): Promise<any>;
    function SIZE(): Promise<any>;
    function GET_STORAGE_INFO(): Promise<{
        used: number;
        estimated: number;
        usage: number;
        count: any;
        persistent: boolean;
    } | {
        used: string;
        estimated: string;
        usage: string;
        count: any;
        persistent: boolean;
    }>;
    function CLOSE(): void;
}

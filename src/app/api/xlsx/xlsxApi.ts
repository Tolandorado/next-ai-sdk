import { BaseApi } from '../BaseApi';

export interface XlsxRangeParams {
    sheet: string;
    from: string;
    to: string;
}

export interface XlsxRangeResponse {
    range: {
        sheet: string;
        from: string;
        to: string;
    };
    data: { value: string | number | null }[][];
}

export interface XlsxUpdateParams {
    mode: 'cell' | 'range';
    sheet: string;
    cell?: string;
    value?: any;
    from?: string;
    to?: string;
    values?: any[][];
}

class XlsxApi extends BaseApi {
    async getRange(params: XlsxRangeParams): Promise<XlsxRangeResponse> {
        const query = new URLSearchParams(params as any).toString();
        return this.get<XlsxRangeResponse>(`/api/xlsx/range?${query}`);
    }

    async update(payload: XlsxUpdateParams): Promise<void> {
        return this.post<void>('/api/xlsx/update', payload);
    }
}

export const xlsxApi = new XlsxApi();
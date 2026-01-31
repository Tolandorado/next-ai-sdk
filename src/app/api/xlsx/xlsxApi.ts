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

class XlsxApi extends BaseApi {
    async getRange(params: XlsxRangeParams): Promise<XlsxRangeResponse> {
        const query = new URLSearchParams(params as any).toString();
        return this.get<XlsxRangeResponse>(`/api/xlsx/range?${query}`);
    }
}

export const xlsxApi = new XlsxApi();
export interface SimpleResponse {
    success: boolean;
    error?: string;
}

export class Paginator {
    readonly itemsPerPage: number;
    readonly currentPage: number;

    constructor(itemsPerPage: number, currentPage: number) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = currentPage;
    }

    get offset(): number {
        return this.itemsPerPage * (this.currentPage - 1);
    }

    get limit(): number {
        return this.itemsPerPage + 1;
    }
}
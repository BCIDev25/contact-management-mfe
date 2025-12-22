import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DropdownResponse,
  ContactStaffList,
  ImportStaffRow,
} from '../../models/contact';

interface ContactStaffListResponse {
  data: ContactStaffList[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContactStaffService {
    private apiUrl = environment.apiUrl;

    private dropdownCache$: Observable<DropdownResponse> | null = null;

    constructor(private http: HttpClient) { }

    getContactStaff(filter: Record<string, any> = {}): Observable<ContactStaffList[]> {
        const params = new HttpParams({ fromObject: filter as any });
        return this.http.get<ContactStaffList[]>(
        `${this.apiUrl}/v1/contact-staff/list`,
        { params },
        );
    }

    getStaffById(uniqId: number): Observable<ContactStaffList> {
        return this.http.get<ContactStaffList>(`${this.apiUrl}/v1/contact-staff/${uniqId}`);
    }

    createStaff(payload: Record<string, any>): Observable<any> {
        return this.http.post(`${this.apiUrl}/v1/contact-staff/add`, payload)
    }

    importStaff(staffList: ImportStaffRow[]): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/contact-staff/import`, staffList);
    }

    updateStaff(id: number, data: Record<string, any>): Observable<ContactStaffList> {
        return this.http.put<ContactStaffList>(`${this.apiUrl}/v1/contact-staff/${id}`, data);
    }

    updateStaffSecurity(id: number, data: Record<string, any>): Observable<any> {
        return this.http.put(`${this.apiUrl}/v1/contact-staff/security/${id}`, data);
    }

    /**
     * Get specific dropdowns by type
     * Use when only certain dropdowns are needed
     * 
     * @param types - Array of types: 'projects', 'staff', 'salesmen', etc.
     */
    getDropdownsByTypes(types: string[]): Observable<DropdownResponse> {
        const typesParam = types.join(',');
        return this.http.get<DropdownResponse>(
            `${this.apiUrl}/v1/dropdowns?types=${typesParam}`
        );
    }

    clearCache(): void {
        this.dropdownCache$ = null;
    }
}

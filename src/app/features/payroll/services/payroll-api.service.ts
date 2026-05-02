import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PayrollRun,
  PayrollRecord,
  PayrollFilter,
  SalaryComponent,
  SalaryStructure,
  PayrollStatus,
} from '../models/payroll.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PayrollApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll`;

  // Salary Components
  getSalaryComponents(): Observable<ListResponse<SalaryComponent>> {
    return this.http.get<ListResponse<SalaryComponent>>(`${this.baseUrl}/salary-components`);
  }

  getSalaryComponent(id: number | string): Observable<DetailResponse<SalaryComponent>> {
    return this.http.get<DetailResponse<SalaryComponent>>(
      `${this.baseUrl}/salary-components/${id}`,
    );
  }

  createSalaryComponent(
    component: Partial<SalaryComponent>,
  ): Observable<DetailResponse<SalaryComponent>> {
    return this.http.post<DetailResponse<SalaryComponent>>(
      `${this.baseUrl}/salary-components`,
      component,
    );
  }

  updateSalaryComponent(
    id: number,
    component: Partial<SalaryComponent>,
  ): Observable<DetailResponse<SalaryComponent>> {
    return this.http.put<DetailResponse<SalaryComponent>>(
      `${this.baseUrl}/salary-components/${id}`,
      component,
    );
  }

  deleteSalaryComponent(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/salary-components/${id}`);
  }

  // Salary Structures
  getSalaryStructures(): Observable<ListResponse<SalaryStructure>> {
    return this.http.get<ListResponse<SalaryStructure>>(`${this.baseUrl}/salary-structures`);
  }

  getSalaryStructure(id: number | string): Observable<DetailResponse<SalaryStructure>> {
    return this.http.get<DetailResponse<SalaryStructure>>(
      `${this.baseUrl}/salary-structures/${id}`,
    );
  }

  createSalaryStructure(structure: any): Observable<DetailResponse<SalaryStructure>> {
    return this.http.post<DetailResponse<SalaryStructure>>(
      `${this.baseUrl}/salary-structures`,
      structure,
    );
  }

  updateSalaryStructure(id: number, structure: any): Observable<DetailResponse<SalaryStructure>> {
    return this.http.put<DetailResponse<SalaryStructure>>(
      `${this.baseUrl}/salary-structures/${id}`,
      structure,
    );
  }

  deleteSalaryStructure(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/salary-structures/${id}`);
  }

  getStructureComponents(structureId: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(
      `${this.baseUrl}/salary-structures/${structureId}/components`,
    );
  }

  addStructureComponent(
    structureId: number | string,
    component: any,
  ): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(
      `${this.baseUrl}/salary-structures/${structureId}/components`,
      component,
    );
  }

  updateStructureComponent(
    componentId: number | string,
    component: any,
  ): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(
      `${this.baseUrl}/structure-components/${componentId}`,
      component,
    );
  }

  deleteStructureComponent(componentId: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/structure-components/${componentId}`);
  }

  // Employee Salaries
  getEmployeeSalaries(employeeId: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/employees/${employeeId}/salary`);
  }

  getCurrentSalary(employeeId: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(
      `${this.baseUrl}/employees/${employeeId}/current-salary`,
    );
  }

  createEmployeeSalary(employeeId: number | string, salary: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(
      `${this.baseUrl}/employees/${employeeId}/salary`,
      salary,
    );
  }

  updateEmployeeSalary(id: number | string, salary: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/employee-salaries/${id}`, salary);
  }

  // Payroll Runs
  listRuns(params?: Record<string, unknown>): Observable<ListResponse<PayrollRun>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<PayrollRun>>(`${this.baseUrl}/runs`, { params: httpParams });
  }

  getRunById(id: number | string): Observable<DetailResponse<PayrollRun>> {
    return this.http.get<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}`);
  }

  createRun(run: any): Observable<DetailResponse<PayrollRun>> {
    return this.http.post<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs`, run);
  }

  updateRun(id: number | string, run: any): Observable<DetailResponse<PayrollRun>> {
    return this.http.put<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}`, run);
  }

  processRun(id: number | string): Observable<DetailResponse<PayrollRun>> {
    return this.http.post<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/process`, {});
  }

  // Payslips
  getPayslips(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/payslips`);
  }

  getPayslip(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/payslips/${id}`);
  }

  createPayslip(payslip: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/payslips`, payslip);
  }

  updatePayslip(id: number | string, payslip: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/payslips/${id}`, payslip);
  }

  // Bonus
  getBonusRecords(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/bonus`);
  }

  createBonus(bonus: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/bonus`, bonus);
  }

  updateBonus(id: number | string, bonus: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/bonus/${id}`, bonus);
  }

  // Tax
  calculateTax(taxData: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/tax/calculate`, taxData);
  }

  getPFConfig(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/config/pf`);
  }

  getESIConfig(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/config/esi`);
  }

  // Legacy methods
  getRunRecords(
    runId: number,
    params?: Record<string, unknown>,
  ): Observable<ListResponse<PayrollRecord>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<PayrollRecord>>(`${this.baseUrl}/runs/${runId}/records`, {
      params: httpParams,
    });
  }

  getRecordById(id: number): Observable<DetailResponse<PayrollRecord>> {
    return this.http.get<DetailResponse<PayrollRecord>>(`${this.baseUrl}/records/${id}`);
  }

  approveRun(id: number): Observable<ApiResponse<PayrollRun>> {
    return this.http.post<ApiResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/approve`, {});
  }

  markAsPaid(id: number): Observable<ApiResponse<PayrollRun>> {
    return this.http.post<ApiResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/paid`, {});
  }

  generateSlip(runId: number, employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/slip/${runId}/${employeeId}`, { responseType: 'blob' });
  }
}

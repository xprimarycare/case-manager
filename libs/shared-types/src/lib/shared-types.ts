export interface CaseDto {
  id: string;
  title: string;
  patientName: string;
  summary: string;
}

export interface CreateCaseDto {
  title: string;
  patientName: string;
  summary: string;
}

export interface UpdateCaseDto {
  title?: string;
  patientName?: string;
  summary?: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SBARHandover {
  id: string;
  date: string; // ISO string locale date
  patientName: string;
  age: number | string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  room: string;
  bed: string;
  diagnosis: string;
  
  situation: string;      // S: Situation
  background: string;     // B: Background
  assessment: string;     // A: Assessment
  recommendation: string; // R: Recommendation
  
  status: HandoverStatus;
  createdAt: string;
  updatedAt: string;
}

export type HandoverStatus = 'active' | 'archived';

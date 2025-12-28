export interface CycleData {
  id: number;
  startDate: number; // timestamp ms
  endDate: number | null;
  length: number | null;
  isPredicted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CycleHistory {
  length: number;
  startDate: Date;
  endDate: Date;
}

export interface RiverDataPoint {
  time: string;
  value: number;
}

export interface RiverDataResponse {
  site: string;
  location: string;
  observed: number | null;
  unit: string;
  time: string | null;
  floodStage: number | null;
  history: RiverDataPoint[];
  prediction: RiverDataPoint[];
}

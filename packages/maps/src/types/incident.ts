import { Coordinates } from "./parking";

export type IncidentType =
  | "accident"
  | "construction"
  | "roadblock"
  | "police"
  | "flood"
  | "fire";

export interface Incident {

  id: string;

  type: IncidentType;

  title: string;

  description: string;

  location: Coordinates;

  severity: 1 | 2 | 3 | 4 | 5;

  reportedAt: Date;

}

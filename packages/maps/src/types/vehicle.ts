import { Coordinates } from "./parking";

export type VehicleType =
  | "car"
  | "motorcycle"
  | "truck"
  | "bus"
  | "emergency";

export interface Vehicle {

  id: string;

  plateNumber: string;

  driver: string;

  type: VehicleType;

  speed: number;

  heading: number;

  location: Coordinates;

  destination?: Coordinates;

  battery?: number;

  fuel?: number;

  online: boolean;

}

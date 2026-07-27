export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  location: Coordinates;

  capacity: number;
  occupied: number;
  available: number;

  hourlyRate: number;

  evChargers: number;

  accessibleSpaces: number;

  motorcycleSpaces: number;

  busSpaces: number;

  securityRating: number;

  isOpen: boolean;
}

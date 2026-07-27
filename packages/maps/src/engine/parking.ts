import { ParkingLot } from "../types";

export function simulateParking(parking: ParkingLot[]) {

    return parking.map(lot => {

        const occupied = Math.floor(Math.random() * lot.capacity);

        return {

            ...lot,

            occupied,

            available: lot.capacity - occupied

        };

    });

}

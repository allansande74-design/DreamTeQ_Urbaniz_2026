import { Vehicle } from "../types";

export function generateVehicles(count: number): Vehicle[] {

    const vehicles: Vehicle[] = [];

    for (let i = 0; i < count; i++) {

        vehicles.push({

            id: crypto.randomUUID(),

            plateNumber: `UB${1000 + i}`,

            driver: `Driver ${i + 1}`,

            type: "car",

            speed: Math.floor(Math.random() * 80),

            heading: Math.random() * 360,

            location: {

                lat: 0.3476 + Math.random() * 0.10,

                lng: 32.5825 + Math.random() * 0.10

            },

            destination: {

                lat: 0.3476 + Math.random() * 0.10,

                lng: 32.5825 + Math.random() * 0.10

            },

            battery: 100,

            fuel: 80,

            online: true

        });

    }

    return vehicles;

}

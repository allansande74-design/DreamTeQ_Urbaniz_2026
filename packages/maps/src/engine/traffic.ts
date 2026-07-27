import { TrafficSegment } from "../types";

export function generateTraffic(): TrafficSegment[] {

    return [

        {

            id: "1",

            road: "Jinja Road",

            averageSpeed: 42,

            congestion: 31,

            travelTime: 12,

            incidents: 0

        },

        {

            id: "2",

            road: "Entebbe Road",

            averageSpeed: 21,

            congestion: 74,

            travelTime: 35,

            incidents: 2

        }

    ];

}

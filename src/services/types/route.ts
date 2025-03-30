export interface Location {
  // Define properties of Location according to your requirements
  latitude: number;    // Example property
  longitude: number;   // Example property
}

export interface RoutePath {
  id: string;          // bson.ObjectID is typically represented as a string in TypeScript
  name: string;        // string remains the same
  routePoints: Location[]; // Array of Location type
}

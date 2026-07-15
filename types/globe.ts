export interface CountryFeatureProperties {
  ISO_A2: string;
  NAME: string;
  ADMIN: string;
}

export interface CountryFeature {
  type: "Feature";
  properties: CountryFeatureProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface CountryFeatureCollection {
  type: "FeatureCollection";
  features: CountryFeature[];
}

export interface GlobePointOfView {
  lat: number;
  lng: number;
  altitude: number;
}

export interface GlobeControls {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
}

export interface GlobeInstance {
  controls: () => GlobeControls;
  pointOfView: (
    pov?: Partial<GlobePointOfView>,
    transitionMs?: number
  ) => GlobePointOfView | void;
}

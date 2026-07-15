declare module "react-globe.gl" {
  import type { FC, RefObject } from "react";
  import type { GlobeInstance } from "@/types/globe";

  interface GlobeProps {
    ref?: RefObject<GlobeInstance | undefined>;
    width?: number;
    height?: number;
    backgroundColor?: string;
    globeImageUrl?: string;
    bumpImageUrl?: string;
    showAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    polygonsData?: object[];
    polygonCapColor?: (feature: object) => string;
    polygonSideColor?: (feature: object) => string;
    polygonStrokeColor?: (feature: object) => string;
    polygonAltitude?: (feature: object) => number;
    polygonsTransitionDuration?: number;
    onPolygonHover?: (feature: object | null) => void;
    onPolygonClick?: (feature: object) => void;
    onGlobeReady?: () => void;
    animateIn?: boolean;
    pointsData?: object[];
    pointLat?: string;
    pointLng?: string;
    pointColor?: string | ((point: object) => string);
    pointRadius?: number | string | ((point: object) => number);
    pointAltitude?: number | string | ((point: object) => number);
    ringsData?: object[];
    ringLat?: string;
    ringLng?: string;
    ringColor?: string | ((ring: object) => string);
    ringMaxRadius?: number;
    ringPropagationSpeed?: number;
    ringRepeatPeriod?: number;
    arcsData?: object[];
    arcStartLat?: string;
    arcStartLng?: string;
    arcEndLat?: string;
    arcEndLng?: string;
    arcColor?: string | ((arc: object) => string);
    arcAltitude?: number | ((arc: object) => number);
    arcStroke?: number | ((arc: object) => number);
    arcDashLength?: number;
    arcDashGap?: number;
    arcDashAnimateTime?: number;
    labelsData?: object[];
    labelLat?: string;
    labelLng?: string;
    labelText?: string;
    labelSize?: number | string | ((label: object) => number);
    labelColor?: string | ((label: object) => string);
    labelDotRadius?: number;
    labelResolution?: number;
  }

  const Globe: FC<GlobeProps>;
  export default Globe;
}

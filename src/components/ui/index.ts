// Kept Connect — shared UI primitive library. Built once, consumed by all three
// surfaces (marketing / requester / provider). Import the stylesheet once at the
// app or page level: `import "@/components/ui/styles/ui.css"`.

export { Surface } from "./Surface";
export type { SurfaceProps } from "./Surface";

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Card, Panel } from "./Card";
export type { CardProps } from "./Card";

export { Tag } from "./Tag";
export type { TagProps } from "./Tag";

export { Avatar } from "./Avatar";
export type { AvatarProps } from "./Avatar";

export { StatusRing } from "./StatusRing";
export type { StatusRingProps, RingState } from "./StatusRing";

export { CategoryIcon, CATEGORIES } from "./CategoryIcon";
export type { CategoryIconProps, CategoryKey } from "./CategoryIcon";

export { VerifiedCheck } from "./VerifiedCheck";
export type { VerifiedCheckProps } from "./VerifiedCheck";

export { Field } from "./Field";
export type { FieldProps } from "./Field";

// The brand mark is exported from the library too (per task requirement),
// superseding the placeholder at src/components/KeptConnectLogo.tsx.
export { KeptConnectLogo } from "./KeptConnectLogo";
export type { KeptConnectLogoProps, LogoTreatment } from "./KeptConnectLogo";

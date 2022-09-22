export type ChangeEventPayload = {
  value: string;
};
export type MBXNavigationNativeViewProps = {
  name: string;
  onRouteStarted(value:string): void;
};

export type MBXNavigationViewProps = {
  name: string;
  onRouteStarted(value:string): void;
};

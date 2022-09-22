import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to MBXNavigation.web.ts
// and on native platforms to MBXNavigation.ts
import MBXNavigation from './MBXNavigationModule';
import MBXNavigationView from './MBXNavigationView';
import { ChangeEventPayload, MBXNavigationViewProps } from './MBXNavigation.types';

// Get the native constant value.
export const PI = MBXNavigation.PI;

export function hello(): string {
  return MBXNavigation.hello();
}

export async function setValueAsync(value: string) {
  return await MBXNavigation.setValueAsync(value);
}

// For now the events are not going through the JSI, so we have to use its bridge equivalent.
// This will be fixed in the stable release and built into the module object.
const emitter = new EventEmitter(NativeModulesProxy.MBXNavigation);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { MBXNavigationView, MBXNavigationViewProps, ChangeEventPayload };

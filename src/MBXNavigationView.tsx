import { requireNativeViewManager } from 'expo-modules-core';
import { StyleSheet, View } from 'react-native';
import * as React from 'react';

import { MBXNavigationViewProps, MBXNavigationNativeViewProps } from './MBXNavigation.types';

const NativeView: React.ComponentType<MBXNavigationNativeViewProps> =
  requireNativeViewManager('MBXNavigation');

const MBXNavigationView = (props: MBXNavigationViewProps) => {
  return <NativeView name={props.name} onRouteStarted={props.onRouteStarted} />
}

export default MBXNavigationView;

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/theme';

interface FlexLayoutProps {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}

export const Row: React.FC<FlexLayoutProps> = ({
  children,
  gap = Spacing.inlineGapSm,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        gap,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export const Col: React.FC<FlexLayoutProps> = ({
  children,
  gap = Spacing.inlineGapSm,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'column',
        gap,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export const Grid: React.FC<FlexLayoutProps & { columns?: number }> = ({
  children,
  gap = Spacing.cardGap,
  columns = 2,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        justifyContent: 'space-between',
      },
      style,
    ]}
  >
    {React.Children.map(children, (child) =>
      React.cloneElement(child as React.ReactElement, {
        style: [
          {
            width: `${100 / columns - (gap * (columns - 1)) / columns}%`,
          },
          (child as React.ReactElement).props.style,
        ],
      })
    )}
  </View>
);

export const Center: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View
    style={[
      {
        justifyContent: 'center',
        alignItems: 'center',
      },
      style,
    ]}
  >
    {children}
  </View>
);

export const Between: React.FC<FlexLayoutProps> = ({
  children,
  gap = 0,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap,
      },
      style,
    ]}
  >
    {children}
  </View>
);

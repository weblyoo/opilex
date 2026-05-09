import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  isDark?: boolean;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000', 
  strokeWidth = 2,
  isDark = false
}) => {
  // Common props for all Svg components to fix boolean cast error
  const svgProps = {
    accessible: false,
    accessibilityRole: 'image' as const,
  };

  const renderIcon = () => {
    switch (name) {
      case 'bank':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M3 21h18M5 21V7l8-4 8 4v14M9 9v4M15 9v4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'add-account':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Rect
              x="2"
              y="3"
              width="20"
              height="14"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Line
              x1="8"
              y1="21"
              x2="16"
              y2="21"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="12"
              y1="17"
              x2="12"
              y2="21"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="9"
              y1="9"
              x2="15"
              y2="9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="12"
              y1="6"
              x2="12"
              y2="12"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'authenticate':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 12l2 2 4-4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'wallet':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 12h5l-2-2m2 2l-2 2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'purchase-history':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Polyline
              points="14,2 14,8 20,8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="16"
              y1="13"
              x2="8"
              y2="13"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="16"
              y1="17"
              x2="8"
              y2="17"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Polyline
              points="10,9 9,9 8,9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'schemes':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="9"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M23 21v-2a4 4 0 0 0-3-3.87"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'coupons':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 12a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M7 8V7a5 5 0 0 1 10 0v1"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="7"
              y1="17"
              x2="7"
              y2="17"
              stroke={color}
              strokeWidth={strokeWidth + 1}
              strokeLinecap="round"
            />
            <Line
              x1="17"
              y1="17"
              x2="17"
              y2="17"
              stroke={color}
              strokeWidth={strokeWidth + 1}
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'gold':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Path
              d="M16 10a4 4 0 0 1-8 0"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'settings':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'support':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10 9.5a2 2 0 1 1 4 0c0 .5-.5 1-1 1.5L12 13"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="12"
              y1="17"
              x2="12"
              y2="17"
              stroke={color}
              strokeWidth={strokeWidth + 1}
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'scan':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="13"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );
      
      case 'moon':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'sun':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Line
              x1="12"
              y1="1"
              x2="12"
              y2="3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="12"
              y1="21"
              x2="12"
              y2="23"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="4.22"
              y1="4.22"
              x2="5.64"
              y2="5.64"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="1"
              y1="12"
              x2="3"
              y2="12"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="21"
              y1="12"
              x2="23"
              y2="12"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="4.22"
              y1="19.78"
              x2="5.64"
              y2="18.36"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'price-list':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 8h8M8 12h8M8 16h4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="17"
              cy="8"
              r="1"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M16.5 9.5l1 1"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </Svg>
        );
      
      case 'product-catalogue':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Polyline
              points="14,2 14,8 20,8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="16"
              y1="13"
              x2="8"
              y2="13"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Line
              x1="16"
              y1="17"
              x2="8"
              y2="17"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Polyline
              points="10,9 9,9 8,9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'social-media':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="2"
              cy="2"
              r="1"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx="22"
              cy="22"
              r="1"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx="22"
              cy="2"
              r="1"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );
      
      case 'store-locator':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="10"
              r="3"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M3 20h18"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'gift-box':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M22 7H2v5h20V7z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 22V7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'star':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'arrow-left':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M19 12H5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 19l-7-7 7-7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'leadership-board':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M16 13v8a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 5a4 4 0 0 0-8 0"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M4 13h16v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="8"
              r="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M8 13h8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'watch-tutorial':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Rect
              x="2"
              y="3"
              width="20"
              height="14"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10 9l5 3-5 3V9z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 21h8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 17v4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'add-account':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M16 11h6m-3-3v6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'gold':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 12l2 2 4-4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 6v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 16v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'refresh':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M1 4v6h6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M23 20v-6h-6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'bell':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="18"
              cy="8"
              r="3"
              fill={color}
              opacity="0.8"
            />
          </Svg>
        );

      case 'chevron-down':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M6 9l6 6 6-6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'globe':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M2 12h20"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'close':
      case 'x':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M18 6L6 18"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M6 6L18 18"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'arrow-right':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M5 12h14"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 5l7 7-7 7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'electrician':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            {/* Person's head */}
            <Circle
              cx="12"
              cy="9"
              r="2.5"
              fill={color}
            />
            
            {/* Safety helmet */}
            <Path
              d="M7 6.5h10l-0.5 3.5H7.5L7 6.5z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Helmet strap */}
            <Path
              d="M8 6.5v-1M16 6.5v-1"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Person's body */}
            <Path
              d="M12 11.5v3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Path
              d="M9 14l3 3 3-3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Screwdriver in hand */}
            <Path
              d="M15 13l3-2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Path
              d="M17 12l1-0.5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Path
              d="M18 11.5l0.5-0.5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Electrical wires */}
            <Path
              d="M3 16l4-2M2 18l5-1.5M1 20l6-1"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Electrical components/outlet */}
            <Rect
              x="16"
              y="15"
              width="6"
              height="4"
              rx="0.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx="17.5"
              cy="17"
              r="0.5"
              fill={color}
            />
            <Circle
              cx="20.5"
              cy="17"
              r="0.5"
              fill={color}
            />
            <Path
              d="M18 18.5h2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Wire connections */}
            <Path
              d="M15 15l1 1M16 16l2 0.5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Safety gear - goggles */}
            <Path
              d="M10 8.5h4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'dealer':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            {/* Store structure - clean and simple */}
            <Path
              d="M3 8h18v12H3z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Awning/Canopy - clean design */}
            <Path
              d="M2 8l10-3 10 3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Support posts for awning */}
            <Path
              d="M6 8v12M18 8v12"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            
            {/* Large display window */}
            <Rect
              x="5"
              y="9"
              width="14"
              height="8"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            
            {/* Boxes/Packages visible in window */}
            <Rect
              x="7"
              y="11"
              width="2"
              height="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="10"
              y="10.5"
              width="2"
              height="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="13"
              y="11"
              width="2"
              height="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="16"
              y="10.5"
              width="2"
              height="2"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            
            {/* Additional smaller packages */}
            <Rect
              x="8"
              y="13.5"
              width="1.5"
              height="1.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="10.5"
              y="13"
              width="1.5"
              height="1.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="13"
              y="13.5"
              width="1.5"
              height="1.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Rect
              x="15.5"
              y="13"
              width="1.5"
              height="1.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            
            {/* Store entrance door */}
            <Rect
              x="11"
              y="15"
              width="2"
              height="5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx="12.5"
              cy="17.5"
              r="0.5"
              fill={color}
            />
            
            {/* Simple store sign */}
            <Rect
              x="10"
              y="6"
              width="4"
              height="1"
              rx="0.5"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );

      case 'check':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M20 6L9 17l-5-5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'arrow-left':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M19 12H5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 19l-7-7 7-7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'external-link':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M15 3h6v6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10 14L21 3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'mail':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M22 6l-10 7L2 6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'user':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );

      case 'download':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M7 10l5 5 5-5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 15V3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'share':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 6l-4-4-4 4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 2v13"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'calendar':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M8 2v4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 2v4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3 10h18"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'info':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M12 16v-4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 8h.01"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'phone':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'history':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            {/* Round circle */}
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Clock hands */}
            <Path
              d="M12 7v5l3 3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Circular arrow showing history/time */}
            <Path
              d="M4.5 7.5A9 9 0 0 1 12 3"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M4.5 7.5H7.5M4.5 7.5V4.5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'send':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M22 2L11 13"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M22 2L15 22l-4-9-9-4 20-7z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'clock':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M12 6v6l4 2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'log-out':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 17l5-5-5-5"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M21 12H9"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case 'opilex-logo':
        // Light theme logo - clean, minimal design
        if (!isDark) {
          return (
            <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...svgProps}>
              {/* Clean K letter for light theme */}
              <Path
                d="M20 15 L20 85 L30 85 L30 55 L65 85 L80 85 L50 50 L75 15 L60 15 L35 45 L30 45 L30 15 Z"
                fill="#1a1a1a"
                stroke="#1a1a1a"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Minimal wire frame for light theme */}
              <Path
                d="M15 25 L85 25"
                stroke="#666666"
                strokeWidth={strokeWidth * 0.6}
                strokeLinecap="round"
                opacity="0.7"
              />
              <Path
                d="M15 75 L85 75"
                stroke="#666666"
                strokeWidth={strokeWidth * 0.6}
                strokeLinecap="round"
                opacity="0.7"
              />
              
              {/* Simple connection points */}
              <Circle cx="15" cy="25" r={strokeWidth * 0.5} fill="#666666" opacity="0.8" />
              <Circle cx="85" cy="25" r={strokeWidth * 0.5} fill="#666666" opacity="0.8" />
              <Circle cx="15" cy="75" r={strokeWidth * 0.5} fill="#666666" opacity="0.8" />
              <Circle cx="85" cy="75" r={strokeWidth * 0.5} fill="#666666" opacity="0.8" />
              
              {/* Subtle accent lines */}
              <Path
                d="M25 30 L35 30"
                stroke="#999999"
                strokeWidth={strokeWidth * 0.4}
                strokeLinecap="round"
                opacity="0.5"
              />
              <Path
                d="M25 70 L35 70"
                stroke="#999999"
                strokeWidth={strokeWidth * 0.4}
                strokeLinecap="round"
                opacity="0.5"
              />
            </Svg>
          );
        }
        
        // Dark theme logo - bold, industrial design
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...svgProps}>
            {/* Bold K letter for dark theme */}
            <Path
              d="M20 15 L20 85 L30 85 L30 55 L65 85 L80 85 L50 50 L75 15 L60 15 L35 45 L30 45 L30 15 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Industrial wire frame for dark theme */}
            <Path
              d="M15 25 L85 25"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            <Path
              d="M15 75 L85 75"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            
            {/* Vertical connection posts */}
            <Path
              d="M15 25 L15 35"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            <Path
              d="M85 25 L85 35"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            <Path
              d="M15 65 L15 75"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            <Path
              d="M85 65 L85 75"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 1.2}
              strokeLinecap="round"
              opacity="0.9"
            />
            
            {/* Bold connection terminals */}
            <Circle cx="15" cy="25" r={strokeWidth * 0.8} fill="#CCCCCC" />
            <Circle cx="85" cy="25" r={strokeWidth * 0.8} fill="#CCCCCC" />
            <Circle cx="15" cy="75" r={strokeWidth * 0.8} fill="#CCCCCC" />
            <Circle cx="85" cy="75" r={strokeWidth * 0.8} fill="#CCCCCC" />
            
            {/* Bolt details for dark theme */}
            <Path
              d="M12 25 L18 25 M15 22 L15 28"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.3}
              strokeLinecap="round"
              opacity="0.7"
            />
            <Path
              d="M82 25 L88 25 M85 22 L85 28"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.3}
              strokeLinecap="round"
              opacity="0.7"
            />
            <Path
              d="M12 75 L18 75 M15 72 L15 78"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.3}
              strokeLinecap="round"
              opacity="0.7"
            />
            <Path
              d="M82 75 L88 75 M85 72 L85 78"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.3}
              strokeLinecap="round"
              opacity="0.7"
            />
            
            {/* Industrial accent lines for dark theme */}
            <Path
              d="M25 30 L40 30"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 0.6}
              strokeLinecap="round"
              opacity="0.8"
            />
            <Path
              d="M25 70 L40 70"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 0.6}
              strokeLinecap="round"
              opacity="0.8"
            />
            
            {/* Wire insulation markings for dark theme */}
            <Path
              d="M20 45 L30 45"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 0.4}
              strokeLinecap="round"
              opacity="0.6"
            />
            <Path
              d="M20 65 L30 65"
              stroke="#CCCCCC"
              strokeWidth={strokeWidth * 0.4}
              strokeLinecap="round"
              opacity="0.6"
            />
          </Svg>
        );
      
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...svgProps}>
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );
    }
  };

  return (
    <View 
      style={styles.container}
      collapsable={false}
      removeClippedSubviews={false}
    >
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon;






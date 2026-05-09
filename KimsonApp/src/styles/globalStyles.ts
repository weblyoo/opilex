import { StyleSheet } from 'react-native';
import { fonts, textStyles } from '../config/fonts';

// Global text styles with Ubuntu
export const globalTextStyles = StyleSheet.create({
  // Headers
  h1: {
    ...textStyles.h1,
  },
  h2: {
    ...textStyles.h2,
  },
  h3: {
    ...textStyles.h3,
  },
  h4: {
    ...textStyles.h4,
  },
  h5: {
    ...textStyles.h5,
  },
  h6: {
    ...textStyles.h6,
  },
  
  // Body text
  body: {
    ...textStyles.body,
  },
  bodyLarge: {
    ...textStyles.bodyLarge,
  },
  bodySmall: {
    ...textStyles.bodySmall,
  },
  
  // Labels and buttons
  label: {
    ...textStyles.label,
  },
  button: {
    ...textStyles.button,
  },
  buttonLarge: {
    ...textStyles.buttonLarge,
  },
  
  // Captions
  caption: {
    ...textStyles.caption,
  },
  
  // Special text
  title: {
    ...textStyles.title,
  },
  subtitle: {
    ...textStyles.subtitle,
  },
  
  // Default text style
  default: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400',
  },
});

// Global container styles
export const globalContainerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStretch: {
    alignItems: 'stretch',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  justifyEvenly: {
    justifyContent: 'space-evenly',
  },
});

// Global spacing styles
export const globalSpacingStyles = StyleSheet.create({
  marginXs: { margin: 4 },
  marginSm: { margin: 8 },
  marginMd: { margin: 16 },
  marginLg: { margin: 24 },
  marginXl: { margin: 32 },
  marginXxl: { margin: 48 },
  
  marginTopXs: { marginTop: 4 },
  marginTopSm: { marginTop: 8 },
  marginTopMd: { marginTop: 16 },
  marginTopLg: { marginTop: 24 },
  marginTopXl: { marginTop: 32 },
  marginTopXxl: { marginTop: 48 },
  
  marginBottomXs: { marginBottom: 4 },
  marginBottomSm: { marginBottom: 8 },
  marginBottomMd: { marginBottom: 16 },
  marginBottomLg: { marginBottom: 24 },
  marginBottomXl: { marginBottom: 32 },
  marginBottomXxl: { marginBottom: 48 },
  
  marginLeftXs: { marginLeft: 4 },
  marginLeftSm: { marginLeft: 8 },
  marginLeftMd: { marginLeft: 16 },
  marginLeftLg: { marginLeft: 24 },
  marginLeftXl: { marginLeft: 32 },
  marginLeftXxl: { marginLeft: 48 },
  
  marginRightXs: { marginRight: 4 },
  marginRightSm: { marginRight: 8 },
  marginRightMd: { marginRight: 16 },
  marginRightLg: { marginRight: 24 },
  marginRightXl: { marginRight: 32 },
  marginRightXxl: { marginRight: 48 },
  
  paddingXs: { padding: 4 },
  paddingSm: { padding: 8 },
  paddingMd: { padding: 16 },
  paddingLg: { padding: 24 },
  paddingXl: { padding: 32 },
  paddingXxl: { padding: 48 },
  
  paddingTopXs: { paddingTop: 4 },
  paddingTopSm: { paddingTop: 8 },
  paddingTopMd: { paddingTop: 16 },
  paddingTopLg: { paddingTop: 24 },
  paddingTopXl: { paddingTop: 32 },
  paddingTopXxl: { paddingTop: 48 },
  
  paddingBottomXs: { paddingBottom: 4 },
  paddingBottomSm: { paddingBottom: 8 },
  paddingBottomMd: { paddingBottom: 16 },
  paddingBottomLg: { paddingBottom: 24 },
  paddingBottomXl: { paddingBottom: 32 },
  paddingBottomXxl: { paddingBottom: 48 },
  
  paddingLeftXs: { paddingLeft: 4 },
  paddingLeftSm: { paddingLeft: 8 },
  paddingLeftMd: { paddingLeft: 16 },
  paddingLeftLg: { paddingLeft: 24 },
  paddingLeftXl: { paddingLeft: 32 },
  paddingLeftXxl: { paddingLeft: 48 },
  
  paddingRightXs: { paddingRight: 4 },
  paddingRightSm: { paddingRight: 8 },
  paddingRightMd: { paddingRight: 16 },
  paddingRightLg: { paddingRight: 24 },
  paddingRightXl: { paddingRight: 32 },
  paddingRightXxl: { paddingRight: 48 },
});

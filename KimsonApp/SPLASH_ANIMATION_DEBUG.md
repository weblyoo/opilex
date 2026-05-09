# Splash Screen Rolling Animation Debug Guide

## Current Animation Implementation

### Animation Values
- **rollAnim**: Starts at 150, animates to -30, bounces to 8, settles at 0
- **rotateAnim**: Starts at 0, animates to 1 (360° rotation), settles at 0
- **fadeAnim**: Starts at 0, animates to 1 (fade in)
- **scaleAnim**: Starts at 0.3, animates to 1 (scale up)
- **taglineFadeAnim**: Starts at 0, animates to 1 (delayed fade in)

### Animation Sequence
1. **Rolling + Rotation** (0-1000ms): Text rolls up from bottom with rotation
2. **Bounce Effect** (1000-1500ms): Text bounces slightly and settles
3. **Fade + Scale** (300-1300ms): Logo container fades in and scales up
4. **Tagline Fade** (1200-2000ms): Tagline fades in with delay
5. **Navigation** (4000ms): Navigate to next screen

## Troubleshooting Steps

### 1. Check Animation Values
The rolling animation should be visible because:
- **Initial Position**: Text starts 150px below center
- **Roll Up**: Moves to -30px above center (180px movement)
- **Bounce**: Small bounce to 8px above center
- **Settle**: Final position at center (0px)

### 2. Visual Indicators
- Text should start below the visible area
- Roll up with a 360° rotation
- Bounce effect should be noticeable
- Shadow and elevation should be visible

### 3. Common Issues

**Animation Not Visible:**
- Check if `useNativeDriver: true` is working
- Verify animation values are reasonable
- Ensure container height accommodates movement

**Performance Issues:**
- Native driver should handle most animations
- Reduce animation complexity if needed
- Check for memory leaks in useEffect

**Timing Issues:**
- Adjust durations if animations feel too fast/slow
- Modify delays for better sequencing
- Ensure navigation timer allows full animation

### 4. Debug Commands

**Add Console Logs:**
```javascript
console.log('Roll animation started:', rollAnim._value);
console.log('Animation sequence completed');
```

**Test Individual Animations:**
```javascript
// Test only rolling without rotation
Animated.timing(rollAnim, {
  toValue: -30,
  duration: 1000,
  useNativeDriver: true,
}).start();
```

### 5. Alternative Implementations

**Simpler Rolling Effect:**
```javascript
Animated.timing(rollAnim, {
  toValue: -50,
  duration: 1200,
  useNativeDriver: true,
}).start();
```

**Different Rotation:**
```javascript
rotateAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '180deg'], // Half rotation instead of full
})
```

## Current Status

✅ Rolling animation implemented with translateY
✅ Rotation animation added with rotateX
✅ Bounce effect with spring animation
✅ Proper timing and sequencing
✅ Shadow and elevation for visibility
✅ Fixed container height for animation space

The rolling animation should now be clearly visible with a dramatic upward movement and rotation effect!

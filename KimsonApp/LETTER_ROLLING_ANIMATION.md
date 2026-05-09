# Letter-by-Letter Rolling Animation for Splash Screen

## Overview

The splash screen now features an individual letter rolling animation where each letter in "KIMSON" rolls up and down independently with a staggered effect, creating a dynamic and engaging entrance animation.

## Animation Details

### Letter Animation Sequence

Each letter goes through the following animation sequence:

1. **Initial Position**: Starts 100px below center
2. **Roll Down**: Moves to -50px (fast downward motion) - 150ms
3. **Roll Up**: Moves to +20px (fast upward motion past center) - 150ms
4. **Secondary Roll**: Moves to -10px (smaller bounce) - 120ms
5. **Final Settle**: Springs to 0px (final position) with spring physics

### Stagger Effect

- Each letter starts its animation with an **80ms delay** after the previous letter
- Creates a wave-like rolling effect from K → I → M → S → O → N
- Total stagger time: 6 letters × 80ms = 480ms

### Timing Breakdown

**Letter K (Index 0):**
- Starts: 0ms
- Completes: ~570ms

**Letter I (Index 1):**
- Starts: 80ms
- Completes: ~650ms

**Letter M (Index 2):**
- Starts: 160ms
- Completes: ~730ms

**Letter S (Index 3):**
- Starts: 240ms
- Completes: ~810ms

**Letter O (Index 4):**
- Starts: 320ms
- Completes: ~890ms

**Letter N (Index 5):**
- Starts: 400ms
- Completes: ~970ms

## Implementation Details

### Animated Values

```typescript
// Create animated values for each letter
const letterAnims = useRef(
  ['K', 'I', 'M', 'S', 'O', 'N'].map(() => new Animated.Value(100))
).current;
```

Each letter has its own `Animated.Value` starting at 100 (below screen).

### Animation Code

```typescript
const letterAnimations = letterAnims.map((anim, index) => {
  return Animated.sequence([
    // Delay each letter slightly for stagger effect
    Animated.delay(index * 80), // 80ms delay between each letter
    // Fast roll animation with multiple bounces
    Animated.sequence([
      // Roll down
      Animated.timing(anim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
      // Roll up past center
      Animated.timing(anim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
      // Roll down again
      Animated.timing(anim, {
        toValue: -10,
        duration: 120,
        useNativeDriver: true,
      }),
      // Final settle with spring
      Animated.spring(anim, {
        toValue: 0,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]),
  ]);
});

// Start all letter animations in parallel
Animated.parallel(letterAnimations).start();
```

### JSX Implementation

```typescript
<View style={styles.rollingTextContainer}>
  {['K', 'I', 'M', 'S', 'O', 'N'].map((letter, index) => (
    <Animated.Text
      key={index}
      style={[
        styles.logoLetter,
        { 
          color: theme.colors.text,
          transform: [{ translateY: letterAnims[index] }],
        },
      ]}
    >
      {letter}
    </Animated.Text>
  ))}
</View>
```

### Styles

```typescript
rollingTextContainer: {
  flexDirection: 'row',
  overflow: 'visible',
  marginBottom: 20,
  height: 100, // Increased to accommodate rolling animation
  justifyContent: 'center',
  alignItems: 'center',
},
logoLetter: {
  fontSize: 52,
  fontWeight: 'bold',
  letterSpacing: 6,
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
  marginHorizontal: 0,
},
```

## Complete Animation Timeline

**0-200ms:**
- Fade and scale animations start
- K begins rolling

**80-880ms:**
- Letters roll in sequence (K, I, M, S, O, N)
- Each letter performs its full roll sequence

**970ms:**
- All letters settled in final position

**1500ms:**
- Tagline begins fading in

**4000ms:**
- Navigation to next screen

## Visual Effect

The animation creates a mesmerizing wave-like effect where:

1. **Letter K** rolls down, bounces up, and settles
2. **80ms later**, Letter I starts the same sequence
3. **80ms later**, Letter M starts
4. And so on for S, O, and N

This creates a cascading, fluid motion that draws attention to the brand name and makes the splash screen feel dynamic and modern.

## Performance

- **Native Driver**: All animations use `useNativeDriver: true` for optimal performance
- **No Layout Changes**: Only `transform` properties are animated
- **Smooth 60 FPS**: Hardware-accelerated animations run at native frame rate
- **Low Memory**: Each letter animation is independent and efficient

## Customization Options

### Faster Rolling

To make the rolling faster, reduce durations:

```typescript
Animated.timing(anim, {
  toValue: -50,
  duration: 100, // Reduced from 150ms
  useNativeDriver: true,
})
```

### More Bounce

To add more bounce, adjust the roll values:

```typescript
Animated.timing(anim, {
  toValue: -80, // Increased from -50
  duration: 150,
  useNativeDriver: true,
})
```

### Different Stagger

To change the stagger delay:

```typescript
Animated.delay(index * 120), // Increased from 80ms (slower wave)
// or
Animated.delay(index * 40), // Decreased from 80ms (faster wave)
```

### Spring Physics

To adjust the final settle bounce:

```typescript
Animated.spring(anim, {
  toValue: 0,
  tension: 300, // Higher = more bouncy (default: 200)
  friction: 8,  // Lower = more bouncy (default: 10)
  useNativeDriver: true,
})
```

## Benefits

1. **Eye-Catching**: Letter-by-letter animation draws attention
2. **Modern**: Sophisticated animation technique
3. **Smooth**: Hardware-accelerated performance
4. **Branded**: Emphasizes the KIMSON brand name
5. **Professional**: High-quality visual effect
6. **Fast**: Quick animation doesn't delay app startup

## Files Modified

- `KimsonApp/src/screens/SplashScreen.tsx`
  - Replaced single text animation with individual letter animations
  - Added staggered rolling effect
  - Optimized container styles for letter layout

## Summary

✅ Individual letter rolling animation implemented  
✅ Fast up/down motion with multiple bounces  
✅ Staggered effect creates wave motion  
✅ 80ms delay between each letter  
✅ Hardware-accelerated performance  
✅ Smooth 60 FPS animation  
✅ Professional and modern appearance  

The KIMSON text now features a captivating letter-by-letter rolling animation that makes the splash screen memorable and engaging!

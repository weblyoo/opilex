# Image Sliders Setup Guide

## ✅ **Image Sliders Implemented**

I've successfully replaced the static banners with dynamic image sliders:

### **1. Special Offer Slider** (Height: 120px)
- **Location**: Top of dashboard (after header, before points summary)
- **Auto-play**: Every 4 seconds
- **Slides**: 3 different offers with colorful backgrounds
- **Features**: Dots indicator, touch interaction

**Current Slides:**
1. 🎉 **Special Offer!** - 2x rewards (Green theme)
2. ⚡ **Lightning Deal!** - 100 bonus points (Yellow theme)  
3. 🏆 **Premium Benefits** - Exclusive rewards (Purple theme)

### **2. Tips Slider** (Height: 80px - Smaller as requested)
- **Location**: Between first and second button rows
- **Auto-play**: Every 5 seconds
- **Slides**: 3 helpful tips with subtle backgrounds
- **Features**: Dots indicator, touch interaction

**Current Slides:**
1. 💡 **Pro Tip** - Scan authentic wires (Blue theme)
2. 🔍 **Quick Check** - Look for hologram (Orange theme)
3. 💰 **Cash Out** - Convert points easily (Green theme)

## 🎨 **Customization Options**

### **Add Real Images**
To use actual images instead of colored backgrounds:

```typescript
// In specialOfferSlides or tipSlides
{
  id: '1',
  title: 'Special Offer!',
  subtitle: 'Earn 2x rewards...',
  imageUrl: 'https://your-cdn.com/offer1.jpg', // Add this
  backgroundColor: 'transparent', // Optional fallback
}
```

### **Change Slider Settings**
```typescript
<ImageSlider
  data={specialOfferSlides}
  height={120} // Adjust height
  autoPlay={true} // Enable/disable auto-play
  autoPlayInterval={4000} // Change timing (ms)
  showDots={true} // Show/hide dots
  onSlidePress={handleOfferSlidePress} // Handle taps
/>
```

### **Add More Slides**
Simply add more objects to the `specialOfferSlides` or `tipSlides` arrays:

```typescript
{
  id: '4',
  title: '🔥 Flash Sale!',
  subtitle: 'Limited time offer - 50% extra rewards',
  backgroundColor: 'rgba(244, 67, 54, 0.2)',
  textColor: theme.colors.text,
  icon: '🔥',
}
```

## 📱 **Features Included**

- ✅ **Auto-play**: Automatic slide progression
- ✅ **Touch Navigation**: Swipe to change slides
- ✅ **Dots Indicator**: Shows current slide position
- ✅ **Responsive**: Adapts to screen width
- ✅ **Smooth Animations**: Smooth slide transitions
- ✅ **Touch Feedback**: Handles slide tap events
- ✅ **Customizable Heights**: Different heights for different sliders

## 🚀 **How It Works**

1. **Special Offer Slider**: 
   - Shows promotional content at the top
   - Larger size (120px) for main offers
   - 4-second auto-play interval

2. **Tips Slider**:
   - Shows helpful tips between button sections
   - Smaller size (80px) as requested
   - 5-second auto-play interval

3. **Interactive**:
   - Users can tap slides for more details
   - Swipe manually to browse
   - Auto-play can be paused by user interaction

## 🎯 **Current Status**

- ✅ **Special Offer Banner** → **3-Image Slider** (120px height)
- ✅ **Tip Banner** → **3-Image Slider** (80px height)
- ✅ **Auto-play enabled** with different intervals
- ✅ **Touch interactions** implemented
- ✅ **Responsive design** for all screen sizes
- ✅ **Black & white theme** maintained

The sliders are now live and ready for testing! They'll automatically cycle through the content and respond to user interactions.

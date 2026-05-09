import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';

interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType; // For local images
  gradientColors?: string[]; // For overlay gradients
}

interface ImageSliderProps {
  data: SlideItem[];
  height: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  onSlidePress?: (item: SlideItem) => void;
  squareCorners?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const SLIDE_WIDTH = screenWidth; // 100% width

const ImageSlider: React.FC<ImageSliderProps> = ({
  data,
  height,
  autoPlay = true,
  autoPlayInterval = 3000,
  showDots = true,
  onSlidePress,
  squareCorners = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoPlay && data && data.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length;
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: nextIndex * SLIDE_WIDTH,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, autoPlayInterval);

      return () => {
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
          autoPlayTimerRef.current = null;
        }
      };
    }
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [autoPlay, autoPlayInterval, data]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (contentOffsetX !== undefined && !isNaN(contentOffsetX)) {
      const index = Math.round(contentOffsetX / SLIDE_WIDTH);
      if (index !== currentIndex && index >= 0 && index < data.length) {
        setCurrentIndex(index);
      }
    }
  };

  const renderSlide = (item: SlideItem, index: number) => {
    return (
      <TouchableOpacity
        key={item.id || index}
        style={[
          styles.slide,
          squareCorners ? { borderRadius: 0 } : {},
          {
            width: SLIDE_WIDTH,
            height,
          },
        ]}
        onPress={() => onSlidePress?.(item)}
        activeOpacity={0.85}
      >
        {/* Background Image - support both local imageSource and remote imageUrl */}
        {(item.imageSource || item.imageUrl) && (
          <Image
            source={item.imageSource ?? (item.imageUrl ? { uri: item.imageUrl } : undefined)}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )}
        
        {/* Gradient Overlay */}
        {item.gradientColors && item.gradientColors.length >= 2 ? (
          <LinearGradient
            colors={item.gradientColors as [string, string, ...string[]]}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : (item.imageSource || item.imageUrl) ? (
          <View style={styles.darkOverlay} />
        ) : null}
        
        {/* Content */}
        <View style={styles.slideContent}>
          {item.icon && !item.imageSource && !item.imageUrl && (
            <View style={styles.iconContainer}>
              <Text style={styles.slideIcon}>{item.icon}</Text>
            </View>
          )}
          
          <View style={styles.slideTextContainer}>
            <Text
              style={[
                styles.slideTitle,
                { 
                  color: item.textColor || (item.imageSource ? '#FFFFFF' : '#000000'),
                },
              ]}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                style={[
                  styles.slideSubtitle,
                  { 
                    color: item.textColor 
                      ? item.textColor + 'AA' 
                      : (item.imageSource ? '#FFFFFFDD' : '#000000AA'),
                  },
                ]}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {/* Fallback background */}
        {!item.imageSource && (
          <View
            style={[
              styles.colorBackground,
              { backgroundColor: item.backgroundColor || 'rgba(255, 255, 255, 0.1)' }
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderDots = () => {
    if (!showDots || !data || data.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {data.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentIndex(index);
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({
                    x: index * SLIDE_WIDTH,
                    animated: true,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  {
                    backgroundColor: isActive ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (!data || data.length === 0) {
    return null;
  }

  const containerStyle = squareCorners ? styles.containerSquare : styles.container;
  const wrapperStyle = squareCorners ? styles.sliderWrapperSquare : styles.sliderWrapper;
  const scrollStyle = squareCorners ? styles.scrollViewSquare : styles.scrollView;

  // For square corners (full width), ensure exact screen width
  const squareContainerStyle = squareCorners 
    ? [containerStyle, { height, width: screenWidth }]
    : [containerStyle, { height }];

  return (
    <View style={squareContainerStyle}>
      <View style={[wrapperStyle, { height }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          onScrollBeginDrag={() => {
            if (autoPlayTimerRef.current) {
              clearInterval(autoPlayTimerRef.current);
              autoPlayTimerRef.current = null;
            }
          }}
          onScrollEndDrag={() => {
            if (autoPlay && data && data.length > 1) {
              if (autoPlayTimerRef.current) {
                clearInterval(autoPlayTimerRef.current);
              }
              autoPlayTimerRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                  const nextIndex = (prevIndex + 1) % data.length;
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                      x: nextIndex * SLIDE_WIDTH,
                      animated: true,
                    });
                  }
                  return nextIndex;
                });
              }, autoPlayInterval);
            }
          }}
          contentContainerStyle={styles.scrollContainer}
          style={[scrollStyle, { height }]}
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={false}
        >
          {data.map((item, index) => renderSlide(item, index))}
        </ScrollView>
        {renderDots()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  containerSquare: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    alignSelf: 'stretch',
  },
  sliderWrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: 22,
  },
  sliderWrapperSquare: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  scrollView: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 22,
  },
  scrollViewSquare: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  slide: {
    borderRadius: 0,
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  colorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  slideContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 10,
    width: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  slideIcon: {
    fontSize: 28,
  },
  slideTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Ubuntu-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  slideSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: 'Ubuntu-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
});

export default ImageSlider;





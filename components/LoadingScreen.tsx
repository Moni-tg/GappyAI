import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Rotation animation for spinner
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0B1B2B', '#0E2440', '#113354']}
      start={{ x: 0.1, y: 0.0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Loading spinner with rotation */}
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.spinnerRing}>
            <View style={[styles.spinnerSegment, styles.segment1]} />
            <View style={[styles.spinnerSegment, styles.segment2]} />
            <View style={[styles.spinnerSegment, styles.segment3]} />
          </View>
        </Animated.View>

        {/* Loading text */}
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>

      {/* Background decorative elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  spinnerRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(118, 217, 219, 0.2)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerSegment: {
    position: 'absolute',
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#76D9DB',
  },
  segment1: {
    transform: [{ rotate: '0deg' }],
    top: 5,
  },
  segment2: {
    transform: [{ rotate: '120deg' }],
    top: 5,
  },
  segment3: {
    transform: [{ rotate: '240deg' }],
    top: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#76D9DB',
    letterSpacing: 1,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: '#76D9DB',
    top: height * 0.2,
    left: width * 0.1,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    top: height * 0.6,
    right: width * 0.15,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: '#76D9DB',
    bottom: height * 0.25,
    left: width * 0.2,
  },
});

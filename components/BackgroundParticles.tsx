import { useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

type Config = { x: number; y: number; size: number; delay: number; duration: number };

// Deterministic layout via golden-ratio x spread and varied y — stable across renders
const PARTICLES: Config[] = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 0.618033) % 1) * W * 0.9 + W * 0.05,
  y: ((i * 7 + 3) % 17) / 17 * H,
  size: 2 + (i % 3),           // 2, 3, or 4 px
  delay: (i * 613) % 4000,     // 0 – 4 000 ms stagger
  duration: 3500 + (i * 400) % 2500, // 3.5 – 6 s
}));

function Particle({ x, y, size, delay, duration }: Config) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration }), -1));
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity =
      p < 0.2 ? (p / 0.2) * 0.14 : p > 0.75 ? ((1 - p) / 0.25) * 0.14 : 0.14;
    return { opacity, transform: [{ translateY: -p * 90 }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "rgba(212,168,83,1)",
        },
        style,
      ]}
    />
  );
}

export default function BackgroundParticles() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}

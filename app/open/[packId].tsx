import { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors } from "../../theme/colors";
import { fonts, displayFonts, fontSizes } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { openPack } from "../../services/packService";
import { useStore } from "../../store/useStore";
import { PACKS } from "../../data/packs";
import { RARITY_CONFIG } from "../../data/rarities";
import { PackOpenResult } from "../../types";
import Card from "../../components/Card";
import CardBack from "../../components/CardBack";
import PackCover from "../../components/PackCover";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Carousel
const CAROUSEL_PACK_WIDTH  = SCREEN_WIDTH * 0.42;
const CAROUSEL_PACK_HEIGHT = CAROUSEL_PACK_WIDTH * 1.8;
const CAROUSEL_GAP         = spacing.md;
const CAROUSEL_COUNT       = 30;                              // packs per logical cycle
const CAROUSEL_COPIES      = 3;                              // render 3 identical cycles
const ITEM_W               = CAROUSEL_PACK_WIDTH + CAROUSEL_GAP; // effective width per item
const CYCLE_W              = ITEM_W * CAROUSEL_COUNT;        // pixel width of one cycle

// Sealed / rip
const PACK_WIDTH  = SCREEN_WIDTH * 0.58;
const PACK_HEIGHT = PACK_WIDTH * 1.8;
const RIP_STRIP   = PACK_HEIGHT * 0.1;
const RIP_BODY    = PACK_HEIGHT * 0.9;

const CARD_WIDTH      = SCREEN_WIDTH * 0.74;
const CARD_HEIGHT     = CARD_WIDTH * 1.4;
const CARD_MINI_WIDTH = SCREEN_WIDTH * 0.34;

type Phase = "carousel" | "sealed" | "ripping" | "viewing" | "done";

// ─── Floating particle (sealed phase) ────────────────────────────────────────

function Particle({ x, delay }: { x: number; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2400 + (delay % 800) }), -1),
    );
  }, []);
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity =
      p < 0.18 ? p / 0.18 : p > 0.72 ? (1 - p) / 0.28 : 0.65;
    return { opacity, transform: [{ translateY: -p * PACK_HEIGHT * 1.3 }] };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          bottom: 0,
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: "rgba(212,168,83,0.55)",
        },
        style,
      ]}
    />
  );
}

// ─── Sparkle ring (rare card entrance) ───────────────────────────────────────

function SparkleRing({
  active,
  color,
  cardWidth,
  cardHeight,
}: {
  active: boolean;
  color: string;
  cardWidth: number;
  cardHeight: number;
}) {
  const scale   = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value   = 0;
      opacity.value = 1;
      scale.value   = withTiming(1.15, { duration: 520 });
      opacity.value = withDelay(220, withTiming(0, { duration: 480 }));
    } else {
      scale.value   = 0;
      opacity.value = 0;
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cx     = cardWidth / 2;
  const cy     = cardHeight * 0.42;
  const R      = cardWidth * 0.62;
  const DOT    = 7;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", width: cardWidth, height: cardHeight }, animStyle]}
    >
      {angles.map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: cx + R * Math.cos(rad) - DOT / 2,
              top:  cy + R * Math.sin(rad) - DOT / 2,
              width: DOT,
              height: DOT,
              borderRadius: DOT / 2,
              backgroundColor: color,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PackOpenScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const { collection, addPull, consumePack } = useStore();
  const pack = PACKS.find((p) => p.id === packId);

  const [phase,         setPhase]         = useState<Phase>("carousel");
  const [results,       setResults]       = useState<PackOpenResult[]>([]);
  const [revealIndex,   setRevealIndex]   = useState(0);
  const [sparkleActive, setSparkleActive] = useState(false);

  // ── Carousel ──────────────────────────────────────────────────────────────
  const carouselRef     = useRef<ScrollView>(null);
  const carouselOpacity = useSharedValue(1);

  // Start in the middle of the centre copy so the user can spin either direction.
  // We use CYCLE_W * 1.5 which centres an item halfway through copy 2 (0-indexed).
  useEffect(() => {
    carouselRef.current?.scrollTo({ x: CYCLE_W * 1.5, animated: false });
  }, []);

  // When scroll stops, silently snap back to the equivalent position inside copy 2
  // (the middle copy). Since all copies look identical the jump is invisible.
  const normalizeScroll = useCallback((x: number) => {
    const posInCycle = x % CYCLE_W;
    const target = CYCLE_W + posInCycle; // equivalent position in copy 2
    if (Math.abs(x - target) > 2) {
      carouselRef.current?.scrollTo({ x: target, animated: false });
    }
  }, []);

  const selectPack = useCallback(() => {
    if (phase !== "carousel") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    carouselOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setPhase)("sealed");
    });
  }, [phase]);

  // ── Rip animation ─────────────────────────────────────────────────────────
  const packTilt      = useSharedValue(0);
  const stripY        = useSharedValue(0);   // top 10% strip
  const stripRot      = useSharedValue(0);
  const bodyY         = useSharedValue(0);   // bottom 90% body
  const bodyRot       = useSharedValue(0);
  const flashOpacity  = useSharedValue(0);

  // ── Card swipe (advance to next) ──────────────────────────────────────────
  const swipeX   = useSharedValue(0);
  const swipeY   = useSharedValue(0);
  const swipeRot = useSharedValue(0);

  // ── Card entrance ─────────────────────────────────────────────────────────
  const entranceScale = useSharedValue(0.85);
  const entranceY     = useSharedValue(28);

  // ── Rare edge glow ────────────────────────────────────────────────────────
  const glowOpacity = useSharedValue(0);

  // ── Stable particle positions ─────────────────────────────────────────────
  const particles = useRef(
    Array.from({ length: 7 }, (_, i) => ({
      x: PACK_WIDTH * 0.08 + (i / 6) * (PACK_WIDTH * 0.84),
      delay: i * 350,
    })),
  ).current;

  // ── Entrance animation + rare effects whenever the shown card changes ─────
  useEffect(() => {
    if (phase !== "viewing" || results.length === 0) return;

    // Spring card in
    entranceScale.value = 0.85;
    entranceY.value     = 28;
    entranceScale.value = withSpring(1,  { damping: 14, stiffness: 110 });
    entranceY.value     = withSpring(0,  { damping: 14, stiffness: 110 });

    // Rare effects
    const card = results[revealIndex];
    if (card.card.rarity === "epic" || card.card.rarity === "legendary") {
      glowOpacity.value = withSequence(
        withTiming(0.65, { duration: 380 }),
        withDelay(700, withTiming(0, { duration: 600 })),
      );
      setTimeout(() => setSparkleActive(true),  140);
      setTimeout(() => setSparkleActive(false), 900);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (card.card.rarity === "milestone") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [revealIndex, phase]);

  // ── Trigger the rip ───────────────────────────────────────────────────────
  const triggerRip = useCallback(() => {
    if (phase !== "sealed" || !packId) return;

    setPhase("ripping");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const pulled = openPack(packId, 5, collection);
    setResults(pulled);

    // Flash
    flashOpacity.value = withSequence(
      withTiming(1,  { duration: 70 }),
      withTiming(0,  { duration: 320 }),
    );

    // Top strip flies up; body drops slightly then settles
    stripY.value   = withTiming(-SCREEN_HEIGHT * 0.5, { duration: 400 });
    stripRot.value = withTiming(-22, { duration: 400 });
    bodyY.value    = withTiming(SCREEN_HEIGHT * 0.35, { duration: 400 });
    bodyRot.value  = withTiming(6, { duration: 400 });

    setTimeout(() => {
      setRevealIndex(0);
      swipeX.value   = 0;
      swipeY.value   = 0;
      swipeRot.value = 0;
      setPhase("viewing");
    }, 480);
  }, [phase, packId, collection]);

  // ── Rip gesture (horizontal pan on pack) ─────────────────────────────────
  const ripGesture = Gesture.Pan()
    .onUpdate((e) => {
      packTilt.value = Math.max(-1, Math.min(1, e.translationX / (PACK_WIDTH * 0.5)));
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > PACK_WIDTH * 0.28 || Math.abs(e.velocityX) > 480) {
        runOnJS(triggerRip)();
      } else {
        packTilt.value = withSpring(0);
      }
    });

  // ── Called after swipe animation completes ────────────────────────────────
  const advanceCard = useCallback(() => {
    if (results.length === 0) return;

    addPull(results[revealIndex].card.id);

    const next = revealIndex + 1;
    if (next >= results.length) {
      consumePack();
      setPhase("done");
    } else {
      swipeX.value   = 0;
      swipeY.value   = 0;
      swipeRot.value = 0;
      setRevealIndex(next);
    }
  }, [revealIndex, results]);

  // ── Card view gesture: slow drag = subtle follow, fast swipe = advance ─────
  const viewGesture = Gesture.Pan()
    .onUpdate((e) => {
      swipeX.value   = e.translationX * 0.07;
      swipeY.value   = e.translationY * 0.05;
      swipeRot.value = e.translationX * 0.02;
    })
    .onEnd((e) => {
      const isSwipe =
        Math.abs(e.velocityX) > 550 ||
        Math.abs(e.velocityY) > 550 ||
        Math.abs(e.translationX) > 110 ||
        Math.abs(e.translationY) > 110;

      if (isSwipe) {
        const goRight  = e.velocityX > 0 || (Math.abs(e.velocityX) < 100 && e.translationX > 0);
        const targetX  = Math.abs(e.velocityX) >= Math.abs(e.velocityY)
          ? (goRight ? SCREEN_WIDTH * 1.4 : -SCREEN_WIDTH * 1.4)
          : swipeX.value;
        const targetY  = Math.abs(e.velocityY) > Math.abs(e.velocityX)
          ? (e.velocityY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT)
          : -SCREEN_HEIGHT * 0.3;

        swipeX.value   = withTiming(targetX, { duration: 260 }, () => runOnJS(advanceCard)());
        swipeY.value   = withTiming(targetY, { duration: 260 });
        swipeRot.value = withTiming(e.translationX * 0.18, { duration: 260 });
      } else {
        swipeX.value   = withSpring(0);
        swipeY.value   = withSpring(0);
        swipeRot.value = withSpring(0);
      }
    });

  // ── Animated styles ───────────────────────────────────────────────────────
  const packFeedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${packTilt.value * 5}deg` }],
  }));

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stripY.value }, { rotate: `${stripRot.value}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bodyY.value }, { rotate: `${bodyRot.value}deg` }],
  }));

  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: swipeX.value },
      { translateY: swipeY.value + entranceY.value },
      { scale: entranceScale.value },
      { rotate: `${swipeRot.value}deg` },
    ],
  }));

  const glowStyle      = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const carouselStyle  = useAnimatedStyle(() => ({ opacity: carouselOpacity.value }));

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentCard  = results[revealIndex];
  const isRareReveal =
    currentCard &&
    (currentCard.card.rarity === "epic" || currentCard.card.rarity === "legendary");
  const glowColor = isRareReveal
    ? RARITY_CONFIG[currentCard.card.rarity].color
    : colors.accent;

  if (!pack) return null;

  return (
    <View style={styles.container}>
      {/* ── Back button (carousel + done only) ── */}
      {(phase === "carousel" || phase === "done") && (
        <Pressable
          style={[styles.backButton, { top: insets.top + spacing.sm }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      )}

      {/* ══════════ CAROUSEL ══════════ */}
      {phase === "carousel" && (
        <Animated.View style={[styles.carouselContainer, carouselStyle]}>
          <Text style={[styles.carouselTitle, { marginTop: insets.top + spacing.xxl }]}>
            Choose a Pack
          </Text>
          <Text style={styles.carouselSubtitle}>Spin and tap one to open</Text>

          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => normalizeScroll(e.nativeEvent.contentOffset.x)}
            onScrollEndDrag={(e) => normalizeScroll(e.nativeEvent.contentOffset.x)}
          >
            {Array.from({ length: CAROUSEL_COUNT * CAROUSEL_COPIES }, (_, i) => (
              <Pressable key={i} onPress={selectPack} style={styles.carouselItem}>
                <PackCover
                  pack={pack}
                  width={CAROUSEL_PACK_WIDTH}
                  height={CAROUSEL_PACK_HEIGHT}
                />
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* ══════════ SEALED ══════════ */}
      {phase === "sealed" && (
        <View style={styles.center}>
          <View style={{ width: PACK_WIDTH, height: PACK_HEIGHT }}>
            {particles.map((p, i) => (
              <Particle key={i} x={p.x} delay={p.delay} />
            ))}
            <GestureDetector gesture={ripGesture}>
              <Animated.View style={[StyleSheet.absoluteFill, packFeedStyle]}>
                <PackCover pack={pack} width={PACK_WIDTH} height={PACK_HEIGHT} />
              </Animated.View>
            </GestureDetector>
          </View>
          <Text style={[styles.hint, { marginTop: 28 }]}>Swipe to open</Text>
        </View>
      )}

      {/* ══════════ RIPPING ══════════ */}
      {phase === "ripping" && (
        <View style={styles.center}>
          {/* Top strip (10%) flies off */}
          <Animated.View style={stripStyle}>
            <View style={{ width: PACK_WIDTH, height: RIP_STRIP, overflow: "hidden" }}>
              <PackCover pack={pack} width={PACK_WIDTH} height={PACK_HEIGHT} />
            </View>
          </Animated.View>

          {/* Body (90%) drops */}
          <Animated.View style={bodyStyle}>
            <View style={{ width: PACK_WIDTH, height: RIP_BODY, overflow: "hidden" }}>
              <View style={{ marginTop: -RIP_STRIP }}>
                <PackCover pack={pack} width={PACK_WIDTH} height={PACK_HEIGHT} />
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {/* ══════════ VIEWING ══════════ */}
      {phase === "viewing" && currentCard && (
        <View style={styles.center}>
          {/* Edge glow for epic / legendary */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
            <LinearGradient
              colors={[glowColor + "cc", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.38 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[glowColor + "cc", "transparent"]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0.62 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Peek: next card face-down behind current */}
          {revealIndex + 1 < results.length && (
            <View style={styles.peekCard}>
              <CardBack width={CARD_WIDTH * 0.95} />
            </View>
          )}

          {/* Current card with touch tilt + swipe */}
          <GestureDetector gesture={viewGesture}>
            <Animated.View style={cardStyle}>
              <Card
                card={currentCard.card}
                entry={null}
                width={CARD_WIDTH}
                isNew={currentCard.isNew}
              />
              <SparkleRing
                active={sparkleActive}
                color={glowColor}
                cardWidth={CARD_WIDTH}
                cardHeight={CARD_HEIGHT}
              />
            </Animated.View>
          </GestureDetector>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {results.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === revealIndex && styles.dotActive]}
              />
            ))}
          </View>

          <Text style={styles.hint}>Swipe to reveal next</Text>
        </View>
      )}

      {/* ══════════ DONE ══════════ */}
      {phase === "done" && (
        <View style={[styles.doneContainer, { paddingTop: insets.top + spacing.xxl }]}>
          <Text style={styles.doneTitle}>Pack Complete!</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doneScroll}
          >
            {results.map((result, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(`/card/${result.card.id}`)}
              >
                <Card
                  card={result.card}
                  entry={collection[result.card.id] ?? null}
                  width={CARD_MINI_WIDTH}
                  isNew={result.isNew}
                />
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.continueButton} onPress={() => router.back()}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {/* White flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "#fff" }, flashStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: spacing.lg,
    zIndex: 10,
  },
  backButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  // Carousel phase
  carouselContainer: {
    flex: 1,
    alignItems: "center",
  },
  carouselTitle: {
    fontFamily: displayFonts.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  carouselSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  carouselContent: {
    // paddingHorizontal centres the first/last item; no gap here — marginRight on items
    // keeps each item's effective footprint exactly ITEM_W pixels for loop math.
    paddingHorizontal: (SCREEN_WIDTH - CAROUSEL_PACK_WIDTH) / 2,
    alignItems: "center",
  },
  carouselItem: {
    marginRight: CAROUSEL_GAP,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  // Viewing phase
  peekCard: {
    position: "absolute",
    transform: [{ translateY: 14 }, { scale: 0.95 }],
    opacity: 0.7,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 18,
    borderRadius: 3,
  },
  // Done phase
  doneContainer: {
    flex: 1,
    alignItems: "center",
  },
  doneTitle: {
    fontFamily: displayFonts.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  doneScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
  },
  continueButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.bg,
  },
});

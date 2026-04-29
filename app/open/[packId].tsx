import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { colors } from "../../theme/colors";
import { fonts, fontSizes } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { openPack } from "../../services/packService";
import { useStore } from "../../store/useStore";
import { PACKS } from "../../data/packs";
import { RARITY_CONFIG } from "../../data/rarities";
import { CARD_IMAGES } from "../../data/images";
import { PackOpenResult } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type Phase = "sealed" | "opening" | "revealing" | "done";

export default function PackOpenScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection, addPull, consumePack } = useStore();
  const pack = PACKS.find((p) => p.id === packId);

  const [phase, setPhase] = useState<Phase>("sealed");
  const [results, setResults] = useState<PackOpenResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);

  // Pack animation values
  const packScale = useSharedValue(1);
  const packOpacity = useSharedValue(1);
  const packY = useSharedValue(0);

  // Card reveal animation
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);

  // Handle pack open
  const handleOpen = useCallback(() => {
    if (phase !== "sealed" || !packId) return;

    setPhase("opening");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Generate cards
    const pulled = openPack(packId, 5, collection);
    setResults(pulled);

    // Animate pack away
    packScale.value = withTiming(0.5, { duration: 300 });
    packOpacity.value = withTiming(0, { duration: 300 });
    packY.value = withTiming(-100, { duration: 300 });

    // Transition to reveal phase
    setTimeout(() => {
      setPhase("revealing");
      setRevealIndex(0);
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1);
    }, 400);
  }, [phase, packId, collection]);

  // Swipe up gesture to open pack
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -50) {
        runOnJS(handleOpen)();
      }
    });

  // Handle tap to reveal next card
  const revealNext = useCallback(() => {
    if (phase !== "revealing") return;

    const current = results[revealIndex];
    if (current) {
      // Add to collection
      addPull(current.card.id);

      // Haptic for rare cards
      if (current.card.rarity === "epic" || current.card.rarity === "legendary") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (current.card.rarity === "milestone") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    const nextIndex = revealIndex + 1;
    if (nextIndex >= results.length) {
      setPhase("done");
      consumePack();
    } else {
      // Animate card transition
      cardOpacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setRevealIndex)(nextIndex);
        cardOpacity.value = withTiming(1, { duration: 200 });
        cardScale.value = 0.8;
        cardScale.value = withSpring(1);
      });
    }
  }, [phase, revealIndex, results]);

  // Animated styles
  const packAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: packScale.value },
      { translateY: packY.value },
    ],
    opacity: packOpacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // Current card being shown
  const currentCard = results[revealIndex];
  const rarityInfo = currentCard
    ? RARITY_CONFIG[currentCard.card.rarity]
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Sealed pack — visible during sealed + opening so the exit animation plays */}
      {(phase === "sealed" || phase === "opening") && (
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.packContainer, packAnimStyle]}>
            <View
              style={[
                styles.sealedPack,
                { borderColor: pack?.coverColor ?? colors.accent },
              ]}
            >
              <Text style={styles.packEmoji}>{pack?.emoji ?? "🎁"}</Text>
              <Text style={styles.packName}>{pack?.name ?? "Memory Pack"}</Text>
              <Text style={styles.swipeHint}>Swipe up to open</Text>
            </View>
          </Animated.View>
        </GestureDetector>
      )}

      {/* Card reveal — tap to show next */}
      {(phase === "revealing" && currentCard) && (
        <Pressable style={styles.revealArea} onPress={revealNext}>
          <Animated.View style={[styles.cardContainer, cardAnimStyle]}>
            {/* Card */}
            <View
              style={[
                styles.card,
                { borderColor: rarityInfo?.color ?? colors.border },
                (currentCard.card.rarity === "epic" ||
                  currentCard.card.rarity === "legendary") && {
                  shadowColor: rarityInfo?.color,
                  shadowOpacity: 0.6,
                  shadowRadius: 20,
                },
              ]}
            >
              {/* Card photo */}
              <View style={styles.cardImageArea}>
                {currentCard.card.image && CARD_IMAGES[currentCard.card.image] ? (
                  <Image
                    source={CARD_IMAGES[currentCard.card.image]}
                    style={styles.cardImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.placeholderEmoji}>📷</Text>
                )}
              </View>

              {/* Card info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{currentCard.card.title}</Text>
                <Text style={styles.cardCaption}>{currentCard.card.caption}</Text>
                <Text style={styles.cardDate}>{currentCard.card.date}</Text>
                <View style={styles.rarityRow}>
                  <Text style={[styles.raritySymbol, { color: rarityInfo?.color }]}>
                    {rarityInfo?.symbol}
                  </Text>
                  <Text style={[styles.rarityLabel, { color: rarityInfo?.color }]}>
                    {rarityInfo?.label}
                  </Text>
                </View>
              </View>

              {/* New badge */}
              {currentCard.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW!</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Card counter */}
          <Text style={styles.cardCounter}>
            {revealIndex + 1} / {results.length}
          </Text>
          <Text style={styles.tapHint}>Tap for next card</Text>
        </Pressable>
      )}

      {/* Done — summary */}
      {phase === "done" && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneTitle}>Pack Complete!</Text>

          {/* Summary grid */}
          <View style={styles.summaryGrid}>
            {results.map((result, i) => {
              const rInfo = RARITY_CONFIG[result.card.rarity];
              return (
                <View
                  key={i}
                  style={[
                    styles.summaryCard,
                    { borderColor: rInfo.color },
                  ]}
                >
                  <Text style={styles.summaryCardTitle} numberOfLines={1}>
                    {result.card.title}
                  </Text>
                  <Text style={[styles.summaryRarity, { color: rInfo.color }]}>
                    {rInfo.symbol}
                  </Text>
                  {result.isNew && (
                    <Text style={styles.summaryNew}>NEW</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  // Sealed pack
  packContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sealedPack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  packEmoji: {
    fontSize: 80,
  },
  packName: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  swipeHint: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  // Card reveal
  revealArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cardContainer: {
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
  },
  cardImageArea: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderEmoji: {
    fontSize: 48,
    opacity: 0.3,
  },
  cardInfo: {
    padding: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  cardCaption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardDate: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  rarityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  raritySymbol: {
    fontSize: fontSizes.md,
  },
  rarityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
  },
  // New badge
  newBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  newBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xs,
    color: colors.bg,
  },
  // Card counter
  cardCounter: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.text,
    marginTop: spacing.lg,
  },
  tapHint: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  // Done
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  doneTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    padding: spacing.sm,
    width: SCREEN_WIDTH * 0.27,
    alignItems: "center",
  },
  summaryCardTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.text,
    textAlign: "center",
  },
  summaryRarity: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  summaryNew: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.accent,
    marginTop: 2,
  },
  doneButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
  },
  doneButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.bg,
  },
});

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { CARDS } from "../data/cards";
import { PACKS } from "../data/packs";
import { RARITY_CONFIG } from "../data/rarities";
import { CARD_IMAGES } from "../data/images";

const SCREEN_WIDTH = Dimensions.get("window").width;
const THUMB_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Filter cards
  const visibleCards =
    activeFilter === "all"
      ? CARDS
      : CARDS.filter((c) => c.packId === activeFilter);

  // Progress for current filter
  const collectedInFilter = visibleCards.filter((c) => collection[c.id]).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Collection</Text>
        <Text style={styles.count}>
          {collectedInFilter}/{visibleCards.length}
        </Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[styles.filterTab, activeFilter === "all" && styles.filterTabActive]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "all" && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        {PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            style={[
              styles.filterTab,
              activeFilter === pack.id && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(pack.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === pack.id && styles.filterTabTextActive,
              ]}
            >
              {pack.emoji} {pack.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width:
                visibleCards.length > 0
                  ? `${(collectedInFilter / visibleCards.length) * 100}%`
                  : "0%",
            },
          ]}
        />
      </View>

      {/* Card grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {visibleCards.map((card) => {
          const isCollected = !!collection[card.id];
          const rarity = RARITY_CONFIG[card.rarity];

          return (
            <Pressable
              key={card.id}
              style={[
                styles.thumb,
                isCollected
                  ? { borderColor: rarity.color }
                  : { borderColor: colors.border },
              ]}
              onPress={() => {
                if (isCollected) router.push(`/card/${card.id}`);
              }}
            >
              {isCollected ? (
                <View style={styles.thumbContent}>
                  {card.image && CARD_IMAGES[card.image] ? (
                    <Image
                      source={CARD_IMAGES[card.image]}
                      style={styles.thumbImage}
                      contentFit="cover"
                    />
                  ) : null}
                  <View style={styles.thumbOverlay}>
                    <Text style={styles.thumbTitle} numberOfLines={1}>
                      {card.title}
                    </Text>
                    <Text style={[styles.thumbRarity, { color: rarity.color }]}>
                      {rarity.symbol}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.thumbLocked}>
                  <Text style={styles.lockedIcon}>?</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  // Filters
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  filterTabText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: colors.accent,
  },
  // Progress bar
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.3,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbContent: {
    flex: 1,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: spacing.xs,
    alignItems: "center",
  },
  thumbTitle: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.text,
    textAlign: "center",
  },
  thumbRarity: {
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  thumbLocked: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  lockedIcon: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.border,
  },
});

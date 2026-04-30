import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { CARDS } from "../data/cards";
import { PACKS } from "../data/packs";
import Card from "../components/Card";
import CardBack from "../components/CardBack";

const SCREEN_WIDTH = Dimensions.get("window").width;
// 3 cards per row with padding on sides and gaps between cards
const H_PAD = spacing.lg;
const GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP * 2) / 3;

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const visibleCards =
    activeFilter === "all"
      ? CARDS
      : CARDS.filter((c) => c.packId === activeFilter);

  const collectedInFilter = visibleCards.filter((c) => collection[c.id]).length;
  const progressPct =
    visibleCards.length > 0
      ? `${(collectedInFilter / visibleCards.length) * 100}%`
      : "0%";

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
          <Text style={[styles.filterTabText, activeFilter === "all" && styles.filterTabTextActive]}>
            All
          </Text>
        </Pressable>
        {PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            style={[styles.filterTab, activeFilter === pack.id && styles.filterTabActive]}
            onPress={() => setActiveFilter(pack.id)}
          >
            <Text style={[styles.filterTabText, activeFilter === pack.id && styles.filterTabTextActive]}>
              {pack.emoji} {pack.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: progressPct as any }]} />
      </View>

      {/* Card grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {visibleCards.map((card) => {
          const isCollected = !!collection[card.id];
          const entry = collection[card.id] ?? null;

          return isCollected ? (
            <Pressable key={card.id} onPress={() => router.push(`/card/${card.id}`)}>
              <Card card={card} entry={entry} width={CARD_WIDTH} />
            </Pressable>
          ) : (
            <CardBack key={card.id} width={CARD_WIDTH} />
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
    paddingHorizontal: H_PAD,
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
  filterRow: {
    paddingHorizontal: H_PAD,
    gap: GAP,
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
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    marginHorizontal: H_PAD,
    marginBottom: spacing.sm,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    gap: GAP,
    paddingBottom: spacing.xxl,
  },
});

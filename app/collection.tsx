import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import { CARDS } from "../data/cards";
import { PACKS } from "../data/packs";
import Card from "../components/Card";
import CardBack from "../components/CardBack";
import type { UIColors } from "../theme/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = spacing.lg;
const GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP * 2) / 3;

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();
  const { collection } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const s = useMemo(() => createStyles(th), [th]);

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
    <View style={[s.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backButton}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Collection</Text>
        <Text style={s.count}>
          {collectedInFilter}/{visibleCards.length}
        </Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        <Pressable
          style={[s.filterTab, activeFilter === "all" && s.filterTabActive]}
          onPress={() => setActiveFilter("all")}
        >
          <Text style={[s.filterTabText, activeFilter === "all" && s.filterTabTextActive]}>
            All
          </Text>
        </Pressable>
        {PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            style={[s.filterTab, activeFilter === pack.id && s.filterTabActive]}
            onPress={() => setActiveFilter(pack.id)}
          >
            <Text style={[s.filterTabText, activeFilter === pack.id && s.filterTabTextActive]}>
              {pack.emoji} {pack.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: progressPct as any }]} />
      </View>

      {/* Card grid */}
      <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
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

function createStyles(th: UIColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: th.bg,
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
      color: th.accent,
    },
    headerTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: th.text,
    },
    count: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.textMuted,
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
      backgroundColor: th.surface,
      borderWidth: 1,
      borderColor: th.border,
    },
    filterTabActive: {
      borderColor: th.accent,
      backgroundColor: th.surfaceLight,
    },
    filterTabText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.textMuted,
    },
    filterTabTextActive: {
      color: th.accent,
    },
    progressBar: {
      height: 4,
      backgroundColor: th.surface,
      marginHorizontal: H_PAD,
      marginBottom: spacing.sm,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: th.accent,
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
}

import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import { CARDS } from "../data/cards";
import { RARITY_CONFIG } from "../data/rarities";
import type { UIColors } from "../theme/colors";

export default function TimelineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();
  const { collection } = useStore();
  const s = useMemo(() => createStyles(th), [th]);

  const sortedCards = [...CARDS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backButton}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Timeline</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={s.timeline}>
        {sortedCards.map((card) => {
          const isCollected = !!collection[card.id];
          const rarity = RARITY_CONFIG[card.rarity];

          return (
            <View key={card.id} style={s.entry}>
              {/* Timeline line + dot */}
              <View style={s.lineContainer}>
                <View style={s.line} />
                <View
                  style={[
                    s.dot,
                    isCollected
                      ? { backgroundColor: rarity.color }
                      : { backgroundColor: th.border },
                  ]}
                />
              </View>

              {/* Card content */}
              {isCollected ? (
                <Pressable
                  style={[s.entryCard, { borderColor: rarity.color }]}
                  onPress={() => router.push(`/card/${card.id}`)}
                >
                  <Text style={s.entryDate}>{card.date}</Text>
                  <Text style={s.entryTitle}>{card.title}</Text>
                  <Text style={[s.entryRarity, { color: rarity.color }]}>
                    {rarity.symbol} {rarity.label}
                  </Text>
                </Pressable>
              ) : (
                <View style={s.entryLocked}>
                  <Text style={s.lockedDate}>{card.date}</Text>
                  <Text style={s.lockedText}>???</Text>
                </View>
              )}
            </View>
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
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
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
    timeline: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    entry: {
      flexDirection: "row",
      minHeight: 72,
    },
    lineContainer: {
      width: 32,
      alignItems: "center",
    },
    line: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: th.border,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: spacing.md,
      zIndex: 1,
    },
    entryCard: {
      flex: 1,
      backgroundColor: th.surface,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      marginLeft: spacing.sm,
    },
    entryDate: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: th.textMuted,
    },
    entryTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: th.text,
      marginTop: 2,
    },
    entryRarity: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.xs,
      marginTop: 2,
    },
    entryLocked: {
      flex: 1,
      backgroundColor: th.surface,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: th.border,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      marginLeft: spacing.sm,
      opacity: 0.5,
    },
    lockedDate: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: th.textMuted,
    },
    lockedText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.sm,
      color: th.border,
      marginTop: 2,
    },
  });
}

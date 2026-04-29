import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { CARDS } from "../data/cards";
import { RARITY_CONFIG } from "../data/rarities";

export default function TimelineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection } = useStore();

  // Sort all cards by date
  const sortedCards = [...CARDS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Timeline</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.timeline}>
        {sortedCards.map((card) => {
          const isCollected = !!collection[card.id];
          const rarity = RARITY_CONFIG[card.rarity];

          return (
            <View key={card.id} style={styles.entry}>
              {/* Timeline line + dot */}
              <View style={styles.lineContainer}>
                <View style={styles.line} />
                <View
                  style={[
                    styles.dot,
                    isCollected
                      ? { backgroundColor: rarity.color }
                      : { backgroundColor: colors.border },
                  ]}
                />
              </View>

              {/* Card content */}
              {isCollected ? (
                <Pressable
                  style={[styles.entryCard, { borderColor: rarity.color }]}
                  onPress={() => router.push(`/card/${card.id}`)}
                >
                  <Text style={styles.entryDate}>{card.date}</Text>
                  <Text style={styles.entryTitle}>{card.title}</Text>
                  <Text style={[styles.entryRarity, { color: rarity.color }]}>
                    {rarity.symbol} {rarity.label}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.entryLocked}>
                  <Text style={styles.lockedDate}>{card.date}</Text>
                  <Text style={styles.lockedText}>???</Text>
                </View>
              )}
            </View>
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
    marginBottom: spacing.md,
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
    backgroundColor: colors.border,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.md,
    zIndex: 1,
  },
  // Collected entry
  entryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  entryDate: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  entryTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.text,
    marginTop: 2,
  },
  entryRarity: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  // Locked entry
  entryLocked: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    opacity: 0.5,
  },
  lockedDate: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  lockedText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.sm,
    color: colors.border,
    marginTop: 2,
  },
});

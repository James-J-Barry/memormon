import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { fonts, fontSizes } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../hooks/useTheme";
import BackgroundParticles from "../../components/BackgroundParticles";
import { CARDS } from "../../data/cards";
import { RARITY_CONFIG, COSMETIC_TIERS } from "../../data/rarities";
import Card from "../../components/Card";
import type { UIColors } from "../../theme/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.78;

export default function CardDetailScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();
  const { collection, unlockCosmetic, applyCosmetic, setFavorite, favorites } =
    useStore();

  const s = useMemo(() => createStyles(th), [th]);

  const card = CARDS.find((c) => c.id === cardId);
  if (!card) return null;

  const entry = collection[card.id];
  if (!entry) return null;

  return (
    <View style={s.outer}>
      <BackgroundParticles />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backButton}>← Back</Text>
        </Pressable>
      </View>

      {/* Card */}
      <View style={s.cardWrapper}>
        <Card card={card} entry={entry} width={CARD_WIDTH} />
      </View>

      {/* Copies count */}
      <Text style={s.copiesText}>
        {entry.count} {entry.count === 1 ? "copy" : "copies"}
      </Text>

      {/* Cosmetic tiers */}
      <View style={s.cosmeticSection}>
        <Text style={s.sectionTitle}>Cosmetics</Text>
        {COSMETIC_TIERS.map((tier) => {
          const isUnlocked = entry.unlockedTiers.includes(tier.tier);
          const isApplied = entry.appliedTier === tier.tier;
          const canUnlock = entry.count >= tier.dupsRequired && !isUnlocked;

          return (
            <Pressable
              key={tier.tier}
              style={[
                s.cosmeticRow,
                isApplied && { borderColor: tier.borderColor },
              ]}
              onPress={() => {
                if (canUnlock) {
                  unlockCosmetic(card.id, tier.tier);
                } else if (isUnlocked) {
                  applyCosmetic(card.id, isApplied ? null : tier.tier);
                }
              }}
            >
              <View
                style={[s.cosmeticSwatch, { backgroundColor: tier.borderColor }]}
              />
              <View style={s.cosmeticInfo}>
                <Text style={s.cosmeticName}>{tier.name}</Text>
                <Text style={s.cosmeticProgress}>
                  {isUnlocked
                    ? isApplied
                      ? "Applied ✓"
                      : "Tap to apply"
                    : `${entry.count} / ${tier.dupsRequired} copies`}
                </Text>
              </View>
              {canUnlock && <Text style={s.unlockLabel}>Unlock!</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* Favorite button */}
      <Pressable
        style={s.favoriteButton}
        onPress={() => {
          const emptySlot = favorites.indexOf(null) as 0 | 1 | 2;
          const slot = emptySlot >= 0 ? emptySlot : 0;
          setFavorite(slot, card.id);
        }}
      >
        <Text style={s.favoriteButtonText}>
          {favorites.includes(card.id) ? "★ Favorited" : "☆ Set as Favorite"}
        </Text>
      </Pressable>
    </ScrollView>
    </View>
  );
}

function createStyles(th: UIColors) {
  return StyleSheet.create({
    outer: {
      flex: 1,
      backgroundColor: th.bg,
    },
    header: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    backButton: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.accent,
    },
    cardWrapper: {
      alignItems: "center",
    },
    copiesText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.textMuted,
      textAlign: "center",
      marginTop: spacing.md,
    },
    cosmeticSection: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: th.text,
      marginBottom: spacing.sm,
    },
    cosmeticRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: th.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: th.border,
    },
    cosmeticSwatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: spacing.sm,
    },
    cosmeticInfo: {
      flex: 1,
    },
    cosmeticName: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.text,
    },
    cosmeticProgress: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: th.textMuted,
    },
    unlockLabel: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.sm,
      color: th.accent,
    },
    favoriteButton: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      backgroundColor: th.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: th.border,
    },
    favoriteButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: th.accent,
    },
  });
}

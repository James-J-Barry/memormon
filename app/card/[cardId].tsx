import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { fonts, fontSizes } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { useStore } from "../../store/useStore";
import { CARDS } from "../../data/cards";
import { RARITY_CONFIG, COSMETIC_TIERS } from "../../data/rarities";
import { CARD_IMAGES } from "../../data/images";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

export default function CardDetailScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection, unlockCosmetic, applyCosmetic, setFavorite, favorites } =
    useStore();

  const card = CARDS.find((c) => c.id === cardId);
  if (!card) return null;

  const entry = collection[card.id];
  if (!entry) return null;

  const rarity = RARITY_CONFIG[card.rarity];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
      </View>

      {/* Card */}
      <View style={styles.cardWrapper}>
        <View
          style={[
            styles.card,
            { borderColor: rarity.color },
            (card.rarity === "epic" || card.rarity === "legendary") && {
              shadowColor: rarity.color,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          {/* Card photo */}
          <View style={styles.imageArea}>
            {card.image && CARD_IMAGES[card.image] ? (
              <Image
                source={CARD_IMAGES[card.image]}
                style={styles.cardImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.imagePlaceholder}>📷</Text>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardCaption}>{card.caption}</Text>
            <Text style={styles.cardDate}>{card.date}</Text>
            <View style={styles.rarityRow}>
              <Text style={[styles.raritySymbol, { color: rarity.color }]}>
                {rarity.symbol}
              </Text>
              <Text style={[styles.rarityLabel, { color: rarity.color }]}>
                {rarity.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Copies count */}
      <Text style={styles.copiesText}>
        Copies: {entry.count}
      </Text>

      {/* Cosmetic tiers */}
      <View style={styles.cosmeticSection}>
        <Text style={styles.sectionTitle}>Cosmetics</Text>
        {COSMETIC_TIERS.map((tier) => {
          const isUnlocked = entry.unlockedTiers.includes(tier.tier);
          const isApplied = entry.appliedTier === tier.tier;
          const canUnlock = entry.count >= tier.dupsRequired && !isUnlocked;

          return (
            <Pressable
              key={tier.tier}
              style={[
                styles.cosmeticRow,
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
                style={[styles.cosmeticSwatch, { backgroundColor: tier.borderColor }]}
              />
              <View style={styles.cosmeticInfo}>
                <Text style={styles.cosmeticName}>{tier.name}</Text>
                <Text style={styles.cosmeticProgress}>
                  {isUnlocked
                    ? isApplied
                      ? "Applied ✓"
                      : "Tap to apply"
                    : `${entry.count} / ${tier.dupsRequired} copies`}
                </Text>
              </View>
              {canUnlock && (
                <Text style={styles.unlockLabel}>Unlock!</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Favorite button */}
      <Pressable
        style={styles.favoriteButton}
        onPress={() => {
          // Find first empty slot, or replace slot 0
          const emptySlot = favorites.indexOf(null) as 0 | 1 | 2;
          const slot = emptySlot >= 0 ? emptySlot : 0;
          setFavorite(slot, card.id);
        }}
      >
        <Text style={styles.favoriteButtonText}>
          {favorites.includes(card.id) ? "★ Favorited" : "☆ Set as Favorite"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  backButton: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  // Card
  cardWrapper: {
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    overflow: "hidden",
  },
  imageArea: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    fontSize: 48,
    opacity: 0.3,
  },
  info: {
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
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  raritySymbol: {
    fontSize: fontSizes.md,
  },
  rarityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
  },
  // Copies
  copiesText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  // Cosmetics
  cosmeticSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cosmeticRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
  },
  cosmeticProgress: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  unlockLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.sm,
    color: colors.accent,
  },
  // Favorite
  favoriteButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
});

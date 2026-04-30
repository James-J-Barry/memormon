import { useRef, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { fonts, displayFonts } from "../theme/typography";
import { RARITY_CONFIG, COSMETIC_TIERS } from "../data/rarities";
import { CARD_IMAGES } from "../data/images";
import type { Card as CardType, CollectionEntry, Rarity } from "../types";
import type { StyleProp, ViewStyle } from "react-native";

// Gem indicators per rarity — hollow for common, filled for rare
const GEMS: Record<Rarity, string[]> = {
  everyday:  ["◇"],
  favorite:  ["◇", "◇"],
  milestone: ["◆"],
  epic:      ["◆", "◆"],
  legendary: ["◆", "◆", "◆"],
};

function formatDate(iso: string): string {
  const [year, month] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

type Props = {
  card: CardType;
  entry?: CollectionEntry | null;
  width: number;
  // 0..1 value driving the holographic shimmer sweep (from device tilt or animation)
  shimmerX?: SharedValue<number>;
  isNew?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export default function Card({ card, entry, width, shimmerX, isNew, style }: Props) {
  const height = width * 1.4;

  // All dimensions derived from width so the card scales to any size
  const bp          = Math.max(4, width * 0.027);  // border padding (the thick ivory frame)
  const outerR      = width * 0.075;                // outer corner radius
  const innerR      = Math.max(4, outerR - bp);     // inner corner radius
  const typeStripH  = Math.max(2, width * 0.015);   // colored rarity band
  const infoH       = height * 0.34;                // cream info section height
  const infoPad     = Math.max(5, width * 0.04);
  const titleSize   = Math.max(9, width * 0.058);
  const captionSize = Math.max(7, width * 0.04);
  const dateSize    = Math.max(6, width * 0.033);
  const gemSize     = Math.max(8, width * 0.048);

  const rarity = RARITY_CONFIG[card.rarity];

  // Cosmetic tier overrides the default ivory frame color
  const appliedCosmetic =
    entry?.appliedTier != null
      ? COSMETIC_TIERS.find((t) => t.tier === entry.appliedTier) ?? null
      : null;

  const frameColor = appliedCosmetic?.borderColor ?? colors.cardFrame;
  const glowColor =
    appliedCosmetic?.glowColor ??
    (card.rarity === "epic" || card.rarity === "legendary"
      ? rarity.color + "55"
      : null);

  const isHolo =
    card.rarity === "epic" ||
    card.rarity === "legendary" ||
    appliedCosmetic != null;

  // Internal shimmer shared value — used when no external shimmerX is passed.
  // Stagger start time so multiple holo cards don't sweep in perfect sync.
  const shimmerDelay = useRef(Math.floor(Math.random() * 2000)).current;
  const internalShimmerX = useSharedValue(0);
  const activeShimmerX: SharedValue<number> = shimmerX ?? internalShimmerX;

  // Auto-animate shimmer for holo cards displayed statically (collection grid, etc.)
  useEffect(() => {
    if (isHolo && !shimmerX) {
      internalShimmerX.value = withDelay(
        shimmerDelay,
        withRepeat(withTiming(1, { duration: 3200 }), -1, true),
      );
    }
  }, []);

  // Shimmer overlay: a wide gradient that translates across the image area
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeShimmerX.value * width * 3 - width * 2 }],
  }));

  const gems = GEMS[card.rarity];
  const showCaption = captionSize >= 9;

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: outerR,
          backgroundColor: frameColor,
          padding: bp,
          shadowColor: glowColor ?? "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowColor ? 0.85 : 0,
          shadowRadius: width * 0.12,
          elevation: glowColor ? 10 : 0,
        },
        style,
      ]}
    >
      {/* Inner card — clips photo to rounded shape */}
      <View
        style={{
          flex: 1,
          borderRadius: innerR,
          overflow: "hidden",
          backgroundColor: colors.cardImageBg,
        }}
      >
        {/* ── Photo area ── */}
        <View style={{ flex: 1, overflow: "hidden" }}>
          {card.image && CARD_IMAGES[card.image] ? (
            <Image
              source={CARD_IMAGES[card.image]}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
              <Text style={{ fontSize: width * 0.16, opacity: 0.25 }}>📷</Text>
            </View>
          )}

          {/* Holographic shimmer — wide gradient that pans across */}
          {isHolo && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: width * 3,
                },
                shimmerStyle,
              ]}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.05)",
                  "rgba(200,160,255,0.12)",
                  "rgba(255,220,140,0.08)",
                  "rgba(255,255,255,0.05)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          )}

          {/* NEW! badge */}
          {isNew && (
            <View
              style={[
                styles.newBadge,
                {
                  top: infoPad * 0.5,
                  right: infoPad * 0.5,
                  paddingHorizontal: infoPad * 0.5,
                  paddingVertical: infoPad * 0.25,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fonts.bold,
                  fontSize: dateSize,
                  color: colors.cardImageBg,
                  letterSpacing: 0.5,
                }}
              >
                NEW!
              </Text>
            </View>
          )}
        </View>

        {/* ── Rarity color band (the "type" strip from Pokemon cards) ── */}
        <View style={{ height: typeStripH, backgroundColor: rarity.color }} />

        {/* ── Cream info section ── */}
        <View
          style={{
            height: infoH,
            backgroundColor: colors.cardInfo,
            paddingHorizontal: infoPad,
            paddingTop: infoPad * 0.6,
            paddingBottom: infoPad * 0.5,
            justifyContent: "space-between",
          }}
        >
          {/* Title + caption */}
          <View style={{ flex: 1, overflow: "hidden" }}>
            <Text
              style={{
                fontFamily: displayFonts.bold,
                fontSize: titleSize,
                color: colors.cardInfoText,
                lineHeight: titleSize * 1.2,
              }}
              numberOfLines={1}
            >
              {card.title}
            </Text>
            {showCaption && (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: captionSize,
                  color: colors.cardInfoMuted,
                  marginTop: 2,
                  lineHeight: captionSize * 1.3,
                }}
                numberOfLines={2}
              >
                {card.caption}
              </Text>
            )}
          </View>

          {/* Date left / rarity gems right */}
          <View style={styles.infoBottom}>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: dateSize,
                color: colors.cardInfoMuted,
              }}
            >
              {formatDate(card.date)}
            </Text>
            <View style={styles.gems}>
              {gems.map((g, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: gemSize,
                    color: rarity.color,
                    lineHeight: gemSize * 1.1,
                  }}
                >
                  {g}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardImageBg,
  },
  newBadge: {
    position: "absolute",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  infoBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  gems: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
});

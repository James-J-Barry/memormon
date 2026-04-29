import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { PACKS } from "../data/packs";
import { CARDS } from "../data/cards";
import { useStore } from "../store/useStore";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PACK_WIDTH = SCREEN_WIDTH * 0.65;
const PACK_HEIGHT = PACK_WIDTH * 1.4;

export default function PackSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { packsAvailable, collection } = useStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Choose a Pack</Text>
        <Text style={styles.packCount}>
          {packsAvailable} available
        </Text>
      </View>

      {/* Pack carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        decelerationRate="fast"
        snapToInterval={PACK_WIDTH + spacing.md}
      >
        {PACKS.map((pack) => {
          const packCards = CARDS.filter((c) => c.packId === pack.id);
          const collected = packCards.filter((c) => collection[c.id]).length;
          const total = packCards.length;

          return (
            <Pressable
              key={pack.id}
              onPress={() => {
                if (packsAvailable > 0) {
                  router.push(`/open/${pack.id}`);
                }
              }}
              style={styles.packWrapper}
            >
              <LinearGradient
                colors={[pack.coverColor, colors.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.packCover}
              >
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packDescription}>{pack.description}</Text>
                <Text style={styles.packProgress}>
                  {collected} / {total} collected
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>

      {packsAvailable === 0 && (
        <Text style={styles.noPacksText}>No packs available right now</Text>
      )}
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
    marginBottom: spacing.lg,
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
  packCount: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  carousel: {
    paddingHorizontal: (SCREEN_WIDTH - PACK_WIDTH) / 2,
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  packWrapper: {
    width: PACK_WIDTH,
    marginRight: spacing.md,
  },
  packCover: {
    width: PACK_WIDTH,
    height: PACK_HEIGHT,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  packName: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
    textAlign: "center",
  },
  packDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  packProgress: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.text,
    marginTop: spacing.lg,
    opacity: 0.7,
  },
  noPacksText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});

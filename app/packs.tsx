import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { PACKS } from "../data/packs";
import { CARDS } from "../data/cards";
import { useStore } from "../store/useStore";
import PackCover from "../components/PackCover";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PACK_WIDTH = SCREEN_WIDTH * 0.65;
const PACK_HEIGHT = PACK_WIDTH * 1.72;

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
        <Text style={styles.packCount}>{packsAvailable} available</Text>
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
          const canOpen = packsAvailable > 0;

          return (
            <Pressable
              key={pack.id}
              style={[styles.packWrapper, !canOpen && styles.packWrapperDisabled]}
              onPress={() => {
                if (canOpen) router.push(`/open/${pack.id}`);
              }}
            >
              <PackCover pack={pack} width={PACK_WIDTH} height={PACK_HEIGHT} />

              {/* Progress below pack */}
              <Text style={styles.progress}>
                {collected} / {total} collected
              </Text>

              {/* Overlay when no packs available */}
              {!canOpen && (
                <View style={[styles.lockedOverlay, { width: PACK_WIDTH, height: PACK_HEIGHT }]} />
              )}
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
    alignItems: "center",
  },
  packWrapperDisabled: {
    opacity: 0.5,
  },
  progress: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    borderRadius: PACK_WIDTH * 0.06,
    backgroundColor: "rgba(13,11,18,0.45)",
  },
  noPacksText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});

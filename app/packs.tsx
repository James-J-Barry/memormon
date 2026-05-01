import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { fonts, fontSizes } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { PACKS } from "../data/packs";
import { CARDS } from "../data/cards";
import { useStore } from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import PackCover from "../components/PackCover";
import BackgroundParticles from "../components/BackgroundParticles";
import type { UIColors } from "../theme/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PACK_WIDTH = SCREEN_WIDTH * 0.65;
const PACK_HEIGHT = PACK_WIDTH * 1.72;

export default function PackSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();
  const { packsAvailable, collection } = useStore();
  const s = useMemo(() => createStyles(th), [th]);

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.md }]}>
      <BackgroundParticles />
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backButton}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Choose a Pack</Text>
        <Text style={s.packCount}>{packsAvailable} available</Text>
      </View>

      {/* Pack carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.carousel}
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
              style={[s.packWrapper, !canOpen && s.packWrapperDisabled]}
              onPress={() => {
                if (canOpen) router.push(`/open/${pack.id}`);
              }}
            >
              <PackCover pack={pack} width={PACK_WIDTH} height={PACK_HEIGHT} />

              <Text style={s.progress}>
                {collected} / {total} collected
              </Text>

              {!canOpen && (
                <View style={[s.lockedOverlay, { width: PACK_WIDTH, height: PACK_HEIGHT }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {packsAvailable === 0 && (
        <Text style={s.noPacksText}>No packs available right now</Text>
      )}
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
      marginBottom: spacing.lg,
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
    packCount: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.textMuted,
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
      color: th.textMuted,
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
      color: th.textMuted,
      textAlign: "center",
      marginTop: spacing.lg,
    },
  });
}

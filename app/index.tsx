import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { colors } from "../theme/colors";
import { fonts, fontSizes } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { CARDS } from "../data/cards";
import { msUntilNextPack, formatCountdown } from "../services/timerService";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collection, packsAvailable, lastPackTime, refreshPacks, grantPacks } = useStore();

  // Refresh packs on mount
  useEffect(() => {
    refreshPacks();
  }, []);

  // Countdown timer
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => {
      const ms = msUntilNextPack(packsAvailable, lastPackTime);
      setCountdown(ms > 0 ? formatCountdown(ms) : "");
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [packsAvailable, lastPackTime]);

  const collectedCount = Object.keys(collection).length;
  const totalCards = CARDS.length;
  const hasPacksReady = packsAvailable > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {/* Title */}
      <Text style={styles.title}>Memormon</Text>
      <Text style={styles.subtitle}>A love story in cards</Text>

      {/* Collection progress */}
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          {collectedCount} / {totalCards} memories discovered
        </Text>
      </View>

      {/* Pack status — long press to grant a pack (dev shortcut) */}
      <Pressable style={styles.packStatus} onLongPress={() => grantPacks(2)}>
        {hasPacksReady ? (
          <Text style={styles.packsReady}>
            {packsAvailable} pack{packsAvailable !== 1 ? "s" : ""} ready!
          </Text>
        ) : (
          <Text style={styles.countdownText}>
            Next pack in {countdown}
          </Text>
        )}
      </Pressable>

      {/* Navigation buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, hasPacksReady && styles.buttonGlow]}
          onPress={() => router.push("/packs")}
        >
          <Text style={styles.buttonText}>Open Packs</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/collection")}
        >
          <Text style={styles.buttonText}>Collection</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/timeline")}
        >
          <Text style={styles.buttonText}>Timeline</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.text,
    marginTop: spacing.xxl,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  progressBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  packStatus: {
    marginTop: spacing.lg,
  },
  packsReady: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.accent,
  },
  countdownText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  buttons: {
    marginTop: spacing.xxl,
    width: "100%",
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonGlow: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
  },
});

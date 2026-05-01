import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState, useMemo } from "react";
import { fonts, fontSizes } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import { CARDS } from "../data/cards";
import { msUntilNextPack, formatCountdown } from "../services/timerService";
import BackgroundParticles from "../components/BackgroundParticles";
import type { UIColors } from "../theme/colors";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();
  const { collection, packsAvailable, lastPackTime, refreshPacks, grantPacks } = useStore();

  const s = useMemo(() => createStyles(th), [th]);

  useEffect(() => { refreshPacks(); }, []);

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
    <View style={[s.container, { paddingTop: insets.top + spacing.lg }]}>
      <BackgroundParticles />

      {/* Title */}
      <Text style={s.title}>Memormon</Text>
      <Text style={s.subtitle}>Our love story in cards</Text>

      {/* Collection progress */}
      <View style={s.progressBox}>
        <Text style={s.progressText}>
          {collectedCount} / {totalCards} memories discovered
        </Text>
      </View>

      {/* Pack status — long press to grant packs */}
      <Pressable style={s.packStatus} onLongPress={() => grantPacks(2)}>
        {hasPacksReady ? (
          <Text style={s.packsReady}>
            {packsAvailable} pack{packsAvailable !== 1 ? "s" : ""} ready!
          </Text>
        ) : (
          <Text style={s.countdownText}>Next pack in {countdown}</Text>
        )}
      </Pressable>

      {/* Navigation buttons */}
      <View style={s.buttons}>
        <Pressable
          style={[s.button, hasPacksReady && s.buttonGlow]}
          onPress={() => router.push("/packs")}
        >
          <Text style={s.buttonText}>Open Packs</Text>
        </Pressable>

        <Pressable style={s.button} onPress={() => router.push("/collection")}>
          <Text style={s.buttonText}>Collection</Text>
        </Pressable>

        <Pressable style={s.button} onPress={() => router.push("/timeline")}>
          <Text style={s.buttonText}>Timeline</Text>
        </Pressable>

        <Pressable style={s.button} onPress={() => router.push("/settings")}>
          <Text style={[s.buttonText, s.settingsText]}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(th: UIColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: th.bg,
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xxl,
      color: th.text,
      marginTop: spacing.xxl,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: th.textMuted,
      marginTop: spacing.xs,
    },
    progressBox: {
      marginTop: spacing.xl,
      backgroundColor: th.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: th.border,
      borderBottomWidth: 3,
      borderBottomColor: "rgba(0,0,0,0.18)",
    },
    progressText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.text,
    },
    packStatus: {
      marginTop: spacing.lg,
    },
    packsReady: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: th.accent,
    },
    countdownText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.textMuted,
    },
    buttons: {
      marginTop: spacing.xxl,
      width: "100%",
      gap: spacing.md,
    },
    button: {
      backgroundColor: th.surface,
      paddingVertical: spacing.md,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: th.border,
      borderBottomWidth: 4,
      borderBottomColor: "rgba(0,0,0,0.22)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonGlow: {
      borderColor: th.accent,
      borderBottomColor: th.accent,
      shadowColor: th.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
    },
    buttonText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: th.text,
    },
    settingsText: {
      color: th.textMuted,
    },
  });
}

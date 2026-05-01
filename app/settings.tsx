import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { fonts, fontSizes } from "../theme/typography";
import { spacing, borderRadius } from "../theme/spacing";
import { useStore } from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import BackgroundParticles from "../components/BackgroundParticles";
import type { UIColors } from "../theme/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const th = useTheme();

  const {
    theme,
    hapticsEnabled,
    revealSpeed,
    setTheme,
    setHapticsEnabled,
    setRevealSpeed,
  } = useStore();

  const s = useMemo(() => createStyles(th), [th]);

  return (
    <View style={s.outer}>
      <BackgroundParticles />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backButton}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Appearance ── */}
      <Text style={s.sectionLabel}>Appearance</Text>
      <View style={s.section}>
        <View style={s.row}>
          <View style={s.rowInfo}>
            <Text style={s.rowTitle}>Theme</Text>
            <Text style={s.rowSubtitle}>
              {theme === "light" ? "Light" : "Dark"}
            </Text>
          </View>
          {/* Segmented control */}
          <View style={s.segmented}>
            <Pressable
              style={[s.segment, s.segmentLeft, theme === "light" && s.segmentActive]}
              onPress={() => setTheme("light")}
            >
              <Text style={[s.segmentText, theme === "light" && s.segmentTextActive]}>
                Light
              </Text>
            </Pressable>
            <Pressable
              style={[s.segment, s.segmentRight, theme === "dark" && s.segmentActive]}
              onPress={() => setTheme("dark")}
            >
              <Text style={[s.segmentText, theme === "dark" && s.segmentTextActive]}>
                Dark
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Gameplay ── */}
      <Text style={s.sectionLabel}>Gameplay</Text>
      <View style={s.section}>
        {/* Haptics */}
        <View style={[s.row, s.rowBorder]}>
          <View style={s.rowInfo}>
            <Text style={s.rowTitle}>Haptic Feedback</Text>
            <Text style={s.rowSubtitle}>Vibration on card reveals</Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: th.border, true: th.accent }}
            thumbColor={th.surface}
          />
        </View>

        {/* Reveal speed */}
        <View style={s.row}>
          <View style={s.rowInfo}>
            <Text style={s.rowTitle}>Card Reveal Speed</Text>
            <Text style={s.rowSubtitle}>
              {revealSpeed === "slow" ? "Slow — cinematic" : "Normal"}
            </Text>
          </View>
          <View style={s.segmented}>
            <Pressable
              style={[s.segment, s.segmentLeft, revealSpeed === "normal" && s.segmentActive]}
              onPress={() => setRevealSpeed("normal")}
            >
              <Text style={[s.segmentText, revealSpeed === "normal" && s.segmentTextActive]}>
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={[s.segment, s.segmentRight, revealSpeed === "slow" && s.segmentActive]}
              onPress={() => setRevealSpeed("slow")}
            >
              <Text style={[s.segmentText, revealSpeed === "slow" && s.segmentTextActive]}>
                Slow
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── About ── */}
      <Text style={s.sectionLabel}>About</Text>
      <View style={s.section}>
        <View style={[s.row, s.rowBorder]}>
          <Text style={s.rowTitle}>Version</Text>
          <Text style={s.rowValue}>1.0.0</Text>
        </View>
        <View style={s.aboutRow}>
          <Text style={s.aboutText}>Made for Avery with love</Text>
          <Text style={s.aboutHeart}>♡</Text>
        </View>
      </View>
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
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
    sectionLabel: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: th.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    section: {
      backgroundColor: th.surface,
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: th.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: th.border,
    },
    rowInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    rowTitle: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.text,
    },
    rowSubtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: th.textMuted,
      marginTop: 2,
    },
    rowValue: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.textMuted,
    },
    // Segmented control
    segmented: {
      flexDirection: "row",
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: th.border,
      overflow: "hidden",
    },
    segment: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: th.surfaceLight,
    },
    segmentLeft: {
      borderRightWidth: 1,
      borderRightColor: th.border,
    },
    segmentRight: {},
    segmentActive: {
      backgroundColor: th.accent,
    },
    segmentText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: th.textMuted,
    },
    segmentTextActive: {
      color: th.bg,
    },
    // About section
    aboutRow: {
      alignItems: "center",
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    aboutText: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: th.text,
      textAlign: "center",
    },
    aboutHeart: {
      fontSize: fontSizes.xl,
      color: "#e8a0bf",
    },
  });
}

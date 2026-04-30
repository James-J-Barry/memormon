import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts, displayFonts } from "../theme/typography";
import type { Pack } from "../types";

type Props = {
  pack: Pack;
  width: number;
  height: number;
};

export default function PackCover({ pack, width, height }: Props) {
  const r = width * 0.06;

  return (
    <View style={{ width, height, borderRadius: r, overflow: "hidden" }}>
      {/* Main gradient: light top → pack color → near-black bottom */}
      <LinearGradient
        colors={["rgba(255,255,255,0.22)", pack.coverColor + "ee", "#09070f"]}
        locations={[0, 0.5, 1]}
        style={[StyleSheet.absoluteFill, styles.inner, { padding: width * 0.07 }]}
      >
        {/* Series label */}
        <Text
          style={{
            fontFamily: fonts.medium,
            fontSize: width * 0.06,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: width * 0.018,
            marginBottom: width * 0.06,
          }}
        >
          MEMORIES
        </Text>

        {/* Pack emoji */}
        <Text style={{ fontSize: width * 0.28 }}>{pack.emoji}</Text>

        {/* Pack name */}
        <Text
          style={{
            fontFamily: displayFonts.bold,
            fontSize: width * 0.115,
            color: "rgba(255,255,255,0.95)",
            textAlign: "center",
            marginTop: width * 0.055,
            lineHeight: width * 0.135,
          }}
          numberOfLines={3}
        >
          {pack.name}
        </Text>

        {/* Decorative divider */}
        <View style={[styles.divider, { marginTop: width * 0.06 }]}>
          <View style={styles.dividerLine} />
          <Text style={[styles.dividerGem, { fontSize: width * 0.055 }]}>◆</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Pack description */}
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: width * 0.062,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginTop: width * 0.04,
            lineHeight: width * 0.088,
          }}
          numberOfLines={3}
        >
          {pack.description}
        </Text>
      </LinearGradient>

      {/* Diagonal sheen overlay */}
      <LinearGradient
        colors={["rgba(255,255,255,0.1)", "transparent", "rgba(0,0,0,0.12)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "70%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerGem: {
    color: "rgba(255,255,255,0.35)",
  },
});

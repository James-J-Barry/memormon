import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { displayFonts } from "../theme/typography";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  width: number;
  style?: StyleProp<ViewStyle>;
};

export default function CardBack({ width, style }: Props) {
  const height = width * 1.4;
  const bp     = Math.max(4, width * 0.027);
  const outerR = width * 0.075;
  const innerR = Math.max(4, outerR - bp);

  const emblemOuter = width * 0.46;
  const emblemInner = width * 0.30;
  const letterSize  = width * 0.2;
  const labelSize   = Math.max(7, width * 0.065);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: outerR,
          backgroundColor: colors.cardFrame,
          padding: bp,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, borderRadius: innerR, overflow: "hidden" }}>
        <LinearGradient
          colors={["#2e1f48", "#0d0b1a", "#1e1438", "#0d0b1a", "#2e1f48"]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {/* Decorative dot grid — subtle texture */}
          <DotGrid width={width} height={height} />

          {/* Concentric circle emblem */}
          <View
            style={{
              width: emblemOuter,
              height: emblemOuter,
              borderRadius: emblemOuter / 2,
              borderWidth: 1.5,
              borderColor: "rgba(212,168,83,0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: emblemInner,
                height: emblemInner,
                borderRadius: emblemInner / 2,
                borderWidth: 1,
                borderColor: "rgba(212,168,83,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: displayFonts.italic,
                  fontSize: letterSize,
                  color: "rgba(212,168,83,0.55)",
                  includeFontPadding: false,
                }}
              >
                M
              </Text>
            </View>
          </View>

          {/* Bottom label */}
          <Text
            style={{
              position: "absolute",
              bottom: width * 0.07,
              fontFamily: displayFonts.regular,
              fontSize: labelSize,
              color: "rgba(212,168,83,0.38)",
              letterSpacing: width * 0.016,
            }}
          >
            memormon
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// A simple grid of faint dots for background texture
function DotGrid({ width, height }: { width: number; height: number }) {
  const spacing = width * 0.12;
  const dotSize = Math.max(1, width * 0.018);
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;

  const dots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ x: c * spacing, y: r * spacing });
    }
  }

  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height }}>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: "rgba(212,168,83,0.12)",
          }}
        />
      ))}
    </View>
  );
}

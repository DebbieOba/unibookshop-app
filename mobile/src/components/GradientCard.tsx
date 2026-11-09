import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../hooks/useTheme";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  colors?: readonly [string, string, ...string[]];
}

export function GradientCard({ children, style, colors }: GradientCardProps) {
  const theme = useTheme();
  
  // Default stunning purple-blue gradient inspired by fintech apps
  const defaultColors = [theme.colors.primary, "#8A2BE2"] as const;

  return (
    <LinearGradient
      colors={colors || defaultColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: theme.radii.card }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});

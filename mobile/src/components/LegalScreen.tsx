import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { AppText } from "./AppText";
import { Chip } from "./Chip";

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalScreenProps {
  title: string;
  effectiveDate: string;
  intro?: string;
  sections: LegalSection[];
  /** Shown once at the top — this pass ships structural placeholder copy
   * pending real legal review, per the plan's decision on legal content. */
  isDraft?: boolean;
}

/** Shared renderer for Terms/Privacy/Refund — heading, effective date,
 * jump-to-section chips, and section body copy, per
 * BookdeckMobileDesignSystem.md §12.30. */
export function LegalScreen({
  title,
  effectiveDate,
  intro,
  sections,
  isDraft,
}: LegalScreenProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [sectionY, setSectionY] = useState<Record<number, number>>({});

  const scrollToSection = (index: number) => {
    const y = sectionY[index];
    if (y != null)
      scrollRef.current?.scrollTo({ y: y - theme.spacing.md, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <AppText variant="title">{title}</AppText>
      <AppText variant="label" style={{ color: theme.colors.textSecondary }}>
        Effective {effectiveDate}
      </AppText>

      {isDraft ? (
        <View
          style={{
            padding: theme.spacing.md,
            borderRadius: theme.radii.card,
            backgroundColor: theme.colors.warningSubtle,
          }}
        >
          <AppText
            variant="label"
            weight="semiBold"
            style={{ color: theme.colors.warning }}
          >
            Draft — pending legal review. This text has not been finalized.
          </AppText>
        </View>
      ) : null}

      {intro ? (
        <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
          {intro}
        </AppText>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
          marginVertical: theme.spacing.sm,
        }}
      >
        {sections.map((section, index) => (
          <Chip
            key={section.heading}
            label={section.heading}
            onPress={() => scrollToSection(index)}
          />
        ))}
      </View>

      {sections.map((section, index) => (
        <View
          key={section.heading}
          onLayout={(e) =>
            setSectionY((prev) => ({
              ...prev,
              [index]: e.nativeEvent.layout.y,
            }))
          }
          style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}
        >
          <AppText variant="sectionHeader">{section.heading}</AppText>
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            {section.body}
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
}

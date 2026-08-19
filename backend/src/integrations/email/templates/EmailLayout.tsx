import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

// Dark-theme brand colors, matching design-system.md §2.
const colors = {
  background: '#0A1220',
  surface: '#101B2E',
  border: '#223252',
  primary: '#CCF2FA',
  textPrimary: '#F2F6FA',
  textSecondary: '#93A4BD',
};

interface EmailLayoutProps {
  previewText: string;
  heading: string;
  children: React.ReactNode;
}

export function EmailLayout({
  previewText,
  heading,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: colors.background,
          fontFamily: 'sans-serif',
          margin: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            margin: '40px auto',
            padding: 32,
            maxWidth: 480,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 24,
              letterSpacing: 2,
            }}
          >
            CURRICULA
          </Text>
          <Heading style={{ color: colors.textPrimary, fontSize: 22 }}>
            {heading}
          </Heading>
          <Section
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: '22px',
            }}
          >
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

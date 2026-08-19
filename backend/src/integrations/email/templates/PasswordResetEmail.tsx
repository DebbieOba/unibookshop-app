import { Button, Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface PasswordResetEmailProps {
  token: string;
}

// Deep-links straight into the app (app.json scheme "curricula") —
// frontend-architecture.md §10 wires the corresponding route.
export function PasswordResetEmail({ token }: PasswordResetEmailProps) {
  const resetUrl = `curricula://reset-password?token=${encodeURIComponent(token)}`;

  return (
    <EmailLayout previewText="Reset your CURRICULA password" heading="Reset your password">
      <Text>
        We received a request to reset your password. This link expires in 30 minutes — if you
        didn't request this, you can safely ignore this email.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: '#CCF2FA',
          color: '#0A1220',
          borderRadius: 10,
          padding: '12px 24px',
          fontWeight: 700,
          marginTop: 16,
        }}
      >
        Reset Password
      </Button>
    </EmailLayout>
  );
}

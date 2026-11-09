import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface OtpEmailProps {
  code: string;
  purpose: 'verify-email' | 'sign-in';
}

export function OtpEmail({ code, purpose }: OtpEmailProps) {
  const heading =
    purpose === 'sign-in' ? 'Your sign-in code' : 'Verify your email';
  const intro =
    purpose === 'sign-in'
      ? 'Use the code below to complete signing in to your account. It expires in 10 minutes.'
      : 'Use the code below to verify your email address. It expires in 10 minutes.';

  return (
    <EmailLayout previewText={`Your verification code: ${code}`} heading={heading}>
      <Text>{intro}</Text>
      <Text
        style={{
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: 8,
          color: '#CCF2FA',
          textAlign: 'center',
          margin: '24px 0',
          backgroundColor: '#0A1220',
          borderRadius: 10,
          padding: '16px 24px',
        }}
      >
        {code}
      </Text>
      <Text style={{ fontSize: 13 }}>
        If you didn't request this code, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}

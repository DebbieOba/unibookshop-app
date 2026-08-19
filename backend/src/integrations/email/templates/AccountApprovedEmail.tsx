import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export function AccountApprovedEmail() {
  return (
    <EmailLayout previewText="Your account has been approved" heading="You're in!">
      <Text>
        Your CURRICULA account has been approved. Open the app and log in to start
        browsing textbooks for your department.
      </Text>
    </EmailLayout>
  );
}

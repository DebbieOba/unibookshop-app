import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export function AccountRestoredEmail() {
  return (
    <EmailLayout
      previewText="Your account access has been restored"
      heading="Account restored"
    >
      <Text>
        Your CURRICULA account access has been restored. Open the app and log in
        to continue browsing textbooks for your department.
      </Text>
    </EmailLayout>
  );
}

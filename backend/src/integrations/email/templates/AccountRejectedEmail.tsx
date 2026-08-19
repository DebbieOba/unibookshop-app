import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export function AccountRejectedEmail() {
  return (
    <EmailLayout previewText="Update on your account application" heading="Application not approved">
      <Text>
        Your CURRICULA account application was not approved. If you believe this is a
        mistake, please contact your university administrator for details.
      </Text>
    </EmailLayout>
  );
}

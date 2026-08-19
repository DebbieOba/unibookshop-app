import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface AccountRestrictedEmailProps {
  body: string;
}

// `body` carries the admin-supplied reason (see ApprovalsService.restrict) —
// there's no separate reason field in the notification payload, same pattern
// OrderReceiptEmail already uses for status-change copy.
export function AccountRestrictedEmail({ body }: AccountRestrictedEmailProps) {
  return (
    <EmailLayout previewText="Your account has been restricted" heading="Account restricted">
      <Text>{body}</Text>
    </EmailLayout>
  );
}

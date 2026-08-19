import { Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface OrderReceiptEmailProps {
  title: string;
  body: string;
}

// Backed by whatever title/body CheckoutService passes for the order-status
// change (see notification/channels/email.channel.ts) — not itemized line
// items, since that's all the current notification payload carries.
export function OrderReceiptEmail({ title, body }: OrderReceiptEmailProps) {
  return (
    <EmailLayout previewText={title} heading={title}>
      <Text>{body}</Text>
    </EmailLayout>
  );
}

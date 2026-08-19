import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { LegalScreen } from '../../../components/LegalScreen';

type Props = NativeStackScreenProps<StudentStackParamList, 'RefundPolicy'>;

export function RefundPolicyScreen({}: Props) {
  return (
    <LegalScreen
      title="Refund Policy"
      effectiveDate="16 July 2026"
      isDraft
      intro="How refunds work for orders placed through CURRICULA."
      sections={[
        {
          heading: 'Eligibility',
          body: 'A refund may be requested if an order was cancelled before processing, a book arrives damaged, or the wrong item was delivered.',
        },
        {
          heading: 'How to Request',
          body: 'Contact support from your Order Details screen with your order reference and the reason for the refund request.',
        },
        {
          heading: 'Processing Time',
          body: 'Approved refunds are returned to your original payment method through our payment provider, typically within 5–10 business days.',
        },
        {
          heading: 'Non-Refundable Cases',
          body: 'Orders already collected/delivered and confirmed in good condition are not eligible for refund except where a book was materially misdescribed.',
        },
      ]}
    />
  );
}

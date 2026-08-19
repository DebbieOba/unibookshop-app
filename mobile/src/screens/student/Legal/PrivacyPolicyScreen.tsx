import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { LegalScreen } from '../../../components/LegalScreen';

type Props = NativeStackScreenProps<StudentStackParamList, 'PrivacyPolicy'>;

export function PrivacyPolicyScreen({}: Props) {
  return (
    <LegalScreen
      title="Privacy Policy"
      effectiveDate="16 July 2026"
      isDraft
      intro="This explains what information CURRICULA collects and how it's used."
      sections={[
        {
          heading: 'Information We Collect',
          body: 'Account details (email, matric number), academic profile (department, level), order and address history, and device push tokens for notifications.',
        },
        {
          heading: 'How We Use It',
          body: 'To process orders and payments, show books relevant to your course, send order-status and account notifications, and improve the app.',
        },
        {
          heading: 'Payment Information',
          body: 'Card details are handled entirely by our payment providers (Paystack, Flutterwave) — CURRICULA never receives or stores your card number.',
        },
        {
          heading: 'Sharing',
          body: 'We share order and delivery details with payment and delivery partners only as needed to fulfil your order. We do not sell your data.',
        },
        {
          heading: 'Your Choices',
          body: 'You can update your profile, addresses and notification preferences at any time from Account, or request account deletion via Contact Support.',
        },
      ]}
    />
  );
}

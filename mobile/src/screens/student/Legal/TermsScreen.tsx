import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../../navigation/types';
import { LegalScreen } from '../../../components/LegalScreen';

type Props = NativeStackScreenProps<StudentStackParamList, 'Terms'>;

export function TermsScreen({}: Props) {
  return (
    <LegalScreen
      title="Terms of Service"
      effectiveDate="16 July 2026"
      isDraft
      intro="These terms govern your use of the CURRICULA app to browse, order and pay for textbooks."
      sections={[
        {
          heading: 'Accounts',
          body: 'You must provide accurate registration details and keep your login credentials confidential. You are responsible for activity on your account.',
        },
        {
          heading: 'Orders & Payment',
          body: 'Placing an order is an offer to purchase at the listed price. Payment is processed by our third-party payment providers; we do not store your card details.',
        },
        {
          heading: 'Delivery & Pickup',
          body: 'Delivery times shown at checkout are estimates. Campus pickup orders must be collected within the window shown on your order.',
        },
        {
          heading: 'Cancellations',
          body: 'Orders can only be cancelled before they enter processing. Contact support if you need help with an order already in progress.',
        },
        {
          heading: 'Acceptable Use',
          body: 'You agree not to misuse the app, attempt to access accounts that are not yours, or interfere with its normal operation.',
        },
        {
          heading: 'Changes to These Terms',
          body: 'We may update these terms from time to time. Continued use of the app after a change means you accept the updated terms.',
        },
      ]}
    />
  );
}

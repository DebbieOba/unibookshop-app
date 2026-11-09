import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../../navigation/types";
import { LegalScreen } from "../../../components/LegalScreen";

type Props = NativeStackScreenProps<CustomerStackParamList, "PrivacyPolicy">;

export function PrivacyPolicyScreen({}: Props) {
  return (
    <LegalScreen
      title="Privacy Policy"
      effectiveDate="9 November 2026"
      isDraft
      intro="This explains what personal data BOOKDECK collects, our lawful bases under the Nigeria Data Protection Act 2023, and how your privacy rights are protected."
      sections={[
        {
          heading: "Information We Collect",
          body: "Account details (full name, email address, phone number), delivery street addresses, transaction histories and payment references, device push notification tokens, and security audit logs.",
        },
        {
          heading: "How We Use It (Lawful Bases)",
          body: "Under NDPA 2023 §25, we process data based on Contractual Necessity (order fulfillment and delivery), Legal Obligation (invoices and 7-year CBN tax records), and Legitimate Interests (fraud prevention and platform security).",
        },
        {
          heading: "Payment Information & Security",
          body: "Online payments are processed securely by CBN-licensed payment partners (Paystack and Flutterwave). BOOKDECK never collects, processes, or stores your credit/debit card numbers, CVVs, or bank PINs.",
        },
        {
          heading: "Data Disclosures & Sub-Processors",
          body: "We share delivery information with logistics partners solely to ship your textbooks. We never sell, rent, or trade your personal information.",
        },
        {
          heading: "Your Data Protection Rights (NDPA §34–§39)",
          body: "You can download a machine-readable export of your personal records (DSAR) or permanently delete your account and personal profile at any time under Account -> Security.",
        },
      ]}
    />
  );
}

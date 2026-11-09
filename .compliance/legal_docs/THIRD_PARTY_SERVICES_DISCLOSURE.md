# THIRD-PARTY SERVICES & SUB-PROCESSOR DISCLOSURE
**Document Version:** 1.0  
**Effective Date:** 2026-11-09  
**Review Status:** DRAFT – SUBJECT TO NIGERIAN LEGAL REVIEW  

The following sub-processors and third-party infrastructure providers are engaged by BOOKDECK to deliver application functionality:

| Service Provider | Service Provided | Data Processed | Entity Location / Jurisdiction | Safeguards & Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Paystack Payments Limited** | Online Payment Gateway (Cards, Bank Transfer, USSD) | Email, Order Total Amount, Payment Reference | Lagos, Nigeria | CBN PSSP Licensed; PCI-DSS Level 1 Certified |
| **Flutterwave Inc.** | Alternative Payment Gateway | Email, Order Total Amount, Transaction Ref | Lagos, Nigeria / USA | CBN PSSP Licensed; PCI-DSS Level 1 Certified |
| **Cloudinary Inc.** | Media Storage & Content Delivery Network | Book Cover Images, Anatomical Diagrams, Profile Avatars | United States | SOC 2 Type II; ISO 27001; Encrypted Storage |
| **Resend Inc.** | Transactional Email Dispatch | Recipient Email Address, Order Confirmation Details | United States | TLS 1.3 in transit; SOC 2 Type II; GDPR Compliant |
| **Termii Inc.** | SMS Gateway for Verification OTPs | Phone Number, Verification Token | Lagos, Nigeria | NCC Licensed Telecom Aggregator; Encrypted SMS API |
| **Supabase Inc. / PostgreSQL** | Managed Cloud Database | Relational application records, hashed credentials | United States / AWS EU | SOC 2 Type II; Encrypted at Rest (AES-256) |


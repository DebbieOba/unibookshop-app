export interface NotificationPayload {
  title: string;
  body: string;
  type: 'ORDER_UPDATE' | 'APPROVAL' | 'BROADCAST' | 'NEW_ARRIVAL';
  /**
   * Overrides EmailChannel's type→template lookup — needed wherever one
   * `type` covers multiple outcomes (e.g. APPROVAL covers both approved and
   * rejected decisions, which need different email copy).
   */
  emailTemplateId?: import('../../../integrations/email/email.service').EmailTemplateId;
  /** Forwarded to FCM's data payload — lets the frontend deep-link on tap
   * (e.g. { orderId }) instead of just opening the notification feed. */
  data?: Record<string, string>;
}

export interface NotifyUser {
  id: string;
  email: string;
}

/** See backend-architecture.md §12 — each delivery channel implements this. */
export interface NotifyChannel {
  send(user: NotifyUser, notification: NotificationPayload): Promise<void>;
}

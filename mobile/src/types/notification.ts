export interface NotificationRecipient {
  id: string;
  readAt: string | null;
  createdAt: string;
  notification: {
    id: string;
    type: 'ORDER_UPDATE' | 'APPROVAL' | 'BROADCAST' | 'NEW_ARRIVAL';
    title: string;
    body: string;
  };
}

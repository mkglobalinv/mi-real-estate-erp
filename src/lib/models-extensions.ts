export interface ActivityLog {
  id: string;
  user: string;
  module: string;
  action: string;
  date: string;
  time: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  type: 'Alert' | 'Message' | 'System';
  isRead: boolean;
  createdAt: string;
}

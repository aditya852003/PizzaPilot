'use client';

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // The purpose of this page is to redirect to the main dashboard view.
  // The actual content will live in the nested routes like /admin/orders.
  redirect('/admin/orders');
}

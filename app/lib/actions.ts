'use-server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

//type validation and coercion
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

export async function createInvoice(formData: FormData) {
  const createInvoice = FormSchema.omit({ id: true, date: true });

  const { customerId, amount, status } = createInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  const date = new Date().toISOString().split('T')[0];

  //inserting the data into the database
  //creating an sql query to insert the new invoice into the database and pass in variables

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  //revalidating the cache, to load a fresh new invoice page as a result of this data update
  revalidatePath('/dashboard/invoices');
}

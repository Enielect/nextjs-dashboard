'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

//type validation and coercion

//form validation in conjunction with the useFormState hook
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: 'Please select a customer' }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a status',
  }),
  date: z.string(),
});

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};


// prevState - contains the state passed from the useFormState hook. You won't be using it in the action in this example, but it's a required prop.

export async function createInvoice(prevState: State, formData: FormData) {
  const CreateInvoice = FormSchema.omit({ id: true, date: true });

  // const { customerId, amount, status } = createInvoice.parse({


  // safeParse() will return an object containing either a success or error field. This will help handle validation more gracefully without having put this logic inside the try/catch block.

    const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  
  //if form validation fails, return errors early. Otherwise, continue
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  //prepare data for insertion into database
  const {customerId, amount, status} = validatedFields.data;

  const amountInCents = amount * 100;

  const date = new Date().toISOString().split('T')[0];

  //inserting the data into the database
  //creating an sql query to insert the new invoice into the database and pass in variables
  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Unable to create invoice. Please try again.',
    };
  }
  //revalidating the cache, to load a fresh new invoice page as a result of this data update
  // Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.
  revalidatePath('/dashboard/invoices');

  //redirecting the user to the invoice page
  redirect('/dashboard/invoices');
}

//redirect work by throwing an error which would be caught by the catch block, so we don't call it inside the try block

const UpdateInvoice = FormSchema.omit({ id: true, data: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: 'Database Error: Unable to update invoice. Please try again.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

//deleting an invoice
export async function deleteInvoice(id: string) {
  throw new Error('Failed to delete invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    return {
      message: 'Database Error: Unable to delete invoice. Please try again.',
    };
  }
}

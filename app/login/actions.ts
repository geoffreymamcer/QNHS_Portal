'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect(`/login?message=Could not authenticate user: ${error.message}`);
    }

    // Check if user exists in the admins table
    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('id', data.user.id)
        .single();

    if (adminError || !admin) {
        // If not an admin, sign them out immediately
        await supabase.auth.signOut();
        return redirect('/login?message=Access denied: Administrative Officer only.');
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

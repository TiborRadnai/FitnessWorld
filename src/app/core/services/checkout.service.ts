import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {

  async createSession(items: any[]) {
    const url = 'https://wupfmqlscwlecfvmaspu.supabase.co/functions/v1/checkout';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': environment.supabaseAnonKey,
        'Authorization': `Bearer ${environment.supabaseAnonKey}`
      },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      console.error('Checkout failed:', await response.text());
      throw new Error('Checkout failed');
    }

    const data = await response.json();

    window.location.href = data.url;
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, RouterLink],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private api = inject(ApiService);

  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');

  submitting = signal(false);
  success = signal('');
  error = signal('');

  sendMessage() {
    this.success.set('');
    this.error.set('');

    const payload = {
      name: this.name().trim(),
      email: this.email().trim(),
      subject: this.subject().trim(),
      message: this.message().trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      this.error.set('Please fill in all fields.');
      return;
    }

    this.submitting.set(true);
    this.api.sendContactMessage(payload).subscribe({
      next: (res) => {
        this.success.set(res?.message || 'Your message was sent successfully.');
        this.name.set('');
        this.email.set('');
        this.subject.set('');
        this.message.set('');
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.error?.errors?.[0]?.msg || 'Failed to send message.');
        this.submitting.set(false);
      },
    });
  }
}

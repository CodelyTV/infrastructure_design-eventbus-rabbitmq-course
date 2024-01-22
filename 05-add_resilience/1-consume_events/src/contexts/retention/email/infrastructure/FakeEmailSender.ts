import { Service } from "diod";

import { Email } from "../domain/Email";
import { EmailSender } from "../domain/EmailSender";

@Service()
export class FakeEmailSender extends EmailSender {
	async send<T extends Email>(email: T): Promise<void> {
		// eslint-disable-next-line no-console
		console.log(`Sending email: ${JSON.stringify(email)}`);

		return Promise.resolve();
	}
}

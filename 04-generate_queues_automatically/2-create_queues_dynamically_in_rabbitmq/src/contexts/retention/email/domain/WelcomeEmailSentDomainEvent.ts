import { DomainEvent } from "../../../shared/domain/event/DomainEvent";

export class WelcomeEmailSentDomainEvent extends DomainEvent {
	static eventName = "codely.retention.welcome_email.sent";

	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly userName: string,
		public readonly fromEmailAddress: string,
		public readonly toEmailAddress: string,
		public readonly emailBody: string,
		eventId?: string,
		occurredOn?: Date,
	) {
		super(WelcomeEmailSentDomainEvent.eventName, id, eventId, occurredOn);
	}

	toPrimitives(): { [key: string]: unknown } {
		return {
			id: this.id,
			userId: this.userId,
			userName: this.userName,
			fromEmailAddress: this.fromEmailAddress,
			toEmailAddress: this.toEmailAddress,
			emailBody: this.emailBody,
		};
	}
}

import { UserDomainEvent } from "./UserDomainEvent";

export class UserArchivedDomainEvent extends UserDomainEvent {
	static eventName = "codely.shop.user.archived";

	constructor(
		public readonly id: string,
		eventId?: string,
		occurredOn?: Date,
	) {
		super(id, eventId, occurredOn);
	}

	toPrimitives(): { [key: string]: unknown } {
		return {
			id: this.id,
		};
	}
}

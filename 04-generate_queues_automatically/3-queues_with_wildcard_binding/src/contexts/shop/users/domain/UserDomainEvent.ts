import { DomainEvent } from "../../../shared/domain/event/DomainEvent";

export class UserDomainEvent extends DomainEvent {
	static eventName = "codely.shop.user.*";

	constructor(
		public readonly id: string,
		eventId?: string,
		occurredOn?: Date,
	) {
		super(UserDomainEvent.eventName, id, eventId, occurredOn);
	}

	toPrimitives(): { [key: string]: unknown } {
		return {
			id: this.id,
		};
	}
}

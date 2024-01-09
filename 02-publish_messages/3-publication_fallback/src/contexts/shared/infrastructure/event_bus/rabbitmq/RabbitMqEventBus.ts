import { DomainEvent } from "../../../domain/event/DomainEvent";
import { EventBus } from "../../../domain/event/EventBus";
import { DomainEventJsonSerializer } from "../DomainEventJsonSerializer";
import { DomainEventFailover } from "../failover/DomainEventFailover";
import { RabbitMqConnection } from "./RabbitMqConnection";

export class RabbitMqEventBus implements EventBus {
	constructor(
		private readonly connection: RabbitMqConnection,
		private readonly failover: DomainEventFailover,
	) {}

	async publish(events: DomainEvent[]): Promise<void> {
		const promises = events.map(async (event) => {
			const routingKey = event.eventName;
			const serializedEvent = DomainEventJsonSerializer.serialize(event);

			try {
				await this.connection.publish("domain_events", routingKey, Buffer.from(serializedEvent), {
					messageId: event.eventId,
					contentType: "application/json",
					contentEncoding: "utf-8",
				});

				return;
			} catch (error: unknown) {
				return this.failover.publish(serializedEvent);
			}
		});

		await Promise.all(promises);
	}
}

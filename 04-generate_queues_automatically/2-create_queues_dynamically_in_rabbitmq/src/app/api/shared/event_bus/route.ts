import { DomainEventFailover } from "../../../../contexts/shared/infrastructure/event_bus/failover/DomainEventFailover";
import { RabbitMqConnection } from "../../../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqConnection";
import { RabbitMqEventBus } from "../../../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqEventBus";
import { MariaDBConnection } from "../../../../contexts/shared/infrastructure/MariaDBConnection";

export async function POST(): Promise<Response> {
	const eventBus = new RabbitMqEventBus(
		new RabbitMqConnection(),
		new DomainEventFailover(new MariaDBConnection()),
	);

	await eventBus.publishFromFailover();

	return new Response("", { status: 201 });
}

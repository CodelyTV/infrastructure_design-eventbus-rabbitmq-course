import "reflect-metadata";

import { DomainEvent } from "../../contexts/shared/domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../contexts/shared/domain/event/DomainEventSubscriber";
import { container } from "../../contexts/shared/infrastructure/dependency_injection/diod.config";
import {
	deadLetterExchange,
	deadLetterSuffix,
	exchangeName,
	RabbitMqConnection,
	retryExchange,
	retrySuffix,
} from "../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqConnection";

const connection = new RabbitMqConnection();

const subscribers = container
	.findTaggedServiceIdentifiers<DomainEventSubscriber<DomainEvent>>("subscriber")
	.map((id) => container.get(id));

type Queue = {
	name: string;
	bindingKeys: string[];
};
const queues: Queue[] = subscribers.map((subscriber) => ({
	name: subscriber.name(),
	bindingKeys: subscriber.subscribedTo().map((event) => event.eventName),
}));

async function main(): Promise<void> {
	await connection.connect();

	await connection.declareExchange(exchangeName);
	await connection.declareExchange(retryExchange);
	await connection.declareExchange(deadLetterExchange);

	await Promise.all(queues.map((queue) => declareQueue(connection, queue)));

	await connection.close();
}

async function declareQueue(connection: RabbitMqConnection, queue: Queue): Promise<void> {
	await connection.declareQueue(queue.name, exchangeName, [...queue.bindingKeys, queue.name]);

	const retryQueueName = `${queue.name}${retrySuffix}`;
	await connection.declareQueue(
		retryQueueName,
		retryExchange,
		[queue.name],
		exchangeName,
		queue.name,
		3000,
	);

	const deadLetterQueueName = `${queue.name}${deadLetterSuffix}`;
	await connection.declareQueue(deadLetterQueueName, deadLetterExchange, [queue.name]);
}

main().catch(console.error);

import "reflect-metadata";

import { ConsumeMessage } from "amqplib";

import { DomainEvent } from "../../contexts/shared/domain/event/DomainEvent";
import { DomainEventClass } from "../../contexts/shared/domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../contexts/shared/domain/event/DomainEventSubscriber";
import { container } from "../../contexts/shared/infrastructure/dependency_injection/diod.config";
import { DomainEventJsonDeserializer } from "../../contexts/shared/infrastructure/event_bus/DomainEventJsonDeserializer";
import { RabbitMqConnection } from "../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqConnection";

const connection = new RabbitMqConnection();

const subscribers = container
	.findTaggedServiceIdentifiers<DomainEventSubscriber<DomainEvent>>("subscriber")
	.map((id) => container.get(id));

const eventMapping = new Map<string, DomainEventClass>();

subscribers.forEach((subscriber) => {
	subscriber.subscribedTo().forEach((eventClass) => {
		eventMapping.set(eventClass.eventName, eventClass);
	});
});

const deserializer = new DomainEventJsonDeserializer(eventMapping);

async function main(): Promise<void> {
	await connection.connect();

	await Promise.all(
		subscribers.map((subscriber) => connection.consume(subscriber.name(), consume(subscriber))),
	);
}

function consume(subscriber: DomainEventSubscriber<DomainEvent>) {
	return async function (message: ConsumeMessage): Promise<void> {
		const content = message.content.toString();
		const domainEvent = deserializer.deserialize(content);

		await subscriber.on(domainEvent);
		await connection.ack(message);
	};
}

main().catch(console.error);

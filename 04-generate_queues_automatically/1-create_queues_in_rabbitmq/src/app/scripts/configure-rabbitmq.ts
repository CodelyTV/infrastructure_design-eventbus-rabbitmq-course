import { RabbitMqConnection } from "../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqConnection";

const connection = new RabbitMqConnection();

const exchangeName = "domain_events";

const queues: {
	name: string;
	bindingKeys: string[];
}[] = [
	{
		name: "codely.retention.send_welcome_email_on_user_registered",
		bindingKeys: ["codely.shop.user.registered"],
	},
	{
		name: "codely.retention.update_last_activity_date_on_user_updated",
		bindingKeys: ["codely.shop.user.*"],
	},
];

async function main(): Promise<void> {
	await connection.connect();

	await connection.declareExchange(exchangeName);

	await Promise.all(
		queues.map((queue) => connection.declareQueue(queue.name, exchangeName, queue.bindingKeys)),
	);

	await connection.close();
}

main().catch(console.error);

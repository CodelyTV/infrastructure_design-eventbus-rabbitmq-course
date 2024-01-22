import { RabbitMqConnection } from "../../contexts/shared/infrastructure/event_bus/rabbitmq/RabbitMqConnection";

const connection = new RabbitMqConnection();

const exchangeName = "domain_events";
const queueName = "codely.retention.send_welcome_email_on_user_registered";
const bindingKey = "codely.shop.user.registered";

async function main(): Promise<void> {
	await connection.connect();

	await connection.declareExchange(exchangeName);

	await connection.declareQueue(queueName, exchangeName, bindingKey);

	await connection.close();
}

main().catch(console.error);

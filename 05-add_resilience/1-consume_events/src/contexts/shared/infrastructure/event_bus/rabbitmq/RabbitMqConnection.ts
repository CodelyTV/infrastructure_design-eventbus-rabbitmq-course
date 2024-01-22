import amqplib, { ConsumeMessage } from "amqplib";
import { Service } from "diod";

export type Settings = {
	username: string;
	password: string;
	vhost: string;
	connection: {
		hostname: string;
		port: number;
	};
};

@Service()
export class RabbitMqConnection {
	private amqpConnection?: amqplib.Connection;
	private amqpChannel?: amqplib.ConfirmChannel;
	private readonly settings: Settings = {
		username: "codely",
		password: "codely",
		vhost: "/",
		connection: {
			hostname: "localhost",
			port: 5672,
		},
	};

	async connect(): Promise<void> {
		this.amqpConnection = await this.amqpConnect();
		this.amqpChannel = await this.amqpChannelConnect();
	}

	async close(): Promise<void> {
		await this.channel().close();

		await this.connection().close();
	}

	async publish(
		exchange: string,
		routingKey: string,
		content: Buffer,
		options: {
			messageId: string;
			contentType: string;
			contentEncoding: string;
			priority?: number;
			headers?: unknown;
		},
	): Promise<void> {
		return new Promise((resolve: Function, reject: Function) => {
			this.channel().publish(exchange, routingKey, content, options, (error: unknown) =>
				error ? reject(error) : resolve(),
			);
		});
	}

	async consume(queue: string, subscriber: (message: ConsumeMessage) => {}): Promise<void> {
		await this.channel().consume(queue, (message: ConsumeMessage | null) => {
			if (message) {
				subscriber(message);
			}
		});
	}

	async ack(message: ConsumeMessage): Promise<void> {
		this.channel().ack(message);
	}

	async declareQueue(name: string, exchangeName: string, bindingKeys: string[]): Promise<void> {
		await this.channel().assertQueue(name, {
			exclusive: false,
			durable: true,
			autoDelete: false,
		});

		await Promise.all(
			bindingKeys.map((bindingKey) => this.channel().bindQueue(name, exchangeName, bindingKey)),
		);
	}

	async declareExchange(exchangeName: string): Promise<void> {
		await this.channel().assertExchange(exchangeName, "topic", { durable: true });
	}

	private connection(): amqplib.Connection {
		if (!this.amqpConnection) {
			throw new Error("RabbitMQ not connected");
		}

		return this.amqpConnection;
	}

	private channel(): amqplib.ConfirmChannel {
		if (!this.amqpChannel) {
			throw new Error("RabbitMQ channel not connected");
		}

		return this.amqpChannel;
	}

	private async amqpConnect(): Promise<amqplib.Connection> {
		const connection = await amqplib.connect({
			protocol: "amqp",
			hostname: this.settings.connection.hostname,
			port: this.settings.connection.port,
			username: this.settings.username,
			password: this.settings.password,
			vhost: this.settings.vhost,
		});

		connection.on("error", (error: unknown) => {
			throw error;
		});

		return connection;
	}

	private async amqpChannelConnect(): Promise<amqplib.ConfirmChannel> {
		const channel = await this.connection().createConfirmChannel();
		await channel.prefetch(1);

		return channel;
	}
}

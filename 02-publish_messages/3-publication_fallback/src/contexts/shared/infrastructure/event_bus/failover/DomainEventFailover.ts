import { MariaDBConnection } from "../../MariaDBConnection";

type DatabaseEvent = {
	body: string;
};

export class DomainEventFailover {
	constructor(private readonly connection: MariaDBConnection) {}

	async publish(serializedEvent: string): Promise<void> {
		const query = `INSERT INTO shared__failover_domain_events (body) VALUES ('${serializedEvent}')`;

		await this.connection.execute(query);
	}

	async consume(total: number): Promise<string[]> {
		const query = `SELECT body FROM shared__failover_domain_events LIMIT ${total}`;
		const result = await this.connection.searchAll<DatabaseEvent>(query);

		await this.connection.execute(`DELETE FROM shared__failover_domain_events LIMIT ${total}`);

		return result.map((event) => event.body);
	}
}

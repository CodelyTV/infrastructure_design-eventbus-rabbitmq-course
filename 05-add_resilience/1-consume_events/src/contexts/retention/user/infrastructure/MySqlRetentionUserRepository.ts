import { Service } from "diod";

import { MariaDBConnection } from "../../../shared/infrastructure/MariaDBConnection";
import { UserId } from "../../../shop/users/domain/UserId";
import { RetentionUser } from "../domain/RetentionUser";
import { RetentionUserRepository } from "../domain/RetentionUserRepository";

type DatabaseUser = {
	id: string;
	lastActivityDate: Date;
};

@Service()
export class MySqlRetentionUserRepository extends RetentionUserRepository {
	constructor(private readonly connection: MariaDBConnection) {
		super();
	}

	async save(user: RetentionUser): Promise<void> {
		const userPrimitives = user.toPrimitives();
		const date = `${userPrimitives.lastActivityDate.toISOString().split("T")[0]} ${
			userPrimitives.lastActivityDate.toISOString().split("T")[1].split(".")[0]
		}`;

		const query = `
			INSERT INTO retention__users (id, last_activity_date)
			VALUES ('${userPrimitives.id}', '${date}');`;

		await this.connection.execute(query);
	}

	async search(id: UserId): Promise<RetentionUser | null> {
		const query = `SELECT id, last_activity_date FROM retention__users WHERE id = '${id.value}';`;

		const result = await this.connection.searchOne<DatabaseUser>(query);

		if (!result) {
			return null;
		}

		return RetentionUser.fromPrimitives({
			id: result.id,
			lastActivityDate: result.lastActivityDate,
		});
	}
}

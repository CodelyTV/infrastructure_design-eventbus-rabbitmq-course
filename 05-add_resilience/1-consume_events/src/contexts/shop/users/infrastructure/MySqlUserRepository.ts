import { MariaDBConnection } from "../../../shared/infrastructure/MariaDBConnection";
import { User } from "../domain/User";
import { UserId } from "../domain/UserId";
import { UserRepository } from "../domain/UserRepository";

type DatabaseUser = {
	id: string;
	name: string;
	email: string;
	profile_picture: string;
	status: string;
};

export class MySqlUserRepository implements UserRepository {
	constructor(private readonly connection: MariaDBConnection) {}

	async save(user: User): Promise<void> {
		const userPrimitives = user.toPrimitives();

		const query = `
			INSERT INTO shop__users (id, name, email, profile_picture, status)
			VALUES (
				'${userPrimitives.id}',
				'${userPrimitives.name}',
				'${userPrimitives.email}',
				'${userPrimitives.profilePicture}',
				'${userPrimitives.status.valueOf()}'
			);`;

		await this.connection.execute(query);
	}

	async search(id: UserId): Promise<User | null> {
		const query = `SELECT id, name, email, profile_picture FROM shop__users WHERE id = '${id.value}';`;

		const result = await this.connection.searchOne<DatabaseUser>(query);

		if (!result) {
			return null;
		}

		return User.fromPrimitives({
			id: result.id,
			name: result.name,
			email: result.email,
			profilePicture: result.profile_picture,
			status: result.status,
		});
	}
}
import { Service } from "diod";

import { UserId } from "../../../../shop/users/domain/UserId";
import { RetentionUser } from "../../domain/RetentionUser";
import { RetentionUserRepository } from "../../domain/RetentionUserRepository";

@Service()
export class UserLastActivityUpdater {
	constructor(private readonly repository: RetentionUserRepository) {}

	async update(id: string, occurredOn: Date): Promise<void> {
		const user =
			(await this.repository.search(new UserId(id))) ?? RetentionUser.create(id, occurredOn);

		if (user.lastActivityDateIsOlderThan(occurredOn)) {
			user.updateLastActivityDate(occurredOn);

			await this.repository.save(user);
		}
	}
}

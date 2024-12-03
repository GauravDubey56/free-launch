import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Project } from "./Project";
import { ProjectRepository } from "./ProjectRepository";
import { randomUUID } from "crypto";
@Entity("users", { schema: "public" })
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ name: "first_name", type: "varchar" })
  firstName: string;
  @Column({ name: "last_name", type: "varchar", nullable: true })
  lastName?: string;
  @Column({ name: "email", type: "varchar", nullable: true })
  email: string;
  @Column({ name: "github_id", type: "varchar", nullable: true })
  githubId: string;
  @Column({ name: "github_access_token", type: "varchar", nullable: true })
  githubAccessToken: string;
  @Column({ name: "github_refresh_token", type: "varchar", nullable: true })
  githubRefreshToken: string;
  @Column({ name: "owner_id", type: "uuid", default: randomUUID() })
  ownerId: string;
  @Column({ name: "client_info", type: "json" })
  clientInfo?: clientInfo;
  @OneToMany(() => Project, (Project: Project) => Project.user)
  apps: Project[];
  @OneToMany(() => ProjectRepository, (projectRepository: ProjectRepository) => projectRepository.user)
  projectRepository: ProjectRepository[];
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt: string;
  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt: string;

  getFullname() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ""}`;
  }
  getClient(): clientTokenData {
    const fullName = this.getFullname();
    return {
      name: fullName,
      email: this.email,
      clientId: this.id,
      githubUsername: this?.clientInfo?.githubUsername,
    };
  }
}

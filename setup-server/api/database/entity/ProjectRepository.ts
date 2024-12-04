import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
@Entity("project_repository", { schema: "public" })
export class ProjectRepository {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ name: "userId", type: "integer", nullable: true })
  userId: number;
  @Column({ name: "repository_id", type: "varchar" })
  repositoryId: string;
  @Column({ name: "repository_name", type: "varchar" })
  repositoryName: string;
  @Column({ name: "default_branch", type: "varchar", nullable: true })
  defaultBranch: string;
  @Column({ name: "content_url", type: "varchar", nullable: true })
  contentUrl: string;
  @ManyToOne(() => User, (client: User) => client.projectRepository)
  user: User;
  @Column({ name: "extra_info", type: "json", nullable: true })
  extraInfo?: clientInfo;
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt: string;
  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt: string;
}

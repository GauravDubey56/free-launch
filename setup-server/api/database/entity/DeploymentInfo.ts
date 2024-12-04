import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { ProjectRepository } from "./ProjectRepository";
export type DeploymentJobStatus = "pending" | "in_progress" | "completed" | "failed";
@Entity("deployment_info", { schema: "public" })
export class DeploymentInfo {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "project_repository_id", type: "integer" })
  projectRepositoryId: number;

  @Column({ name: "deployment_status", type: "varchar", length: 50 })
  deploymentStatus: DeploymentJobStatus;

  @Column({ name: "initiated_at", type: "timestamp" })
  initiatedAt: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ name: "service_details", type: "jsonb", nullable: true })
  serviceDetails?: object;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp with time zone",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp with time zone",
  })
  updatedAt: Date;
}

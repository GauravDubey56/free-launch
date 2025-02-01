import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
@Entity("projects", { schema: "public" })
export class Project {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ name: "name", type: "varchar" })
  name: string;
  @ManyToOne(() => User, (client: User) => client.apps)
  user: User;
  @Column({name: "userId", type: "integer"})
  userId: number;
  @Column({ name: "app_id", type: "varchar", unique: true })
  appId: string;
  @Column({ name: "access_key", type: "varchar" })
  accessKey: string;
  @Column({ name: "salt", type: "varchar" })
  salt: string;
  @Column({ name: "hash", type: "varchar" })
  hash: string;
  @Column({ name: "app_info", type: "json" })
  appInfo?: clientInfo;
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt: string;
  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt: string;
}

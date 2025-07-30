import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserStatus {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
  Deleted = 'Deleted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'json', default: 'User' })
  roles: string[];

  @Column({ type: 'text', nullable: true })
  status: UserStatus | null;
}

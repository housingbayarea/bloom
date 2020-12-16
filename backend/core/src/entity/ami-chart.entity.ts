import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Expose, Type } from "class-transformer"
import { IsDate, IsDefined, IsString, IsUUID, ValidateNested } from "class-validator"
import { AmiChartItem } from "./ami-chart-item.entity"
import { Unit } from "./unit.entity"
import { ValidationsGroupsEnum } from "../shared/validations-groups.enum"

@Entity()
export class AmiChart {
  @PrimaryGeneratedColumn("uuid")
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsUUID(4, { groups: [ValidationsGroupsEnum.default] })
  id: string

  @CreateDateColumn()
  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  createdAt: Date

  @UpdateDateColumn()
  @Expose()
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  updatedAt: Date

  @OneToMany(() => AmiChartItem, (amiChartItem) => amiChartItem.amiChart, {
    eager: true,
    cascade: true,
  })
  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => AmiChartItem)
  items: AmiChartItem[]

  @OneToMany(() => Unit, (unit) => unit.amiChart)
  units: Unit[]

  @Column()
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  name: string
}

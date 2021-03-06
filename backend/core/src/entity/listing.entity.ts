import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Unit, UnitsSummarized } from "./unit.entity"
import { Application } from "./application.entity"
import { Asset } from "./asset.entity"
import { ApplicationMethod } from "./application-method.entity"
import { Address } from "../shared/dto/address.dto"
import { WhatToExpect } from "../shared/dto/whatToExpect.dto"
import { Preference } from "./preference.entity"
import { Expose, Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator"
import { ListingEvent } from "./listing-event.entity"
import { transformUnits } from "../lib/unit_transformations"
import { amiCharts } from "../lib/ami_charts"
import { listingUrlSlug } from "../lib/url_helper"
import { ApiProperty } from "@nestjs/swagger"

export enum ListingStatus {
  active = "active",
  pending = "pending",
}

export class AmiChartItem {
  @Expose()
  @IsDefined()
  @IsString()
  percentOfAmi: number

  @Expose()
  @IsDefined()
  @IsString()
  householdSize: number

  @Expose()
  @IsDefined()
  @IsString()
  income: number
}

@Entity({ name: "listings" })
class Listing extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Expose()
  @IsString()
  @IsUUID()
  id: string

  @CreateDateColumn()
  @Expose()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date

  @OneToMany(() => Preference, (preference) => preference.listing)
  preferences: Preference[]

  @OneToMany(() => Unit, (unit) => unit.listing, { eager: true })
  units: Unit[]

  @OneToMany(() => ApplicationMethod, (applicationMethod) => applicationMethod.listing)
  applicationMethods: ApplicationMethod[]

  @OneToMany(() => Asset, (asset) => asset.listing)
  assets: Asset[]

  @OneToMany(() => ListingEvent, (listingEvent) => listingEvent.listing)
  events: ListingEvent[]

  @OneToMany(() => Application, (application) => application.listing)
  applications: Application[]

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  accessibility: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  amenities: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  applicationDueDate: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  applicationOpenDate: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  applicationFee: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  applicationOrganization: string | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  applicationAddress: Address | null

  @Column({ type: "boolean", nullable: true })
  @Expose()
  @IsOptional()
  @IsBoolean()
  blankPaperApplicationCanBePickedUp: boolean | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  applicationPickUpAddress: Address | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  applicationPickUpAddressOfficeHours: string | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  buildingAddress: Address | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  buildingTotalUnits: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  buildingSelectionCriteria: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  costsNotIncluded: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  creditHistory: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  criminalBackground: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  depositMin: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  depositMax: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  developer: string | null

  @Column({ type: "boolean", nullable: true })
  @Expose()
  @IsOptional()
  @IsBoolean()
  disableUnitsAccordion: boolean | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  householdSizeMax: number | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  householdSizeMin: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  imageUrl: string | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  leasingAgentAddress: Address | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsEmail()
  leasingAgentEmail: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  leasingAgentName: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  leasingAgentOfficeHours: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  leasingAgentPhone: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  leasingAgentTitle: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  name: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  neighborhood: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  petPolicy: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsDateString()
  postmarkedApplicationsReceivedByDate: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  programRules: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  rentalAssistance: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  rentalHistory: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  requiredDocuments: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  smokingPolicy: string | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  unitsAvailable: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  unitAmenities: string | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  waitlistCurrentSize: number | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  waitlistMaxSize: number | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatToExpect)
  whatToExpect: WhatToExpect | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  yearBuilt: number | null

  @Column({
    type: "enum",
    enum: ListingStatus,
    default: ListingStatus.pending,
  })
  @Expose()
  @IsEnum(ListingStatus)
  @ApiProperty({ enum: ListingStatus, enumName: "ListingStatus" })
  status: ListingStatus

  @Expose()
  @ApiProperty()
  get unitsSummarized(): UnitsSummarized | undefined {
    if (Array.isArray(this.units) && this.units.length > 0) {
      return transformUnits(this.units, amiCharts)
    }
  }

  @Expose()
  @ApiProperty()
  get urlSlug(): string | undefined {
    return listingUrlSlug(this)
  }

  @Expose()
  applicationConfig?: Record<string, unknown>
}

export { Listing as default, Listing }

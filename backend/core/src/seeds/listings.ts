import { Listing, ListingStatus } from "../entity/listing.entity"
import { ListingCreateDto } from "../listings/listing.dto"
import { UnitCreateDto } from "../units/unit.dto"
import { ApplicationMethodCreateDto } from "../application-methods/application-method.dto"
import { ApplicationMethodType } from "../entity/application-method.entity"
import { PropertyCreateDto } from "../property/property.dto"
import { AssetCreateDto } from "../assets/asset.dto"
import { PreferenceCreateDto } from "../preferences/preference.dto"
import { BaseEntity, Repository } from "typeorm"
import { ListingEventCreateDto } from "../listing-events/listing-events.dto"
import { ListingEventType } from "../entity/listing-event.entity"
import { Property } from "../entity/property.entity"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Unit } from "../.."
import { INestApplicationContext } from "@nestjs/common"
import { AmiChartCreateDto } from "../ami-charts/ami-chart.dto"
import { AmiChart } from "../entity/ami-chart.entity"
import { SanMateoHUD2019 } from "./ami-charts"

// Properties that are ommited in DTOS derived types are relations and getters
export interface ListingSeed {
  amiChart: AmiChartCreateDto
  units: Array<Omit<UnitCreateDto, "property">>
  applicationMethods: Array<Omit<ApplicationMethodCreateDto, "listing">>
  property: Omit<PropertyCreateDto, "propertyGroups" | "listings" | "units" | "unitsSummarized">
  preferences: Array<Omit<PreferenceCreateDto, "listing">>
  listingEvents: Array<Omit<ListingEventCreateDto, "listing">>
  assets: Array<Omit<AssetCreateDto, "listing">>
  listing: Omit<
    ListingCreateDto,
    | keyof BaseEntity
    | "property"
    | "urlSlug"
    | "applicationMethods"
    | "events"
    | "assets"
    | "preferences"
  >
}

export async function seedListing(app: INestApplicationContext, seed: ListingSeed) {
  const amiChartRepo = app.get<Repository<AmiChart>>(getRepositoryToken(AmiChart))
  const propertyRepo = app.get<Repository<Property>>(getRepositoryToken(Property))
  const unitsRepo = app.get<Repository<Unit>>(getRepositoryToken(Unit))
  const listingsRepo = app.get<Repository<Unit>>(getRepositoryToken(Listing))

  const amiChart = await amiChartRepo.save(seed.amiChart)

  const property = await propertyRepo.save({
    ...seed.property,
  })

  const unitsToBeCreated: Array<Omit<UnitCreateDto, keyof BaseEntity>> = seed.units.map((unit) => {
    return {
      ...unit,
      property: {
        id: property.id,
      },
      amiChart,
    }
  })
  await unitsRepo.save(unitsToBeCreated)

  const listingCreateDto: Omit<ListingCreateDto, keyof BaseEntity | "urlSlug"> = {
    ...seed.listing,
    property: {
      id: property.id,
    },
    assets: seed.assets,
    preferences: seed.preferences,
    applicationMethods: seed.applicationMethods,
    events: seed.listingEvents,
  }
  await listingsRepo.save(listingCreateDto)
}

export const listingSeed1: ListingSeed = {
  units: [
    {
      amiPercentage: "80.0",
      annualIncomeMin: "58152.0",
      monthlyIncomeMin: "4858.0",
      floor: null,
      annualIncomeMax: "103350.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "2429.0",
      numBathrooms: 1,
      numBedrooms: null,
      number: "265",
      priorityType: null,
      reservedType: null,
      sqFeet: "750",
      status: "available",
      unitType: "oneBdrm",
      monthlyRentAsPercentOfIncome: null,
      amiChart: null,
    },
    {
      amiPercentage: "80.0",
      annualIncomeMin: "85368.0",
      monthlyIncomeMin: "5992.0",
      floor: null,
      annualIncomeMax: "160150.0",
      maxOccupancy: 7,
      minOccupancy: 5,
      monthlyRent: "2996.0",
      numBathrooms: 1,
      numBedrooms: null,
      number: "448",
      priorityType: null,
      reservedType: null,

      sqFeet: "1304",
      status: "available",
      unitType: "threeBdrm",
      monthlyRentAsPercentOfIncome: null,
      amiChart: null,
    },
  ],
  applicationMethods: [
    {
      type: ApplicationMethodType.POBox,
      acceptsPostmarkedApplications: false,
      label: "Label",
      externalReference: "",
    },
    {
      type: ApplicationMethodType.PaperPickup,
      acceptsPostmarkedApplications: false,
      label: "Label",
      externalReference: "",
    },
    {
      type: ApplicationMethodType.Internal,
      acceptsPostmarkedApplications: false,
      label: "Label",
      externalReference: "",
    },
  ],
  property: {
    amenities: "Gym, Clubhouse, Business Lounge, View Lounge, Pool, Spa",
    accessibility:
      "Accessibility features in common areas like lobby – wheelchair ramps, wheelchair accessible bathrooms and elevators.",
    buildingAddress: {
      city: "Foster City",
      street: "55 Triton Park Lane",
      zipCode: "94404",
      state: "CA",
      latitude: 37.55695,
      longitude: -122.27521,
    },
    developer: "Thompson Dorfman, LLC",
    neighborhood: "Foster City",
    petPolicy:
      "Pets allowed except the following; pit bull, malamute, akita, rottweiler, doberman, staffordshire terrier, presa canario, chowchow, american bull dog, karelian bear dog, st bernard, german shepherd, husky, great dane, any hybrid or mixed breed of the aforementioned breeds. 50 pound weight limit. 2 pets per household limit. $500 pet deposit per pet. $60 pet rent per pet.",
    smokingPolicy: "Non-Smoking",
    yearBuilt: 2018,
    unitAmenities: "Washer and dryer, AC and Heater, Gas Stove",
    buildingTotalUnits: 48,
    unitsAvailable: 2,
    // TODO Added arbitrarily, not existent in seeds:
    householdSizeMin: 2,
    householdSizeMax: 2,
  },
  preferences: [
    {
      description: "Description",
      links: [
        {
          title: "Link title",
          url: "",
        },
      ],
      ordinal: 1,
      subtitle: "Subtitle",
      title: "Title",
    },
  ],
  listingEvents: [
    {
      startTime: new Date("2020-12-12T20:00:00.000Z"),
      endTime: new Date("2020-12-12T20:00:00.000Z"),
      note: "Note",
      type: ListingEventType.openHouse,
      url: "",
    },
    {
      startTime: new Date("2020-12-12T20:00:00.000Z"),
      endTime: new Date("2020-12-12T20:00:00.000Z"),
      note: "Note",
      type: ListingEventType.publicLottery,
      url: "",
    },
  ],
  assets: [
    {
      // TODO
      label: "building",
      fileId:
        "https://regional-dahlia-staging.s3-us-west-1.amazonaws.com/listings/triton/thetriton.png",
    },
  ],
  listing: {
    applicationOpenDate: new Date("2020-10-12T20:00:00.000Z"),
    applicationPickUpAddress: {
      city: "San Jose",
      street: "98 Archer Street",
      zipCode: "95112",
      state: "CA",
      latitude: 37.36537,
      longitude: -121.91071,
    },
    applicationPickUpAddressOfficeHours: "10AM to 12AM",
    postmarkedApplicationsReceivedByDate: new Date("2021-12-10T20:00:00.000Z"),
    disableUnitsAccordion: false,
    rentalAssistance: "",

    whatToExpect: {
      applicantsWillBeContacted: "Applicant will be contacted",
      allInfoWillBeVerified: "All info will be verified",
      bePreparedIfChosen: "Be Prepared if chosen",
    },
    applicationAddress: {
      city: "Foster City",
      street: "55 Triton Park Lane",
      zipCode: "94404",
      state: "CA",
      latitude: 37.55695,
      longitude: -122.27521,
    },
    applicationDueDate: new Date("2037-12-19T17:00:00.000-07:00"),
    applicationOrganization: "Triton",
    // TODO confirm not used anywhere
    // applicationPhone: "(650) 437-2039",
    buildingSelectionCriteria:
      "https://regional-dahlia-staging.s3-us-west-1.amazonaws.com/listings/triton/The_Triton_BMRRentalInformation.pdf",
    costsNotIncluded:
      "Residents responsible for PG&E, Internet, Utilities - water, sewer, trash, admin fee. Pet Deposit is $500 with a $60 monthly pet rent. Residents required to maintain a renter's insurance policy as outlined in the lease agreement. Rent is due by the 3rd of each month. Late fee is $50.00. Resident to pay $25 for each returned check or rejected electronic payment. For additional returned checks, resident will pay a charge of $50.00.",
    creditHistory:
      "No collections, no bankruptcy, income is twice monthly rent.<br/>A credit report will be completed on all applicants to verify credit ratings. Income plus verified credit history will be entered into a credit scoring model to determine rental eligibility and security deposit levels. All decisions for residency are based on a system which considers credit history, rent history, income qualifications, and employment history. An approved decision based on the system does not automatically constittute an approval of residency. Applicant(s) and occupant(s) aged 18 years or older MUST also pass the criminal background check based on the criteria contained herein to be approved for residency. <br/>Credit recommendations other than an accept decision, will require a rental verification. Applications for residency will automatically be denied for the following reasons:<br/>a. An outstanding debt to a previous landlord or an outstanding NSF check must be paid in full<br/>b. An unsatisfied breach of a prior lease or a prior eviction of any applicant or occupant<br/>c. More than four (4) late pays and two (2) NSF's in the last twenty-four (24) months ",
    depositMax: "800.0",
    depositMin: "500.0",
    programRules: null,
    // TODO confirm not used anywhere
    // externalId: null,
    waitlistMaxSize: 600,
    name: "The Triton",
    waitlistCurrentSize: 400,
    // TODO confirm not used anywhere
    // prioritiesDescriptor: null,
    requiredDocuments:
      "Due at interview - Paystubs, 3 months’ bank statements, recent tax returns or non-tax affidavit, recent retirement statement, application to lease, application qualifying criteria, social security card, state or nation ID. For self-employed, copy of IRS Tax Return including schedule C and current or most recent clients. Unemployment if applicable. Child support/Alimony; current notice from DA office, a court order or a letter from the provider with copies of last two checks. Any other income etc",
    // TODO confirm not used anywhere
    // reservedCommunityMaximumAge: 0,
    // TODO confirm not used anywhere
    // reservedCommunityMinimumAge: 0,
    // TODO confirm not used anywhere
    // reservedDescriptor: null,
    // TODO confirm not used anywhere
    // groupId: 2,
    // TODO confirm not used anywhere
    // hideUnitFeatures: false,
    applicationFee: "38.0",
    criminalBackground:
      "A criminal background investigation will be obtained on each applicant. As criminal background checks are done county by county and will be ran for all counties in which the applicant lived, Applicants will be disqualified for tenancy if they have been convicted of a felony or misdemeanor. Refer to Tenant Selection Criteria or Qualification Criteria for details related to the qualification process.",
    leasingAgentAddress: {
      city: "Foster City",
      street: "55 Triton Park Lane",
      zipCode: "94404",
      state: "CA",
      latitude: 37.55695,
      longitude: -122.27521,
    },
    leasingAgentEmail: "thetriton@legacypartners.com",
    leasingAgentName: "Francis Santos",
    leasingAgentOfficeHours: "Monday - Friday, 9:00 am - 5:00 pm",
    leasingAgentPhone: "650-437-2039",
    leasingAgentTitle: "Business Manager",
    rentalHistory: "No evictions.",
    // TODO confirm not used anywhere
    // totalUnits: 2,
    status: ListingStatus.active,
  },
  amiChart: SanMateoHUD2019,
}

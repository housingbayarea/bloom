import { ListingsStatusEnum, ReviewOrderTypeEnum } from '@prisma/client';
import dayjs from 'dayjs';

export const littleVillageApartments = {
  additionalApplicationSubmissionNotes: null,
  digitalApplication: true,
  commonDigitalApplication: false,
  paperApplication: false,
  referralOpportunity: false,
  assets: [],
  accessibility: null,
  amenities: null,
  buildingTotalUnits: 0,
  developer: 'La Villita Listings',
  householdSizeMax: 0,
  householdSizeMin: 0,
  neighborhood: 'Koreatown',
  petPolicy: null,
  smokingPolicy: null,
  unitAmenities: null,
  servicesOffered: null,
  yearBuilt: 1996,
  applicationDueDate: null,
  applicationOpenDate: dayjs(new Date()).subtract(30, 'days').toDate(),
  applicationFee: null,
  applicationOrganization: null,
  applicationPickUpAddressOfficeHours: null,
  applicationPickUpAddressType: null,
  applicationDropOffAddressOfficeHours: null,
  applicationDropOffAddressType: null,
  applicationMailingAddressType: null,
  buildingSelectionCriteria: null,
  costsNotIncluded: null,
  creditHistory: null,
  criminalBackground: null,
  depositMin: '0',
  depositMax: '0',
  depositHelperText:
    "or one month's rent may be higher for lower credit scores",
  disableUnitsAccordion: false,
  leasingAgentEmail: 'joe@smith.com',
  leasingAgentName: 'Joe Smith',
  leasingAgentOfficeHours: null,
  leasingAgentPhone: '(619) 591-5987',
  leasingAgentTitle: null,
  name: 'Little Village Apartments',
  postmarkedApplicationsReceivedByDate: null,
  programRules: null,
  rentalAssistance:
    'Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.',
  rentalHistory: null,
  requiredDocuments: null,
  specialNotes: null,
  waitlistCurrentSize: null,
  waitlistMaxSize: null,
  whatToExpect:
    'Applicants will be contacted by the property agent in rank order until vacancies are filled. All of the information that you have provided will be verified and your eligibility confirmed. Your application will be removed from the waitlist if you have made any fraudulent statements. If we cannot verify a housing preference that you have claimed, you will not receive the preference but will not be otherwise penalized. Should your application be chosen, be prepared to fill out a more detailed application and provide required supporting documents.',
  status: ListingsStatusEnum.pending,
  reviewOrderType: ReviewOrderTypeEnum.waitlist,
  displayWaitlistSize: false,
  reservedCommunityDescription: null,
  reservedCommunityMinAge: null,
  resultLink: null,
  isWaitlistOpen: true,
  waitlistOpenSpots: 6,
  customMapPin: false,
  contentUpdatedAt: new Date(),
  publishedAt: new Date(),
  listingsApplicationPickUpAddress: undefined,
  listingsApplicationDropOffAddress: undefined,
  listingsApplicationMailingAddress: undefined,
  listingImages: {
    create: [
      {
        ordinal: 0,
        assets: {
          create: {
            label: 'cloudinaryBuilding',
            fileId: 'dev/dillon-kydd-2keCPb73aQY-unsplash_lm7krp',
          },
        },
      },
    ],
  },
};

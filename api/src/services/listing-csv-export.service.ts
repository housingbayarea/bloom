import archiver from 'archiver';
import fs, { createReadStream } from 'fs';
import { join } from 'path';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  ApplicationMethodsTypeEnum,
  ListingEventsTypeEnum,
} from '@prisma/client';
import { views } from './listing.service';
import { PrismaService } from './prisma.service';
import {
  CsvExporterServiceInterface,
  CsvHeader,
} from '../types/CsvExportInterface';
import { ListingCsvQueryParams } from '../dtos/listings/listing-csv-query-params.dto';
import { User } from '../dtos/users/user.dto';
import { formatLocalDate } from '../utilities/format-local-date';
import { ListingReviewOrder } from '../enums/listings/review-order-enum';
import { isEmpty } from '../utilities/is-empty';
import { ListingEvent } from '../dtos/listings/listing-event.dto';
import { ApplicationMethod } from '../dtos/application-methods/application-method.dto';
import Unit from '../dtos/units/unit.dto';
import Listing from '../dtos/listings/listing.dto';
import { mapTo } from '../utilities/mapTo';
import { ListingMultiselectQuestion } from '../dtos/listings/listing-multiselect-question.dto';
import { AmiChart } from '../dtos/ami-charts/ami-chart.dto';
import { UnitAmiChartOverride } from '../dtos/units/ami-chart-override.dto';

views.csv = {
  ...views.details,
  copyOf: {
    select: {
      id: true,
    },
  },
  userAccounts: true,
};

export const formatStatus = {
  active: 'Public',
  closed: 'Closed',
  pending: 'Draft',
  pendingReview: 'Pending Review',
  changesRequested: 'Changes Requested',
};

export const formatCommunityType = {
  senior55: 'Seniors 55+',
  senior62: 'Seniors 62+',
  specialNeeds: 'Special Needs',
};

@Injectable()
export class ListingCsvExporterService implements CsvExporterServiceInterface {
  readonly dateFormat: string = 'MM-DD-YYYY hh:mm:ssA z';
  timeZone = process.env.TIME_ZONE;
  constructor(
    private prisma: PrismaService,
    @Inject(Logger)
    private logger = new Logger(ListingCsvExporterService.name),
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   *
   * @param queryParams
   * @param req
   * @returns a promise containing a streamable file
   */
  async exportFile<QueryParams extends ListingCsvQueryParams>(
    req: ExpressRequest,
    res: ExpressResponse,
    queryParams: QueryParams,
  ): Promise<StreamableFile> {
    this.logger.warn('Generating Listing-Unit Zip');
    const user = mapTo(User, req['user']);
    await this.authorizeCSVExport(mapTo(User, req['user']));

    const zipFileName = `listings-units-${user.id}-${new Date().getTime()}.zip`;
    const zipFilePath = join(process.cwd(), `src/temp/${zipFileName}`);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename: ${zipFileName}`,
    });

    const listingFilePath = join(
      process.cwd(),
      `src/temp/listings-${user.id}-${new Date().getTime()}.csv`,
    );
    const unitFilePath = join(
      process.cwd(),
      `src/temp/units-${user.id}-${new Date().getTime()}.csv`,
    );

    if (queryParams.timeZone) {
      this.timeZone = queryParams.timeZone;
    }

    const whereClause = {
      jurisdictions: {
        OR: [],
      },
    };

    user.jurisdictions?.forEach((jurisdiction) => {
      whereClause.jurisdictions.OR.push({
        id: jurisdiction.id,
      });
    });

    const listings = await this.prisma.listings.findMany({
      include: views.csv,
      where: whereClause,
    });

    await this.createCsv(listingFilePath, queryParams, {
      listings: listings as unknown as Listing[],
    });
    const listingCsv = createReadStream(listingFilePath);

    await this.createUnitCsv(unitFilePath, listings as unknown as Listing[]);
    const unitCsv = createReadStream(unitFilePath);
    return new Promise((resolve) => {
      // Create a writable stream to the zip file
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      output.on('close', () => {
        const zipFile = createReadStream(zipFilePath);
        resolve(new StreamableFile(zipFile));
      });

      archive.pipe(output);
      archive.append(listingCsv, { name: 'listings.csv' });
      archive.append(unitCsv, { name: 'units.csv' });
      archive.finalize();
    });
  }

  /**
   *
   * @param filename
   * @param queryParams
   * @returns a promise with SuccessDTO
   */
  async createCsv<QueryParams extends ListingCsvQueryParams>(
    filename: string,
    queryParams: QueryParams,
    optionParams: { listings: Listing[] },
  ): Promise<void> {
    const csvHeaders = await this.getCsvHeaders();

    return new Promise((resolve, reject) => {
      // create stream
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );

          // now loop over listings and write them to file
          optionParams.listings.forEach((listing) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                // handles working with arrays, e.g. householdMember.0.firstName
                if (!isNaN(Number(curr))) {
                  const index = Number(curr);
                  return acc[index];
                }

                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, listing);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value, listing);
              }

              row += value ? `"${value.toString().replace(/"/g, `""`)}"` : '';
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  async createUnitCsv(filename: string, listings: Listing[]): Promise<void> {
    const csvHeaders = this.getUnitCsvHeaders();
    // flatten those listings
    const units = listings.flatMap((listing) =>
      listing.units.map((unit) => ({
        listing: {
          id: listing.id,
          name: listing.name,
        },
        unit,
      })),
    );
    // TODO: the below is essentially the same as above in this.createCsv
    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          units.forEach((unit) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                // handles working with arrays, e.g. householdMember.0.firstName
                if (!isNaN(Number(curr))) {
                  const index = Number(curr);
                  return acc[index];
                }

                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, unit);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value);
              }

              row += value;
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  formatCurrency(value: string): string {
    return value ? `$${value}` : '';
  }

  cloudinaryPdfFromId(publicId: string, listing?: Listing): string {
    if (publicId) {
      const cloudName =
        process.env.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.pdf`;
    } else if (!publicId && listing?.buildingSelectionCriteria) {
      return listing.buildingSelectionCriteria;
    }

    return '';
  }

  formatYesNo = (value: boolean | null): string => {
    if (value === null || typeof value == 'undefined') return '';
    else if (value) return 'Yes';
    else return 'No';
  };

  hideZero = (fieldValue: number | string) => {
    if (isEmpty(fieldValue) || fieldValue === 0 || fieldValue === '0')
      return '';
    return fieldValue;
  };

  async getCsvHeaders(): Promise<CsvHeader[]> {
    const headers: CsvHeader[] = [
      {
        path: 'id',
        label: 'Listing Id',
      },
      {
        path: 'createdAt',
        label: 'Created At Date',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'jurisdictions.name',
        label: 'Jurisdiction',
      },
      {
        path: 'name',
        label: 'Listing Name',
      },
      {
        path: 'status',
        label: 'Listing Status',
        format: (val: string): string => formatStatus[val],
      },
      {
        path: 'publishedAt',
        label: 'Publish Date',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'updatedAt',
        label: 'Last Updated',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'copyOf',
        label: 'Copy or Original',
        format: (val: Listing): string => (val ? 'Copy' : 'Original'),
      },
      {
        path: 'copyOfId',
        label: 'Copied From',
        format: (val: string): string => val,
      },
      {
        path: 'developer',
        label: 'Developer',
      },
      {
        path: 'listingsBuildingAddress.street',
        label: 'Building Street Address',
      },
      {
        path: 'listingsBuildingAddress.city',
        label: 'Building City',
      },
      {
        path: 'listingsBuildingAddress.state',
        label: 'Building State',
      },
      {
        path: 'listingsBuildingAddress.zipCode',
        label: 'Building Zip',
      },
      {
        path: 'neighborhood',
        label: 'Building Neighborhood',
      },
      {
        path: 'yearBuilt',
        label: 'Building Year Built',
      },
      {
        path: 'reservedCommunityTypes.name',
        label: 'Reserved Community Types',
        format: (val: string): string => formatCommunityType[val] || '',
      },
      {
        path: 'listingsBuildingAddress.latitude',
        label: 'Latitude',
      },
      {
        path: 'listingsBuildingAddress.longitude',
        label: 'Longitude',
      },
      {
        path: 'units.length',
        label: 'Number of Units',
      },
      {
        path: 'reviewOrderType',
        label: 'Listing Availability',
        format: (val: string): string =>
          val === ListingReviewOrder.waitlist
            ? 'Open Waitlist'
            : 'Available Units',
      },
      {
        path: 'reviewOrderType',
        label: 'Review Order',
        format: (val: string): string => {
          if (!val) return '';
          const spacedValue = val.replace(/([A-Z])/g, (match) => ` ${match}`);
          const result =
            spacedValue.charAt(0).toUpperCase() + spacedValue.slice(1);
          return result;
        },
      },
      {
        path: 'listingEvents',
        label: 'Lottery Date',
        format: (val: ListingEvent[]): string => {
          if (!val) return '';
          const lottery = val.filter(
            (event) => event.type === ListingEventsTypeEnum.publicLottery,
          );
          return lottery.length
            ? formatLocalDate(lottery[0].startTime, 'MM-DD-YYYY', this.timeZone)
            : '';
        },
      },
      {
        path: 'listingEvents',
        label: 'Lottery Start',
        format: (val: ListingEvent[]): string => {
          if (!val) return '';
          const lottery = val.filter(
            (event) => event.type === ListingEventsTypeEnum.publicLottery,
          );
          return lottery.length
            ? formatLocalDate(lottery[0].startTime, 'hh:mmA z', this.timeZone)
            : '';
        },
      },
      {
        path: 'listingEvents',
        label: 'Lottery End',
        format: (val: ListingEvent[]): string => {
          if (!val) return '';
          const lottery = val.filter(
            (event) => event.type === ListingEventsTypeEnum.publicLottery,
          );
          return lottery.length
            ? formatLocalDate(lottery[0].endTime, 'hh:mmA z', this.timeZone)
            : '';
        },
      },
      {
        path: 'listingEvents',
        label: 'Lottery Notes',
        format: (val: ListingEvent[]): string => {
          if (!val) return '';
          const lottery = val.filter(
            (event) => event.type === ListingEventsTypeEnum.publicLottery,
          );
          return lottery.length ? lottery[0].note : '';
        },
      },
      {
        path: 'listingMultiselectQuestions',
        label: 'Housing Preferences',
        format: (val: ListingMultiselectQuestion[]): string => {
          return val
            .filter(
              (question) =>
                question.multiselectQuestions.applicationSection ===
                'preferences',
            )
            .map((question) => question.multiselectQuestions.text)
            .join(',');
        },
      },
      {
        path: 'listingMultiselectQuestions',
        label: 'Housing Programs',
        format: (val: ListingMultiselectQuestion[]): string => {
          return val
            .filter(
              (question) =>
                question.multiselectQuestions.applicationSection === 'programs',
            )
            .map((question) => question.multiselectQuestions.text)
            .join(',');
        },
      },
      {
        path: 'applicationFee',
        label: 'Application Fee',
        format: this.formatCurrency,
      },
      {
        path: 'depositHelperText',
        label: 'Deposit Helper Text',
      },
      {
        path: 'depositMin',
        label: 'Deposit Min',
        format: this.formatCurrency,
      },
      {
        path: 'depositMax',
        label: 'Deposit Max',
        format: this.formatCurrency,
      },
      {
        path: 'costsNotIncluded',
        label: 'Costs Not Included',
      },
      {
        path: 'amenities',
        label: 'Property Amenities',
      },
      {
        path: 'accessibility',
        label: 'Additional Accessibility',
      },
      {
        path: 'unitAmenities',
        label: 'Unit Amenities',
      },
      {
        path: 'smokingPolicy',
        label: 'Smoking Policy',
      },
      {
        path: 'petPolicy',
        label: 'Pets Policy',
      },
      {
        path: 'servicesOffered',
        label: 'Services Offered',
      },
      {
        path: 'creditHistory',
        label: 'Eligibility Rules - Credit History',
      },
      {
        path: 'rentalHistory',
        label: 'Eligibility Rules - Rental History',
      },
      {
        path: 'criminalBackground',
        label: 'Eligibility Rules - Criminal Background',
      },
      {
        path: 'rentalAssistance',
        label: 'Eligibility Rules - Rental Assistance',
      },
      {
        path: 'buildingSelectionCriteriaFileId',
        label: 'Building Selection Criteria',
        format: this.cloudinaryPdfFromId,
      },
      {
        path: 'programRules',
        label: 'Important Program Rules',
      },
      {
        path: 'requiredDocuments',
        label: 'Required Documents',
      },
      {
        path: 'specialNotes',
        label: 'Special Notes',
      },
      {
        path: 'isWaitlistOpen',
        label: 'Waitlist',
        format: this.formatYesNo,
      },
      {
        path: 'leasingAgentName',
        label: 'Leasing Agent Name',
      },
      {
        path: 'leasingAgentEmail',
        label: 'Leasing Agent Email',
      },
      {
        path: 'leasingAgentPhone',
        label: 'Leasing Agent Phone',
      },
      {
        path: 'leasingAgentTitle',
        label: 'Leasing Agent Title',
      },
      {
        path: 'leasingAgentOfficeHours',
        label: 'Leasing Agent Office Hours',
      },
      {
        path: 'listingsLeasingAgentAddress.street',
        label: 'Leasing Agent Street Address',
      },
      {
        path: 'listingsLeasingAgentAddress.street2',
        label: 'Leasing Agent Apt/Unit #',
      },
      {
        path: 'listingsLeasingAgentAddress.city',
        label: 'Leasing Agent City',
      },
      {
        path: 'listingsLeasingAgentAddress.state',
        label: 'Leasing Agent State',
      },
      {
        path: 'listingsLeasingAgentAddress.zipCode',
        label: 'Leasing Agent Zip',
      },
      {
        path: 'listingsLeasingAgentAddress.street',
        label: 'Leasing Agency Mailing Address',
      },
      {
        path: 'listingsLeasingAgentAddress.street2',
        label: 'Leasing Agency Mailing Address Street 2',
      },
      {
        path: 'listingsLeasingAgentAddress.city',
        label: 'Leasing Agency Mailing Address City',
      },
      {
        path: 'listingsLeasingAgentAddress.state',
        label: 'Leasing Agency Mailing Address State',
      },
      {
        path: 'listingsLeasingAgentAddress.zipCode',
        label: 'Leasing Agency Mailing Address Zip',
      },
      {
        path: 'listingsApplicationPickUpAddress.street',
        label: 'Leasing Agency Pickup Address',
      },
      {
        path: 'listingsApplicationPickUpAddress.street2',
        label: 'Leasing Agency Pickup Address Street 2',
      },
      {
        path: 'listingsApplicationPickUpAddress.city',
        label: 'Leasing Agency Pickup Address City',
      },
      {
        path: 'listingsApplicationPickUpAddress.state',
        label: 'Leasing Agency Pickup Address State',
      },
      {
        path: 'listingsApplicationPickUpAddress.zipCode',
        label: 'Leasing Agency Pickup Address Zip',
      },
      {
        path: 'applicationPickUpAddressOfficeHours',
        label: 'Leasing Pick Up Office Hours',
      },
      {
        path: 'digitalApplication',
        label: 'Digital Application',
        format: this.formatYesNo,
      },
      {
        path: 'applicationMethods',
        label: 'Digital Application URL',
        format: (val: ApplicationMethod[]): string => {
          const method = val.filter(
            (appMethod) =>
              appMethod.type === ApplicationMethodsTypeEnum.ExternalLink,
          );
          return method.length ? method[0].externalReference : '';
        },
      },
      {
        path: 'paperApplication',
        label: 'Paper Application',
        format: this.formatYesNo,
      },
      {
        path: 'applicationMethods',
        label: 'Paper Application URL',
        format: (val: ApplicationMethod[]): string => {
          const method = val.filter(
            (appMethod) => appMethod.paperApplications.length > 0,
          );
          const paperApps = method.length ? method[0].paperApplications : [];
          return paperApps.length
            ? paperApps
                .map((app) => this.cloudinaryPdfFromId(app.assets.fileId))
                .join(', ')
            : '';
        },
      },
      {
        path: 'referralOpportunity',
        label: 'Referral Opportunity',
        format: this.formatYesNo,
      },
      {
        path: 'applicationMailingAddressId',
        label: 'Can applications be mailed in?',
        format: this.formatYesNo,
      },
      {
        path: 'applicationPickUpAddressId',
        label: 'Can applications be picked up?',
        format: this.formatYesNo,
      },
      {
        path: 'applicationPickUpAddressId',
        label: 'Can applications be dropped off?',
        format: this.formatYesNo,
      },
      {
        path: 'postmarkedApplicationsReceivedByDate',
        label: 'Postmark',
        format: (val: string): string =>
          formatLocalDate(val, this.dateFormat, this.timeZone),
      },
      {
        path: 'additionalApplicationSubmissionNotes',
        label: 'Additional Application Submission Notes',
      },
      {
        path: 'applicationDueDate',
        label: 'Application Due Date',
        format: (val: string): string =>
          formatLocalDate(val, 'MM-DD-YYYY', this.timeZone),
      },
      {
        path: 'applicationDueDate',
        label: 'Application Due Time',
        format: (val: string): string =>
          formatLocalDate(val, 'hh:mmA z', this.timeZone),
      },
      {
        path: 'listingEvents',
        label: 'Open House',
        format: (val: ListingEvent[]): string => {
          if (!val) return '';
          return val
            .filter((event) => event.type === ListingEventsTypeEnum.openHouse)
            .map((event) => {
              let openHouseStr = '';
              if (event.label) openHouseStr += `${event.label}`;
              if (event.startTime) {
                const date = formatLocalDate(
                  event.startTime,
                  'MM-DD-YYYY',
                  this.timeZone,
                );
                openHouseStr += `: ${date}`;
                if (event.endTime) {
                  const startTime = formatLocalDate(
                    event.startTime,
                    'hh:mmA',
                    this.timeZone,
                  );
                  const endTime = formatLocalDate(
                    event.endTime,
                    'hh:mmA z',
                    this.timeZone,
                  );
                  openHouseStr += ` (${startTime} - ${endTime})`;
                }
              }
              return openHouseStr;
            })
            .filter((str) => str.length)
            .join(', ');
        },
      },
      {
        path: 'userAccounts',
        label: 'Partners Who Have Access',
        format: (val: User[]): string =>
          val.map((user) => `${user.firstName} ${user.lastName}`).join(', '),
      },
    ];

    return headers;
  }

  getUnitCsvHeaders(): CsvHeader[] {
    return [
      {
        path: 'listing.id',
        label: 'Listing Id',
      },
      {
        path: 'listing.name',
        label: 'Listing Name',
      },
      {
        path: 'unit.number',
        label: 'Unit Number',
      },
      {
        path: 'unit.unitTypes.name',
        label: 'Unit Type',
      },
      {
        path: 'unit.numBathrooms',
        label: 'Number of Bathrooms',
      },
      {
        path: 'unit.floor',
        label: 'Unit Floor',
        format: this.hideZero,
      },
      {
        path: 'unit.sqFeet',
        label: 'Square Footage',
      },
      {
        path: 'unit.minOccupancy',
        label: 'Minimum Occupancy',
        format: this.hideZero,
      },
      {
        path: 'unit.maxOccupancy',
        label: 'Max Occupancy',
        format: this.hideZero,
      },
      {
        path: 'unit.amiChart.name',
        label: 'AMI Chart',
      },
      {
        path: 'unit.amiChart.items.0.percentOfAmi',
        label: 'AMI Level',
      },
      {
        path: 'unit',
        label: 'Rent Type',
        format: (val: Unit) =>
          !isEmpty(val.monthlyRentAsPercentOfIncome)
            ? '% of income'
            : !isEmpty(val.monthlyRent)
            ? 'Fixed amount'
            : '',
      },
    ];
  }

  async authorizeCSVExport(user?: User): Promise<void> {
    if (
      user &&
      (user.userRoles?.isAdmin ||
        user.userRoles?.isJurisdictionalAdmin ||
        user.userRoles?.isPartner)
    ) {
      return;
    } else {
      throw new ForbiddenException();
    }
  }

  // GEN AI EXPORT STUFF
  async createAMIChartCsv(
    filename: string,
    jurisdictionId: string,
  ): Promise<void> {
    const csvHeaders = [
      {
        path: 'id',
        label: 'ami_chart_id',
      },
      {
        path: 'name',
        label: 'ami_chart_name',
      },
      {
        path: 'income',
        label: 'income',
      },
      {
        path: 'householdSize',
        label: 'household_size',
      },
      {
        path: 'percentOfAmi',
        label: 'percent_of_ami',
      },
    ];
    const rawAmiCharts = await this.prisma.amiChart.findMany({
      select: {
        id: true,
        items: true,
        name: true,
      },
      where: {
        jurisdictionId,
      },
    });
    const amiCharts = mapTo(AmiChart, rawAmiCharts);
    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          amiCharts.forEach((chart) => {
            for (const item of chart.items) {
              const flatChart = { id: chart.id, name: chart.name, ...item };

              let row = '';
              csvHeaders.forEach((header, index) => {
                let value = header.path.split('.').reduce((acc, curr) => {
                  if (acc === null || acc === undefined) {
                    return '';
                  }
                  return acc[curr];
                }, flatChart);
                value = value === undefined ? '' : value === null ? '' : value;

                row += value;
                if (index < csvHeaders.length - 1) {
                  row += ',';
                }
              });

              try {
                writableStream.write(row + '\n');
              } catch (e) {
                console.log('writeStream write error = ', e);
                writableStream.once('drain', () => {
                  writableStream.write(row + '\n');
                });
              }
            }
          });

          writableStream.end();
        });
    });
  }

  async createAMICharOverrideCsv(
    filename: string,
    jurisdictionId: string,
  ): Promise<void> {
    const csvHeaders = [
      {
        path: 'id',
        label: 'ami_chart_override_id',
      },
      {
        path: 'income',
        label: 'income',
      },
      {
        path: 'householdSize',
        label: 'household_size',
      },
      {
        path: 'percentOfAmi',
        label: 'percent_of_ami',
      },
    ];
    const rawAmiCharts = await this.prisma.unitAmiChartOverrides.findMany({
      select: {
        id: true,
        items: true,
      },
      where: {
        units: {
          listings: {
            jurisdictionId,
          },
        },
      },
    });
    const amiCharts = mapTo(UnitAmiChartOverride, rawAmiCharts);
    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          amiCharts.forEach((chart) => {
            for (const item of chart.items) {
              const flatChart = { id: chart.id, ...item };

              let row = '';
              csvHeaders.forEach((header, index) => {
                let value = header.path.split('.').reduce((acc, curr) => {
                  if (acc === null || acc === undefined) {
                    return '';
                  }
                  return acc[curr];
                }, flatChart);
                value = value === undefined ? '' : value === null ? '' : value;

                row += value;
                if (index < csvHeaders.length - 1) {
                  row += ',';
                }
              });

              try {
                writableStream.write(row + '\n');
              } catch (e) {
                console.log('writeStream write error = ', e);
                writableStream.once('drain', () => {
                  writableStream.write(row + '\n');
                });
              }
            }
          });

          writableStream.end();
        });
    });
  }

  async genAIUnitCsv(filename: string, jurisdictionId: string): Promise<void> {
    const csvHeaders: CsvHeader[] = [
      {
        path: 'amiPercentage',
        label: 'ami_percentage',
      },
      {
        path: 'annualIncomeMin',
        label: 'annual_income_min',
      },
      {
        path: 'monthlyIncomeMin',
        label: 'monthly_income_min',
      },
      {
        path: 'floor',
        label: 'floor',
      },
      {
        path: 'annualIncomeMax',
        label: 'annual_income_max',
      },
      {
        path: 'maxOccupancy',
        label: 'max_occupancy',
      },
      {
        path: 'minOccupancy',
        label: 'min_occupancy',
      },
      {
        path: 'monthlyRent',
        label: 'monthly_rent',
      },
      {
        path: 'numBathrooms',
        label: 'number_of_bathrooms',
      },
      {
        path: 'numBedrooms',
        label: 'number_of_bedrooms',
      },
      {
        path: 'sqFeet',
        label: 'square_feet',
      },
      {
        path: 'bmrProgramChart',
        label: 'bmr_program_chart',
      },
      {
        path: 'amiChartId',
        label: 'ami_chart_id',
      },
      {
        path: 'listingId',
        label: 'listing_id',
      },
      {
        path: 'amiChartOverrideId',
        label: 'ami_chart_override_id',
      },
      {
        path: 'monthlyRentAsPercentOfIncome',
        label: 'monthly_rent_as_percent_of_income',
      },
      {
        path: 'unitTypes.name',
        label: 'unit_type_name',
      },
      {
        path: 'unitTypes.numBedrooms',
        label: 'unit_type_number_of_bedrooms',
      },
      {
        path: 'unitAccessibilityPriorityTypes.name',
        label: 'priority_type',
      },
      {
        path: 'unitRentTypes.name',
        label: 'rent_type',
      },
    ];
    const units = await this.prisma.units.findMany({
      select: {
        amiPercentage: true,
        annualIncomeMin: true,
        monthlyIncomeMin: true,
        floor: true,
        annualIncomeMax: true,
        maxOccupancy: true,
        minOccupancy: true,
        monthlyRent: true,
        numBathrooms: true,
        numBedrooms: true,
        sqFeet: true,
        bmrProgramChart: true,
        amiChartId: true,
        listingId: true,
        amiChartOverrideId: true,
        monthlyRentAsPercentOfIncome: true,
        unitTypes: {
          select: {
            id: true,
            name: true,
            numBedrooms: true,
          },
        },
        unitAccessibilityPriorityTypes: {
          select: {
            id: true,
            name: true,
          },
        },
        unitRentTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        listings: {
          jurisdictionId,
        },
      },
    });

    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          units.forEach((unit) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, unit);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value);
              }

              row += value;
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  async createMultiselectQuestionCsv(
    filename: string,
    jurisdictionId: string,
  ): Promise<void> {
    const csvHeaders = [
      {
        path: 'id',
        label: 'multiselect_question_id',
      },
      {
        path: 'text',
        label: 'multiselection_question_title',
      },
      {
        path: 'applicationSection',
        label: 'program_or_preference',
      },
      {
        path: 'listingId',
        label: 'listing_id',
      },
    ];
    const multiselectQuestions =
      await this.prisma.multiselectQuestions.findMany({
        select: {
          id: true,
          text: true,
          applicationSection: true,
          listings: {
            select: {
              listingId: true,
            },
          },
        },
        where: {
          jurisdictions: {
            some: {
              id: jurisdictionId,
            },
          },
        },
      });

    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );
          multiselectQuestions.forEach((msq) => {
            if (!msq.listings || !msq.listings.length) {
              let row = '';
              csvHeaders.forEach((header, index) => {
                let value = header.path.split('.').reduce((acc, curr) => {
                  if (acc === null || acc === undefined) {
                    return '';
                  }
                  return acc[curr];
                }, msq);
                value = value === undefined ? '' : value === null ? '' : value;

                row += value;
                if (index < csvHeaders.length - 1) {
                  row += ',';
                }
              });

              try {
                writableStream.write(row + '\n');
              } catch (e) {
                console.log('writeStream write error = ', e);
                writableStream.once('drain', () => {
                  writableStream.write(row + '\n');
                });
              }
            } else {
              msq.listings.forEach((listing) => {
                const flatMsq = { ...msq, listingId: listing.listingId };
                let row = '';
                csvHeaders.forEach((header, index) => {
                  let value = header.path.split('.').reduce((acc, curr) => {
                    if (acc === null || acc === undefined) {
                      return '';
                    }
                    return acc[curr];
                  }, flatMsq);
                  value =
                    value === undefined ? '' : value === null ? '' : value;

                  row += value;
                  if (index < csvHeaders.length - 1) {
                    row += ',';
                  }
                });

                try {
                  writableStream.write(row + '\n');
                } catch (e) {
                  console.log('writeStream write error = ', e);
                  writableStream.once('drain', () => {
                    writableStream.write(row + '\n');
                  });
                }
              });
            }
          });

          writableStream.end();
        });
    });
  }

  async genAIListingsCsv(
    filename: string,
    jurisdictionId: string,
  ): Promise<void> {
    const csvHeaders: CsvHeader[] = [
      { path: 'id', label: 'listing_id' },
      { path: 'accessibility', label: 'accessibility' },
      { path: 'amenities', label: 'amenities' },
      { path: 'amiPercentageMax', label: 'ami_percentage_max' },
      { path: 'amiPercentageMin', label: 'ami_percentage_min' },
      {
        path: 'applicationDropOffAddressId',
        label: 'drop_off_address_present',
        format: (val) => {
          !!val;
        },
      },
      { path: 'applicationFee', label: 'application_fee' },
      {
        path: 'applicationMailingAddressId',
        label: 'mailing_address_present',
        format: (val) => {
          !!val;
        },
      },
      {
        path: 'applicationPickUpAddressId',
        label: 'pick_up_address_present',
        format: (val) => {
          !!val;
        },
      },
      {
        path: 'buildingSelectionCriteria',
        label: 'building_selection_criteria',
      },
      { path: 'commonDigitalApplication', label: 'common_digital_application' },
      { path: 'costsNotIncluded', label: 'costs_not_included' },
      { path: 'creditHistory', label: 'credit_history' },
      { path: 'criminalBackground', label: 'criminal_background' },
      { path: 'depositHelperText', label: 'deposit_helper_text' },
      { path: 'depositMax', label: 'deposit_max' },
      { path: 'depositMin', label: 'deposit_min' },
      { path: 'digitalApplication', label: 'digital_application' },
      { path: 'neighborhood', label: 'neighborhood' },
      { path: 'paperApplication', label: 'paper_application' },
      { path: 'petPolicy', label: 'pet_policy' },
      { path: 'programRules', label: 'program_rules' },
      { path: 'rentalAssistance', label: 'rental_assistance' },
      { path: 'rentalHistory', label: 'rental_history' },
      { path: 'requiredDocuments', label: 'required_documentation' },
      {
        path: 'reservedCommunityDescription',
        label: 'reserved_community_description',
      },
      { path: 'reservedCommunityMinAge', label: 'reserved_community_min_age' },
      { path: 'reviewOrderType', label: 'review_order_type' },
      { path: 'servicesOffered', label: 'services_offered' },
      { path: 'smokingPolicy', label: 'smoking_policy' },
      { path: 'specialNotes', label: 'special_notes' },
      { path: 'status', label: 'status' },
      { path: 'unitAmenities', label: 'unit_amenities' },
      { path: 'unitsAvailable', label: 'units_available' },
      { path: 'whatToExpect', label: 'what_to_expect' },
      { path: 'yearBuilt', label: 'year_built' },
      { path: 'listingsBuildingAddress.id', label: 'id' },
      { path: 'listingsBuildingAddress.city', label: 'city' },
      { path: 'listingsBuildingAddress.county', label: 'county' },
      { path: 'listingsBuildingAddress.latitude', label: 'latitude' },
      { path: 'listingsBuildingAddress.longitude', label: 'longitude' },
      { path: 'listingsBuildingAddress.zipCode', label: 'zipCode' },
      { path: 'jurisdictions.id', label: 'jurisdiction_id' },
      { path: 'jurisdictions.name', label: 'jurisdiction_name' },
      {
        path: 'reservedCommunityTypes.id',
        label: 'reserved_community_type_id',
      },
      {
        path: 'reservedCommunityTypes.name',
        label: 'reserved_community_type_name',
      },
      {
        path: 'listingEvents',
        label: 'number_of_listing_events',
        format: (val: unknown[]) => val?.length ?? '',
      },
      {
        path: 'applicationMethods',
        label: 'number_of_paper_applications',
        format: (val: ApplicationMethod[]) => {
          if (val?.length) {
            let count = 0;
            val.forEach((elem) => {
              if (elem?.paperApplications) {
                count += elem.paperApplications.length;
              }
            });
            return count;
          }
          return '';
        },
      },
    ];
    const rawListings = await this.prisma.listings.findMany({
      select: {
        id: true,
        accessibility: true,
        amenities: true,
        amiPercentageMax: true,
        amiPercentageMin: true,
        applicationDropOffAddressId: true,
        applicationFee: true,
        applicationMailingAddressId: true,
        applicationPickUpAddressId: true,
        buildingSelectionCriteria: true,
        commonDigitalApplication: true,
        costsNotIncluded: true,
        creditHistory: true,
        criminalBackground: true,
        depositHelperText: true,
        depositMax: true,
        depositMin: true,
        digitalApplication: true,
        neighborhood: true,
        paperApplication: true,
        petPolicy: true,
        programRules: true,
        rentalAssistance: true,
        rentalHistory: true,
        requiredDocuments: true,
        reservedCommunityDescription: true,
        reservedCommunityMinAge: true,
        reviewOrderType: true,
        servicesOffered: true,
        smokingPolicy: true,
        specialNotes: true,
        status: true,
        unitAmenities: true,
        unitsAvailable: true,
        whatToExpect: true,
        yearBuilt: true,
        listingsBuildingAddress: {
          select: {
            id: true,
            city: true,
            county: true,
            latitude: true,
            longitude: true,
            zipCode: true,
          },
        },
        jurisdictions: {
          select: {
            id: true,
            name: true,
          },
        },
        listingEvents: {
          select: {
            id: true,
            type: true,
          },
        },
        applicationMethods: {
          select: {
            paperApplications: {
              select: { id: true, language: true },
            },
          },
        },
        reservedCommunityTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        jurisdictionId,
      },
    });
    const listings = mapTo(Listing, rawListings);
    return new Promise((resolve, reject) => {
      // create stream
      const writableStream = fs.createWriteStream(`${filename}`);
      writableStream
        .on('error', (err) => {
          console.log('csv writestream error');
          console.log(err);
          reject(err);
        })
        .on('close', () => {
          resolve();
        })
        .on('open', () => {
          writableStream.write(
            csvHeaders.map((header) => header.label).join(',') + '\n',
          );

          // now loop over listings and write them to file
          listings.forEach((listing) => {
            let row = '';
            csvHeaders.forEach((header, index) => {
              let value = header.path.split('.').reduce((acc, curr) => {
                // handles working with arrays, e.g. householdMember.0.firstName
                if (!isNaN(Number(curr))) {
                  const index = Number(curr);
                  return acc[index];
                }

                if (acc === null || acc === undefined) {
                  return '';
                }
                return acc[curr];
              }, listing);
              value = value === undefined ? '' : value === null ? '' : value;
              if (header.format) {
                value = header.format(value, listing);
              }
              row += value
                ? `"${value
                    .toString()
                    .replace(/"/g, `""`)
                    .replace(/\n/g, ' ')}"`
                : '';
              if (index < csvHeaders.length - 1) {
                row += ',';
              }
            });

            try {
              writableStream.write(row + '\n');
            } catch (e) {
              console.log('writeStream write error = ', e);
              writableStream.once('drain', () => {
                writableStream.write(row + '\n');
              });
            }
          });

          writableStream.end();
        });
    });
  }

  /**
   *
   * @param queryParams
   * @param req
   * @returns a promise containing a streamable file
   */
  async genAIExport<QueryParams extends ListingCsvQueryParams>(
    req: ExpressRequest,
    res: ExpressResponse,
    queryParams: QueryParams,
  ): Promise<StreamableFile> {
    this.logger.warn('Generating Listing-Unit Zip');
    const user = mapTo(User, req['user']);
    await this.authorizeCSVExport(mapTo(User, req['user']));

    const zipFileName = `listings-units-${user.id}-${new Date().getTime()}.zip`;
    const zipFilePath = join(process.cwd(), `src/temp/${zipFileName}`);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename: ${zipFileName}`,
    });

    const listingFilePath = join(
      process.cwd(),
      `src/temp/listings-${user.id}-${new Date().getTime()}.csv`,
    );
    const unitFilePath = join(
      process.cwd(),
      `src/temp/units-${user.id}-${new Date().getTime()}.csv`,
    );
    const amiChartFilePath = join(
      process.cwd(),
      `src/temp/ami-chart-${user.id}-${new Date().getTime()}.csv`,
    );
    const amiChartOverrideFilePath = join(
      process.cwd(),
      `src/temp/ami-chart-override-${user.id}-${new Date().getTime()}.csv`,
    );
    const multiselectQuestionFilePath = join(
      process.cwd(),
      `src/temp/multiselect-questions-${user.id}-${new Date().getTime()}.csv`,
    );

    if (queryParams.timeZone) {
      this.timeZone = queryParams.timeZone;
    }

    await this.genAIListingsCsv(listingFilePath, queryParams.jurisdictionId);
    const listingCsv = createReadStream(listingFilePath);

    await this.genAIUnitCsv(unitFilePath, queryParams.jurisdictionId);

    await this.createAMIChartCsv(amiChartFilePath, queryParams.jurisdictionId);
    await this.createAMICharOverrideCsv(
      amiChartOverrideFilePath,
      queryParams.jurisdictionId,
    );
    await this.createMultiselectQuestionCsv(
      multiselectQuestionFilePath,
      queryParams.jurisdictionId,
    );
    const unitCsv = createReadStream(unitFilePath);
    const amiChartCsv = createReadStream(amiChartFilePath);
    const amiChartOverrideCsv = createReadStream(amiChartOverrideFilePath);
    const multiselectQuestionCsv = createReadStream(
      multiselectQuestionFilePath,
    );
    return new Promise((resolve) => {
      // Create a writable stream to the zip file
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      output.on('close', () => {
        const zipFile = createReadStream(zipFilePath);
        resolve(new StreamableFile(zipFile));
      });

      archive.pipe(output);
      archive.append(listingCsv, { name: 'listings.csv' });
      archive.append(unitCsv, { name: 'units.csv' });
      archive.append(amiChartCsv, { name: 'ami-chart.csv' });
      archive.append(amiChartOverrideCsv, { name: 'ami-chart-override.csv' });
      archive.append(multiselectQuestionCsv, {
        name: 'multiselect-question.csv',
      });
      archive.finalize();
    });
  }
}

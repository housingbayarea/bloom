import {
  Injectable,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import axios from 'axios';
import { Method } from 'axios';
import { LanguagesEnum, Prisma, PrismaClient } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import fs, { createReadStream } from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaService } from './prisma.service';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { User } from '../dtos/users/user.dto';
import { mapTo } from '../utilities/mapTo';
import { DataTransferDTO } from '../dtos/script-runner/data-transfer.dto';
import { BulkApplicationResendDTO } from '../dtos/script-runner/bulk-application-resend.dto';
import { EmailService } from './email.service';
import { Application } from '../dtos/applications/application.dto';
import { IdDTO } from '../dtos/shared/id.dto';
import { AmiChartImportDTO } from '../dtos/script-runner/ami-chart-import.dto';
import { AmiChartCreate } from '../dtos/ami-charts/ami-chart-create.dto';
import { AmiChartService } from './ami-chart.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';
import { basename, join } from 'path';
import { convertDemographicRaceToReadable } from 'src/utilities/application-export-helpers';
import { formatLocalDate } from 'src/utilities/format-local-date';

/**
  this is the service for running scripts
  most functions in here will be unique, but each function should only be allowed to fire once
*/
@Injectable()
export class ScriptRunnerService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private amiChartService: AmiChartService,
    private httpService: HttpService,
  ) {}

  /**
   *
   * @param req incoming request object
   * @param dataTransferDTO data transfer endpoint args. Should contain foreign db connection string
   * @returns successDTO
   * @description transfers data from foreign data into the database this api normally connects to
   */
  async dataTransfer(
    req: ExpressRequest,
    dataTransferDTO: DataTransferDTO,
    prisma?: PrismaClient,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('data transfer', requestingUser);

    // connect to foreign db based on incoming connection string
    const client =
      prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: dataTransferDTO.connectionString,
          },
        },
      });
    await client.$connect();

    // get data
    const res =
      await client.$queryRaw`SELECT id, name FROM jurisdictions WHERE name = 'San Mateo'`;
    console.log(res);

    // disconnect from foreign db
    await client.$disconnect();

    // script runner standard spin down
    await this.markScriptAsComplete('data transfer', requestingUser);
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param bulkApplicationResendDTO bulk resend arg. Should contain listing id
   * @returns successDTO
   * @description resends a confirmation email to all applicants on a listing with an email
   */
  async bulkApplicationResend(
    req: ExpressRequest,
    bulkApplicationResendDTO: BulkApplicationResendDTO,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('bulk application resend', requestingUser);

    // gather listing data
    const listing = await this.prisma.listings.findUnique({
      select: {
        id: true,
        jurisdictions: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: bulkApplicationResendDTO.listingId,
      },
    });

    if (!listing || !listing.jurisdictions) {
      throw new BadRequestException('Listing does not exist');
    }

    // gather up all applications for that listing
    const rawApplications = await this.prisma.applications.findMany({
      select: {
        id: true,
        language: true,
        confirmationCode: true,
        applicant: {
          select: {
            id: true,
            emailAddress: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
      where: {
        listingId: bulkApplicationResendDTO.listingId,
        deletedAt: null,
        applicant: {
          emailAddress: {
            not: null,
          },
        },
      },
    });
    const applications = mapTo(Application, rawApplications);

    // send emails
    for (const application of applications) {
      await this.emailService.applicationScriptRunner(
        mapTo(Application, application),
        { id: listing.jurisdictions.id },
      );
    }

    // script runner standard spin down
    await this.markScriptAsComplete('bulk application resend', requestingUser);
    return { success: true };
  }
  /**
   *
   * @param req incoming request object
   * @param jurisdictionIdDTO id containing the jurisdiction id we are creating the new community type for
   * @returns successDTO
   * @description creates a new reserved community type. Reserved community types also need translations added
   */
  async createNewReservedCommunityType(
    req: ExpressRequest,
    jurisdictionIdDTO: IdDTO,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'Housing Voucher Community Type',
      requestingUser,
    );

    // create new housing voucher community type
    await this.prisma.reservedCommunityTypes.create({
      data: {
        name: 'housingVoucher',
        description: 'Reserved for HCV/Section 8 Voucher Holder',
        jurisdictions: {
          connect: {
            id: jurisdictionIdDTO.id,
          },
        },
      },
    });

    // script runner standard spin down
    await this.markScriptAsComplete(
      'Housing Voucher Community Type',
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param amiChartImportDTO this is a string in a very specific format like:
   * percentOfAmiValue_1 householdSize_1_income_value householdSize_2_income_value \n percentOfAmiValue_2 householdSize_1_income_value householdSize_2_income_value
   *
   * Copying and pasting from google sheets will not match the format above. You will need to perform the following:
   * 1) Find and delete all instances of "%"
   * 2) Using the Regex option in the Find and Replace tool, replace /\t with " " and /\n with "\\n"
   * See "How to format AMI data for script runner import" in Notion for a more detailed example
   * @returns successDTO
   * @description takes the incoming AMI Chart string and stores it as a new AMI Chart in the database
   */
  async amiChartImport(
    req: ExpressRequest,
    amiChartImportDTO: AmiChartImportDTO,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `AMI Chart ${amiChartImportDTO.name}`,
      requestingUser,
    );

    // parse incoming string into an amichart create dto
    const createDTO: AmiChartCreate = {
      items: [],
      name: amiChartImportDTO.name,
      jurisdictions: {
        id: amiChartImportDTO.jurisdictionId,
      },
    };

    const rows = amiChartImportDTO.values.split('\n');
    rows.forEach((row: string) => {
      const values = row.split(' ');
      const percentage = values[0];
      values.forEach((value: string, index: number) => {
        if (index > 0) {
          createDTO.items.push({
            percentOfAmi: Number(percentage),
            householdSize: index,
            income: Number(value),
          });
        }
      });
    });

    await this.amiChartService.create(createDTO);

    // script runner standard spin down
    await this.markScriptAsComplete(
      `AMI Chart ${amiChartImportDTO.name}`,
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param jurisdiction should contain jurisdiction id
   * @returns successDTO
   * @description adds lottery translations to the database
   */
  async addLotteryTranslations(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('add lottery translations', requestingUser);

    const updateForLanguage = async (
      language: LanguagesEnum,
      translationKeys: Record<string, Record<string, string>>,
    ) => {
      const translations = await this.prisma.translations.findFirst({
        where: { language, jurisdictionId: null },
      });

      const translationsJSON =
        translations.translations as unknown as Prisma.JsonArray;

      await this.prisma.translations.update({
        where: { id: translations.id },
        data: {
          translations: {
            ...translationsJSON,
            ...translationKeys,
          },
        },
      });
    };

    const enKeys = {
      lotteryReleased: {
        header: 'Lottery results for %{listingName} are ready to be published',
        adminApprovedStart:
          'Lottery results for %{listingName} have been released for publication. Please go to the listing view in your',
        adminApprovedEnd:
          'to view the lottery tab and release the lottery results.',
      },
      lotteryPublished: {
        header: 'Lottery results have been published for %{listingName}',
        resultsPublished:
          'Lottery results for %{listingName} have been published to applicant accounts.',
      },
      lotteryAvailable: {
        header: 'New Housing Lottery Results Available',
        resultsAvailable:
          'Results are available for a housing lottery for %{listingName}. See your housing portal account for more information.',
        signIn: 'Sign In to View Your Results',
        whatHappensHeader: 'What happens next?',
        whatHappensContent:
          'The property manager will begin to contact applicants by their preferred contact method. They will do so in the order of lottery rank, within each lottery preference. When the units are all filled, the property manager will stop contacting applicants. All the units could be filled before the property manager reaches your rank. If this happens, you will not be contacted.',
        otherOpportunities1:
          'To view other housing opportunities, please visit %{appUrl}. You can sign up to receive notifications of new application opportunities',
        otherOpportunities2: 'here',
        otherOpportunities3:
          'If you want to learn about how lotteries work, please see the lottery section of the',
        otherOpportunities4: 'Housing Portal Help Center',
      },
    };

    const esKeys = {
      lotteryAvailable: {
        header: 'Nuevos resultados de la lotería de vivienda disponibles',
        resultsAvailable:
          'Los resultados están disponibles para una lotería de vivienda para %{listingName}. Consulte su cuenta del portal de vivienda para obtener más información.',
        signIn: 'Inicie sesión para ver sus resultados',
        whatHappensHeader: '¿Qué pasa después?',
        whatHappensContent:
          'El administrador de la propiedad comenzará a comunicarse con los solicitantes mediante su método de contacto preferido. Lo harán en el orden de clasificación de la lotería, dentro de cada preferencia de lotería. Cuando todas las unidades estén ocupadas, el administrador de la propiedad dejará de comunicarse con los solicitantes. Todas las unidades podrían llenarse antes de que el administrador de la propiedad alcance su rango. Si esto sucede, no lo contactaremos.',
        otherOpportunities1:
          'Para ver otras oportunidades de vivienda, visite %{appUrl}. Puede registrarse para recibir notificaciones de nuevas oportunidades de solicitud',
        otherOpportunities2: 'aquí',
        otherOpportunities3:
          'Si desea obtener información sobre cómo funcionan las loterías, consulte la sección de lotería del',
        otherOpportunities4: 'Housing Portal Centro de ayuda',
      },
    };

    const tlKeys = {
      lotteryAvailable: {
        header: 'Bagong Housing Lottery Resulta Available',
        resultsAvailable:
          'Available ang mga resulta para sa isang housing lottery para sa %{listingName}. Tingnan ang iyong housing portal account para sa higit pang impormasyon.',
        signIn: 'Mag-sign In upang Tingnan ang Iyong Mga Resulta',
        whatHappensHeader: 'Anong mangyayari sa susunod?',
        whatHappensContent:
          'Magsisimulang makipag-ugnayan ang property manager sa mga aplikante sa pamamagitan ng kanilang gustong paraan ng pakikipag-ugnayan. Gagawin nila ito sa pagkakasunud-sunod ng ranggo ng lottery, sa loob ng bawat kagustuhan sa lottery. Kapag napuno na ang lahat ng unit, hihinto na ang property manager sa pakikipag-ugnayan sa mga aplikante. Maaaring mapunan ang lahat ng unit bago maabot ng property manager ang iyong ranggo. Kung mangyari ito, hindi ka makontak.',
        otherOpportunities1:
          'Upang tingnan ang iba pang pagkakataon sa pabahay, pakibisita ang %{appUrl}. Maaari kang mag-sign up upang makatanggap ng mga abiso ng mga bagong pagkakataon sa aplikasyon',
        otherOpportunities2: 'dito',
        otherOpportunities3:
          'Kung gusto mong malaman kung paano gumagana ang mga lottery, pakitingnan ang seksyon ng lottery ng',
        otherOpportunities4: 'Housing Portal Help Center',
      },
    };

    const viKeys = {
      lotteryAvailable: {
        header: 'Đã có kết quả xổ số nhà ở mới',
        resultsAvailable:
          'Đã có kết quả xổ số nhà ở cho %{listingName}. Xem tài khoản cổng thông tin nhà ở của bạn để biết thêm thông tin.',
        signIn: 'Đăng nhập để xem kết quả của bạn',
        whatHappensHeader: 'Chuyện gì xảy ra tiếp theo?',
        whatHappensContent:
          'Người quản lý tài sản sẽ bắt đầu liên hệ với người nộp đơn bằng phương thức liên hệ ưa thích của họ. Họ sẽ làm như vậy theo thứ tự xếp hạng xổ số, trong mỗi ưu tiên xổ số. Khi các căn hộ đã được lấp đầy, người quản lý tài sản sẽ ngừng liên hệ với người nộp đơn. Tất cả các đơn vị có thể được lấp đầy trước khi người quản lý tài sản đạt đến cấp bậc của bạn. Nếu điều này xảy ra, bạn sẽ không được liên lạc.',
        otherOpportunities1:
          'Để xem các cơ hội nhà ở khác, vui lòng truy cập %{appUrl}. Bạn có thể đăng ký để nhận thông báo về các cơ hội ứng tuyển mới',
        otherOpportunities2: 'đây',
        otherOpportunities3:
          'Nếu bạn muốn tìm hiểu về cách hoạt động của xổ số, vui lòng xem phần xổ số của',
        otherOpportunities4: 'Housing Portal Trung tâm trợ giúp',
      },
    };

    const zhKeys = {
      lotteryAvailable: {
        header: '新住房抽籤結果公佈',
        resultsAvailable:
          '%{listingName} 的住房抽籤結果可用。請參閱您的住房入口網站帳戶以獲取更多資訊。',
        signIn: '登入查看您的結果',
        whatHappensHeader: '接下來發生什麼事？',
        whatHappensContent:
          '物業經理將開始透過申請人首選的聯絡方式與申請人聯繫。他們將按照每個彩票偏好中的彩票排名順序進行操作。當單位全部住滿後，物業經理將停止聯絡申請人。在物業經理達到您的等級之前，所有單位都可以被填滿。如果發生這種情況，我們將不會與您聯繫。',
        otherOpportunities1:
          '要查看其他住房機會，請訪問 %{appUrl}。您可以註冊接收新申請機會的通知',
        otherOpportunities2: '這裡',
        otherOpportunities3: '如果您想了解彩票的運作方式，請參閱網站的彩票部分',
        otherOpportunities4: 'Housing Portal 幫助中心',
      },
    };
    await updateForLanguage(LanguagesEnum.en, enKeys);
    await updateForLanguage(LanguagesEnum.es, esKeys);
    await updateForLanguage(LanguagesEnum.tl, tlKeys);
    await updateForLanguage(LanguagesEnum.vi, viKeys);
    await updateForLanguage(LanguagesEnum.zh, zhKeys);

    await this.markScriptAsComplete('add lottery translations', requestingUser);

    return { success: true };
  }

  async anonymizedData(req: ExpressRequest) {
    const page = 1;
    const limit = 500;
    const offset = page * limit - limit;
    const rows: any[] = await this.prisma.$queryRawUnsafe(`select
    a.id,
    a.listing_id,
    a.confirmation_code,
    a.submission_date,
    a.contact_preferences,
    date_part(
        'year',
        age(
            make_date(app.birth_year, app.birth_month, app.birth_day)
        )
    ) as age,
    ad.street,
    ad.city,
    ad.state,
    ad.zip_code,
    a.income,
    a.income_period,
    acc.mobility,
    acc.vision,
    acc.hearing,
    a.household_expecting_changes,
    a.household_student,
    ac.type,
    ac.agency,
    a.income_vouchers,
    d.ethnicity,
    d.race,
    d.how_did_you_hear,
    a.marked_as_duplicate,
    a.preferences,
    a.household_size
from
    applications a,
    applicant app,
    accessibility acc,
    address ad,
    alternate_contact ac,
    demographics d,
    listings l
where
    a.listing_id = l.id
    and l.jurisdiction_id = '3328e8df-e064-4d9c-99cc-467ba43dd2de'
    and a.applicant_id = app.id
    and a.accessibility_id = acc.id
    and app.address_id = ad.id
    and ac.id = a.alternate_contact_id
    and a.demographics_id = d.id
    ORDER BY a.id
    OFFSET ${offset}
    limit ${limit};`);

    const mailingAddresses: any[] = await this.prisma.$queryRaw`select
    a.id,
    a.listing_id,
    a.confirmation_code,
    ad.street,
    ad.city,
    ad.state,
    ad.zip_code
from
    applications a,
    address ad,
    listings l
where
    a.listing_id = l.id
    and l.jurisdiction_id = '3328e8df-e064-4d9c-99cc-467ba43dd2de'
    and ad.id = a.mailing_address_id
    and ad.zip_code != ''
ORDER BY a.id `;

    const uniqueListingIds = [
      ...new Set(rows.map((application) => application.listing_id)),
    ];

    const unitPreferences: { id: string; units: string[] }[] = await this.prisma
      .$queryRawUnsafe(`select
      a.id,
      array_agg(ut.name :: TEXT) as units
  from
      applications a,
      "_ApplicationsToUnitTypes" atut,
      unit_types ut
  where
      a.listing_id in (${uniqueListingIds.map((id) => `'${id}'`)})
      and atut."A" = a.id
      and ut.id = atut."B"
  GROUP BY
      a.id;`);

    console.log(uniqueListingIds);
    const householdMembers: any[] = await this.prisma.$queryRawUnsafe(`select
    a.id,
    json_agg(
        JSON_BUILD_OBJECT(
            'relationship',
            hm.relationship,
            'work_in_region',
            hm.work_in_region,
            'age',
            date_part(
                'year',
                age(
                    make_date(hm.birth_year, hm.birth_month, 28)
                )
            ),
            'same_address',
            hm.same_address,
            'street',
            ad.street,
            'city',
            ad.city,
            'state',
            ad.state,
            'zip_code',
            ad.zip_code
        ) 
    ) as household_members
from
    household_member hm,
    applications a,
    address ad
where
    a.id = hm.application_id
    and a.listing_id in (${uniqueListingIds.map((id) => `'${id}'`)})
    and ad.id = hm.address_id
GROUP BY
    a.id`);

    const multiselectQuestions: any[] = await this.prisma.$queryRaw`select
    distinct mq.text,
    mq.id,
    mq.options
from
    multiselect_questions mq,
    listing_multiselect_questions lmq,
    "_JurisdictionsToMultiselectQuestions" jmq,
    applications a
where
    jmq."A" = '3328e8df-e064-4d9c-99cc-467ba43dd2de'
    and jmq."B" = mq.id
    and mq.id = lmq.multiselect_question_id
    and a.listing_id = lmq.listing_id;`;

    const now = new Date().getTime();

    const filename = join(
      process.cwd(),
      `src/temp/addresses-${now}-${page}.csv`,
    );

    console.log('file name', filename);
    const fileCreation = await new Promise<void>(async (resolve, reject) => {
      const writableStream = fs.createWriteStream(filename);
      writableStream
        .on('close', () => {
          resolve();
        })
        .on('open', async () => {
          rows.forEach((row, index) => {
            writableStream.write(
              `${index + 1},"${row.street.replace(/"/g, `""`)}",${row.city},${
                row.state
              },${row.zip_code},${row.id}\n`,
            );
          });
          writableStream.end();
        });
    });

    const censusData = fs.readFileSync(
      '/Users/morganludtke/Projects/bay-area/bloom/api/src/temp/addresses-1726151307248-1-results.csv',
    );
    const mailingAddressesData = fs.readFileSync(
      '/Users/morganludtke/Projects/bay-area/bloom/api/src/temp/mailing_addresses.csv',
    );
    const csvData = parse(censusData, {
      skip_empty_lines: true,
      relaxColumnCount: true,
    });
    const mailingAddressData = parse(mailingAddressesData, {
      skip_empty_lines: true,
      relaxColumnCount: true,
    });

    const filename2 = join(
      process.cwd(),
      `src/temp/addresses-results-${now}-${page}.csv`,
    );

    const headers = [
      'id',
      'confirmation code',
      'submission date',
      'contact preferences',
      'primary census tract',
      'mailing census tract',
      'work census tract',
      'age',
      'household student',
      'income',
      'income period',
      'mobility',
      'vision',
      'hearing',
      'expecting changes',
      'alternate contact type',
      'alternate contact agency',
      'income vouchers',
      'requested unit types',
      'marked as duplicate',
      'ethnicity,race',
      'how did you hear?',
    ];

    multiselectQuestions.forEach((question) => {
      headers.push(`preference ${question.text}`);
      question.options.forEach((option) => {
        if (option.collectAddress) {
          headers.push(
            `preference ${question.text} - ${option.text} - Address`,
          );
        }
        if (option.collectName) {
          headers.push(`preference ${question.text} - ${option.text} - Name`);
        }
        if (option.collectRelationship) {
          headers.push(
            `preference ${question.text} - ${option.text} - Relationship`,
          );
        }
      });
    });

    const maxHouseholdSize = householdMembers.reduce(
      (maxSize, applicationGroup) => {
        if (maxSize < applicationGroup.household_members.length) {
          return applicationGroup.household_members.length;
        }
        return maxSize;
      },
      0,
    );

    for (let currentSize = 1; currentSize <= maxHouseholdSize; currentSize++) {
      headers.push(`household member (${currentSize}) age`);
      headers.push(
        `household member (${currentSize}) same as primary applicant`,
      );
      headers.push(`household member (${currentSize}) relationship`);
      headers.push(`household member (${currentSize}) work in region`);
      headers.push(`household member (${currentSize}) census tract`);
    }

    const fileCreation2 = await new Promise<void>(async (resolve, reject) => {
      const writableStream = fs.createWriteStream(filename2);
      writableStream
        .on('close', () => {
          resolve();
        })
        .on('open', async () => {
          writableStream.write(`${headers.join(',')}\n`);
          rows?.forEach((row, index) => {
            const unitType = unitPreferences.find(
              (value) => value.id === row.id,
            );
            const censusRow = csvData?.find((cRow) => {
              return Number(cRow[0]) === index + 1;
            });
            const applicationHouseholdMembers = householdMembers.find(
              (member) => member.id === row.id,
            );
            const foundMailingAddressId = mailingAddresses.findIndex(
              (address) => address.id === row.id,
            );
            let mailingAddressCensusTract = '';
            if (foundMailingAddressId >= 0) {
              console.log('index', foundMailingAddressId);
              const foundMailingData = mailingAddressData.find(
                (address) => Number(address[0]) === foundMailingAddressId + 1,
              );
              mailingAddressCensusTract =
                foundMailingData?.length >= 10
                  ? foundMailingData[10]
                  : 'unknown';
            }
            const columnData = [
              `${row.id}`,
              `${row.confirmation_code}`,
              `${
                row.submission_date
                  ? formatLocalDate(
                      row.submission_date,
                      'MM-DD-YYYY hh:mm:ssA z',
                      process.env.TIME_ZONE,
                    )
                  : ''
              }`,
              `"${row.contact_preferences.join(',').replace(/"/g, `""`)}"`,
              `${censusRow?.length >= 10 ? censusRow[10] : 'unknown'}`,
              mailingAddressCensusTract,
              'TBD', // TODO: work address census
              `${row.age}`,
              `${row.household_student}`,
              `${row.income}`,
              `${row.income_period}`,
              `${row.mobility}`,
              `${row.vision}`,
              `${row.hearing}`,
              `${row.household_expecting_changes}`,
              `${row.type}`,
              `${row.agency}`,
              `${row.income_vouchers}`,
              `${unitType ? unitType.units.join(';') : ' '}`,
              `${row.marked_as_duplicate || ''}`,
              `${row.ethnicity}`,
              `"${row.race
                .map((r) => convertDemographicRaceToReadable(r))
                .join(';')
                .replace(/"/g, `""`)}"`,
              `"${row.how_did_you_hear.join(',').replace(/"/g, `""`)}"`,
            ];
            multiselectQuestions.forEach((question) => {
              const foundPreference = row.preferences.find(
                (pref) => pref.key === question.text,
              );
              if (foundPreference && foundPreference.claimed) {
                let constructedClaimedString = [];
                foundPreference.options.forEach((option) => {
                  if (option.checked) {
                    constructedClaimedString.push(option.key);
                  }
                });
                columnData.push(
                  `"${constructedClaimedString.join(',').replace(/"/g, `""`)}"`,
                );
                question.options.forEach((option) => {
                  const foundOption = foundPreference.options.find(
                    (opt) => opt.key === option.text,
                  );
                  if (option.collectAddress) {
                    const foundExtraData = foundOption.extraData.find(
                      (extraData) => extraData.key === 'address',
                    );
                    columnData.push(
                      foundExtraData ? 'TBD' : '', // TODO: convert to census tract
                    );
                  }
                  if (option.collectName) {
                    const foundExtraData = foundOption.extraData.find(
                      (extraData) => extraData.key === 'addressHolderName',
                    );
                    columnData.push(foundExtraData ? foundExtraData.value : '');
                  }
                  if (option.collectRelationship) {
                    const foundExtraData = foundOption.extraData.find(
                      (extraData) =>
                        extraData.key === 'addressHolderRelationship',
                    );
                    columnData.push(foundExtraData ? foundExtraData.value : '');
                  }
                });
              } else {
                columnData.push('');
                question.options.forEach((option) => {
                  if (option.collectAddress) {
                    columnData.push('');
                  }
                  if (option.collectName) {
                    columnData.push('');
                  }
                  if (option.collectRelationship) {
                    columnData.push('');
                  }
                });
              }
            });
            for (
              let currentSize = 1;
              currentSize <= maxHouseholdSize;
              currentSize++
            ) {
              if (
                applicationHouseholdMembers?.household_members &&
                applicationHouseholdMembers.household_members[currentSize - 1]
              ) {
                columnData.push(
                  applicationHouseholdMembers.household_members[currentSize - 1]
                    .age,
                );
                columnData.push(
                  applicationHouseholdMembers.household_members[currentSize - 1]
                    .same_address,
                );
                columnData.push(
                  applicationHouseholdMembers.household_members[currentSize - 1]
                    .relationship,
                );
                columnData.push(
                  applicationHouseholdMembers.household_members[currentSize - 1]
                    .work_in_region,
                );
                columnData.push(
                  applicationHouseholdMembers.household_members[currentSize - 1]
                    .same_address === 'no'
                    ? 'TBD'
                    : '',
                ); // TODO: census tract
              } else {
                columnData.push('');
                columnData.push('');
                columnData.push('');
                columnData.push('');
                columnData.push('');
              }
            }
            writableStream.write(`${columnData.join(',')}\n`);
          });
          writableStream.end();
        });
    });

    // console.log('filename', basename(filename));
    // const formData = new FormData();
    // formData.append('vintage', '4');
    // formData.append('benchmark', '4');
    // formData.append('addressFile', fs.readFileSync(filename), {
    //   filename: basename(filename),
    //   filepath: filename,
    // });
    // // formData.
    // const geoInfo = await firstValueFrom(
    //   this.httpService.post(
    //     'https://geocoding.geo.census.gov/geocoder/geographies/addressbatch',
    //     {
    //       // url: 'https://geocoding.geo.census.gov/geocoder/geographies/addressbatch',
    //       method: 'POST' as Method,
    //       // headers: { Accept: '*/*' },
    //       data: formData,
    //     },
    //   ),
    // );

    // console.log(geoInfo);

    return { success: 'true' };
  }

  /**
    this is simply an example
  */
  async example(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('example', requestingUser);
    const rawJurisdictions = await this.prisma.jurisdictions.findMany();
    await this.markScriptAsComplete('example', requestingUser);
    return { success: !!rawJurisdictions.length };
  }

  // |------------------ HELPERS GO BELOW ------------------ | //

  /**
   *
   * @param scriptName the name of the script that is going to be run
   * @param userTriggeringTheRun the user that is attempting to trigger the script run
   * @description this checks to see if the script has already ran, if not marks the script in the db
   */
  async markScriptAsRunStart(
    scriptName: string,
    userTriggeringTheRun: User,
  ): Promise<void> {
    // check to see if script is already ran in db
    const storedScriptRun = await this.prisma.scriptRuns.findUnique({
      where: {
        scriptName,
      },
    });

    if (storedScriptRun?.didScriptRun) {
      // if script run has already successfully completed throw already succeed error
      throw new BadRequestException(
        `${scriptName} has already been run and succeeded`,
      );
    } else if (storedScriptRun?.didScriptRun === false) {
      // if script run was attempted but failed, throw attempt already failed error
      throw new BadRequestException(
        `${scriptName} has an attempted run and it failed, or is in progress. If it failed, please delete the db entry and try again`,
      );
    } else {
      // if no script run has been attempted create script run entry
      await this.prisma.scriptRuns.create({
        data: {
          scriptName,
          triggeringUser: userTriggeringTheRun.id,
        },
      });
    }
  }

  /**
   *
   * @param scriptName the name of the script that is going to be run
   * @param userTriggeringTheRun the user that is setting the script run as successfully completed
   * @description this marks the script run entry in the db as successfully completed
   */
  async markScriptAsComplete(
    scriptName: string,
    userTriggeringTheRun: User,
  ): Promise<void> {
    await this.prisma.scriptRuns.update({
      data: {
        didScriptRun: true,
        triggeringUser: userTriggeringTheRun.id,
      },
      where: {
        scriptName,
      },
    });
  }
}

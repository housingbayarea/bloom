import { Injectable } from "@nestjs/common"
import { Application } from "./entities/application.entity"
import { ApplicationUpdateDto } from "./dto/application.dto"
import { User } from "../user/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { paginate, Pagination } from "nestjs-typeorm-paginate"
import { ApplicationsListQueryParams } from "./applications.controller"
import { ApplicationFlaggedSetsService } from "../application-flagged-sets/application-flagged-sets.service"

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationFlaggedSetsService: ApplicationFlaggedSetsService,
    @InjectRepository(Application) private readonly repository: Repository<Application>
  ) {}

  public async list(listingId: string | null, user?: User) {
    return this.repository.find({
      where: {
        ...(user && { user: { id: user.id } }),
        // Workaround for params.listingId resulting in:
        // listing: {id: undefined}
        // and query responding with 0 applications.
        ...(listingId && { listing: { id: listingId } }),
      },
      relations: ["listing", "user"],
      order: {
        createdAt: "DESC",
      },
    })
  }

  /**
   * Get paginated list of Application entity
   *
   * @param params: ApplicationsListQueryParams
   * @returns Promise<Pagination<Application>>
   */
  async listPaginated(params: ApplicationsListQueryParams): Promise<Pagination<Application>> {
    /**
     * Map used to generate proper parts
     * of query builder.
     */
    const paramsMap = {
      userId: (qb, { userId }) => qb.andWhere("user.id = :id", { id: userId }),
      listingId: (qb, { listingId }) => qb.andWhere("listing.id = :id", { id: listingId }),
      orderBy: (qb, { orderBy, order }) => qb.orderBy(orderBy, order),
      search: (qb, { search }) =>
        qb.andWhere(
          `to_tsvector('english', REGEXP_REPLACE(concat_ws(' ', applicant, alternateContact.emailAddress), '[_]|[-]', '/', 'g')) @@ to_tsquery(CONCAT(CAST(plainto_tsquery(REGEXP_REPLACE(:search, '[_]|[-]', '/', 'g')) as text), ':*'))`,
          {
            search,
          }
        ),
    }

    // --> Build main query
    const qb = this.repository.createQueryBuilder("application")
    qb.leftJoinAndSelect("application.user", "user")
    qb.leftJoinAndSelect("application.listing", "listing")
    qb.leftJoinAndSelect("application.applicant", "applicant")
    qb.leftJoinAndSelect("applicant.address", "applicant_address")
    qb.leftJoinAndSelect("applicant.workAddress", "applicant_workAddress")
    qb.leftJoinAndSelect("application.alternateAddress", "alternateAddress")
    qb.leftJoinAndSelect("application.mailingAddress", "mailingAddress")
    qb.leftJoinAndSelect("application.alternateContact", "alternateContact")
    qb.leftJoinAndSelect("alternateContact.mailingAddress", "alternateContact_mailingAddress")
    qb.leftJoinAndSelect("application.accessibility", "accessibility")
    qb.leftJoinAndSelect("application.demographics", "demographics")
    qb.leftJoinAndSelect("application.householdMembers", "householdMembers")
    qb.leftJoinAndSelect("householdMembers.address", "householdMembers_address")
    qb.leftJoinAndSelect("householdMembers.workAddress", "householdMembers_workAddress")
    qb.where("application.id IS NOT NULL")

    // --> Build additional query builder parts
    Object.keys(paramsMap).forEach((paramKey) => {
      if (params[paramKey]) {
        paramsMap[paramKey](qb, params)
      }
    })

    return paginate(qb, { limit: params.limit, page: params.page })
  }

  async create(applicationCreateDto: ApplicationUpdateDto, user?: User) {
    const application = await this.repository.save({
      ...applicationCreateDto,
      user,
    })
    await this.applicationFlaggedSetsService.onApplicationSave(application)
    return application
  }

  async findOne(applicationId: string) {
    return await this.repository.findOneOrFail({
      where: {
        id: applicationId,
      },
      relations: ["listing", "user"],
    })
  }

  async update(applicationUpdateDto: ApplicationUpdateDto, existing?: Application) {
    const application =
      existing ||
      (await this.repository.findOneOrFail({
        where: { id: applicationUpdateDto.id },
        relations: ["listing", "user"],
      }))
    Object.assign(application, {
      ...applicationUpdateDto,
      id: application.id,
    })

    await this.repository.save(application)
    return application
  }

  async delete(applicationId: string) {
    return await this.repository.softRemove({ id: applicationId })
  }
}

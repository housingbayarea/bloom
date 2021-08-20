import { SeederModule } from "./seeder/seeder.module"
import { NestFactory } from "@nestjs/core"
import yargs from "yargs"
import { UserService } from "./auth/services/user.service"
import { plainToClass } from "class-transformer"
import { UserCreateDto } from "./auth/dto/user.dto"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User } from "./auth/entities/user.entity"
import { makeNewApplication } from "./seeds/applications"
import { INestApplicationContext } from "@nestjs/common"
import { ListingDefaultSeed } from "./seeds/listings/listing-default-seed"
import { defaultLeasingAgents } from "./seeds/listings/shared"
import { Listing } from "./listings/entities/listing.entity"
import { ListingColiseumSeed } from "./seeds/listings/listing-coliseum-seed"
import { ListingDefaultOpenSoonSeed } from "./seeds/listings/listing-default-open-soon"
import { ListingDefaultOnePreferenceSeed } from "./seeds/listings/listing-default-one-preference-seed"
import { ListingDefaultNoPreferenceSeed } from "./seeds/listings/listing-default-no-preference-seed"
import { ListingTritonSeed } from "./seeds/listings/listing-triton-seed"
import { ListingDefaultBmrChartSeed } from "./seeds/listings/listing-default-bmr-chart-seed"
import { ApplicationMethodsService } from "./application-methods/application-methods.service"
import { ApplicationMethodType } from "./application-methods/types/application-method-type-enum"
import { AuthContext } from "./auth/types/auth-context"
import { ListingDefaultReservedSeed } from "./seeds/listings/listing-default-reserved-seed"
import { ListingDefaultFCFSSeed } from "./seeds/listings/listing-default-fcfs-seed"
import { UserRoles } from "./auth/entities/user-roles.entity"
import { ListingDefaultMultipleAMI } from "./seeds/listings/listing-default-multiple-ami"
import { ListingDefaultMultipleAMIAndPercentages } from "./seeds/listings/listing-default-multiple-ami-and-percentages"

const argv = yargs.scriptName("seed").options({
  test: { type: "boolean", default: false },
}).argv

// Note: if changing this list of seeds, you must also change the
// number in listings.e2e-spec.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listingSeeds: any[] = [
  ListingDefaultSeed,
  ListingColiseumSeed,
  ListingDefaultOpenSoonSeed,
  ListingDefaultOnePreferenceSeed,
  ListingDefaultNoPreferenceSeed,
  ListingDefaultNoPreferenceSeed,
  ListingDefaultBmrChartSeed,
  ListingTritonSeed,
  ListingDefaultReservedSeed,
  ListingDefaultFCFSSeed,
  ListingDefaultMultipleAMI,
  ListingDefaultMultipleAMIAndPercentages,
]

export function getSeedListingsCount() {
  return listingSeeds.length
}

export async function createLeasingAgents(
  app: INestApplicationContext,
  rolesRepo: Repository<UserRoles>
) {
  const usersService = await app.resolve<UserService>(UserService)
  const leasingAgents = await Promise.all(
    defaultLeasingAgents.map(
      async (leasingAgent) => await usersService.createUser(leasingAgent, new AuthContext(null))
    )
  )
  await Promise.all([
    leasingAgents.map(async (agent: User) => {
      const roles: UserRoles = { user: agent, isPartner: true }
      await rolesRepo.save(roles)
      await usersService.confirm({ token: agent.confirmationToken })
    }),
  ])
  return leasingAgents
}

const seedListings = async (app: INestApplicationContext, rolesRepo: Repository<UserRoles>) => {
  const seeds = []
  const leasingAgents = await createLeasingAgents(app, rolesRepo)

  const allSeeds = listingSeeds.map((listingSeed) => app.get<ListingDefaultSeed>(listingSeed))
  const listingRepository = app.get<Repository<Listing>>(getRepositoryToken(Listing))
  const applicationMethodsService = await app.resolve<ApplicationMethodsService>(
    ApplicationMethodsService
  )

  for (const [index, listingSeed] of allSeeds.entries()) {
    const everyOtherAgent = index % 2 ? leasingAgents[0] : leasingAgents[1]
    const listing = await listingSeed.seed()
    listing.leasingAgents = [everyOtherAgent]
    const applicationMethods = await applicationMethodsService.create({
      type: ApplicationMethodType.Internal,
      acceptsPostmarkedApplications: false,
      externalReference: "",
      label: "Label",
      paperApplications: [],
      listing: listing,
    })
    listing.applicationMethods = [applicationMethods]
    await listingRepository.save(listing)

    seeds.push(listing)
  }

  return seeds
}

async function seed() {
  const app = await NestFactory.create(SeederModule.forRoot({ test: argv.test }))
  // Starts listening for shutdown hooks
  app.enableShutdownHooks()
  const userService = await app.resolve<UserService>(UserService)

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User))
  const rolesRepo = app.get<Repository<UserRoles>>(getRepositoryToken(UserRoles))
  const listings = await seedListings(app, rolesRepo)

  const user1 = await userService.createUser(
    plainToClass(UserCreateDto, {
      email: "test@example.com",
      emailConfirmation: "test@example.com",
      firstName: "First",
      middleName: "Mid",
      lastName: "Last",
      dob: new Date(),
      password: "abcdef",
      passwordConfirmation: "Abcdef1!",
    }),
    new AuthContext(null)
  )
  await userService.confirm({ token: user1.confirmationToken })

  const user2 = await userService.createUser(
    plainToClass(UserCreateDto, {
      email: "test2@example.com",
      emailConfirmation: "test2@example.com",
      firstName: "Second",
      middleName: "Mid",
      lastName: "Last",
      dob: new Date(),
      password: "ghijkl",
      passwordConfirmation: "Ghijkl1!",
    }),
    new AuthContext(null)
  )
  await userService.confirm({ token: user2.confirmationToken })

  const admin = await userService.createUser(
    plainToClass(UserCreateDto, {
      email: "admin@example.com",
      emailConfirmation: "admin@example.com",
      firstName: "Second",
      middleName: "Mid",
      lastName: "Last",
      dob: new Date(),
      password: "abcdef",
      passwordConfirmation: "Abcdef1!",
    }),
    new AuthContext(null)
  )

  for (let i = 0; i < 10; i++) {
    for (const listing of listings) {
      await Promise.all([
        await makeNewApplication(app, listing, user1),
        await makeNewApplication(app, listing, user2),
      ])
    }
  }

  await userRepo.save(admin)
  const roles: UserRoles = { user: admin, isPartner: true, isAdmin: true }
  await rolesRepo.save(roles)

  await userService.confirm({ token: admin.confirmationToken })
  await app.close()
}

void seed()

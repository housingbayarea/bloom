import { Test } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import supertest from "supertest"
import { applicationSetup } from "../../src/app.module"
import { AuthModule } from "../../src/auth/auth.module"
import { ApplicationsModule } from "../../src/applications/applications.module"
import { ListingsModule } from "../../src/listings/listings.module"
import { EmailService } from "../../src/shared/email.service"
import { getUserAccessToken } from "../utils/get-user-access-token"
import { setAuthorization } from "../utils/set-authorization-helper"
import {
  Application,
  ApplicationCreate,
  ApplicationStatus,
  ApplicationSubmissionType,
  IncomePeriod,
  Language,
} from "@bloom-housing/core"
// Use require because of the CommonJS/AMD style export.
// See https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
import dbOptions = require("../../ormconfig.test")

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect

describe("Applications", () => {
  let app: INestApplication
  let user1AccessToken: string
  let user2AccessToken: string
  let adminAccessToken: string
  let listingId: string

  const getTestAppBody: () => ApplicationCreate = () => {
    return {
      appUrl: "",
      listing: {
        id: listingId,
      },
      application: {
        language: Language.en,
        status: ApplicationStatus.submitted,
        submissionType: ApplicationSubmissionType.electronical,
        acceptedTerms: false,
        applicant: {
          firstName: "",
          middleName: "",
          lastName: "",
          birthMonth: "",
          birthDay: "",
          birthYear: "",
          emailAddress: "",
          noEmail: false,
          phoneNumber: "",
          phoneNumberType: "",
          noPhone: false,
          workInRegion: null,
          address: {
            street: "",
            street2: "",
            city: "",
            state: "",
            zipCode: "",
            county: "",
            latitude: null,
            longitude: null,
          },
          workAddress: {
            street: "",
            street2: "",
            city: "",
            state: "",
            zipCode: "",
            county: "",
            latitude: null,
            longitude: null,
          },
        },
        additionalPhone: true,
        additionalPhoneNumber: "12345",
        additionalPhoneNumberType: "cell",
        contactPreferences: ["a", "b"],
        householdSize: 1,
        housingStatus: "status",
        sendMailToMailingAddress: true,
        mailingAddress: {
          street: "",
          street2: "",
          city: "",
          state: "",
          zipCode: "",
        },
        alternateAddress: {
          street: "",
          street2: "",
          city: "",
          state: "",
          zipCode: "",
        },
        alternateContact: {
          type: "",
          otherType: "",
          firstName: "",
          lastName: "",
          agency: "",
          phoneNumber: "",
          emailAddress: "",
          mailingAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
        },
        accessibility: {
          mobility: null,
          vision: null,
          hearing: null,
        },
        demographics: {
          ethnicity: "",
          race: "",
          gender: "",
          sexualOrientation: "",
          howDidYouHear: [],
        },
        incomeVouchers: true,
        income: "100.00",
        incomePeriod: IncomePeriod.perYear,
        householdMembers: [],
        preferredUnit: ["a", "b"],
        preferences: {
          liveIn: false,
          none: false,
          workIn: false,
        },
      },
    }
  }

  beforeAll(async () => {
    /* eslint-disable @typescript-eslint/no-empty-function */
    const testEmailService = { confirmation: async () => {} }
    /* eslint-enable @typescript-eslint/no-empty-function */
    const moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(dbOptions), AuthModule, ListingsModule, ApplicationsModule],
    })
      .overrideProvider(EmailService)
      .useValue(testEmailService)
      .compile()
    app = moduleRef.createNestApplication()
    app = applicationSetup(app)
    await app.init()

    user1AccessToken = await getUserAccessToken(app, "test@example.com", "abcdef")

    user2AccessToken = await getUserAccessToken(app, "test2@example.com", "ghijkl")

    adminAccessToken = await getUserAccessToken(app, "admin@example.com", "abcdef")

    const res = await supertest(app.getHttpServer()).get("/listings").expect(200)
    listingId = res.body.listings[0].id
  })

  it(`/GET `, async () => {
    const res = await supertest(app.getHttpServer())
      .get(`/applications`)
      .set(...setAuthorization(user1AccessToken))
      .expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items.length).toBe(1)
  })

  it(`/POST `, async () => {
    const body = getTestAppBody()
    const res = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
    expect(res.body).toEqual(expect.objectContaining(body))
    expect(res.body).toHaveProperty("createdAt")
    expect(res.body).toHaveProperty("updatedAt")
    expect(res.body).toHaveProperty("id")
  })

  it(`/GET by id`, async () => {
    const body = getTestAppBody()
    const createRes = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
      .expect(201)
    expect(createRes.body).toEqual(expect.objectContaining(body))
    expect(createRes.body).toHaveProperty("createdAt")
    expect(createRes.body).toHaveProperty("updatedAt")
    expect(createRes.body).toHaveProperty("id")
    const res = await supertest(app.getHttpServer())
      .get(`/applications/${createRes.body.id}`)
      .set(...setAuthorization(user1AccessToken))
      .expect(200)
    expect(res.body.id === createRes.body.id)
  })

  it(`/POST unauthenticated`, async () => {
    const body = getTestAppBody()
    const res = await supertest(app.getHttpServer()).post(`/applications`).send(body).expect(201)
    expect(res.body).toEqual(expect.objectContaining(body))
    expect(res.body).toHaveProperty("createdAt")
    expect(res.body).toHaveProperty("updatedAt")
    expect(res.body).toHaveProperty("id")
  })

  it(`/DELETE `, async () => {
    const body = getTestAppBody()
    const createRes = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
      .expect(201)
    await supertest(app.getHttpServer())
      .delete(`/applications/${createRes.body.id}`)
      .set(...setAuthorization(adminAccessToken))
      .expect(200)
    await supertest(app.getHttpServer())
      .get(`/applications/${createRes.body.id}`)
      .set(...setAuthorization(user1AccessToken))
      .expect(404)
  })

  it(`/DELETE user 2 unauthorized to delete user 1 application`, async () => {
    const body = getTestAppBody()
    const createRes = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
      .expect(201)
    await supertest(app.getHttpServer())
      .delete(`/applications/${createRes.body.id}`)
      .set(...setAuthorization(user2AccessToken))
      .expect(403)
  })

  it(`/PUT `, async () => {
    const body = getTestAppBody()
    const createRes = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
      .expect(201)
    expect(createRes.body).toEqual(expect.objectContaining(body))
    const newBody = getTestAppBody() as Application
    newBody.id = createRes.body.id
    const putRes = await supertest(app.getHttpServer())
      .put(`/applications/${createRes.body.id}`)
      .send(newBody)
      .set(...setAuthorization(adminAccessToken))
      .expect(200)
    expect(putRes.body).toEqual(expect.objectContaining(newBody))
  })

  it(`/PUT user 2 unauthorized to edit user 1 application`, async () => {
    const body = getTestAppBody()
    const createRes = await supertest(app.getHttpServer())
      .post(`/applications`)
      .send(body)
      .set(...setAuthorization(user1AccessToken))
      .expect(201)
    expect(createRes.body).toEqual(expect.objectContaining(body))
    const newBody = getTestAppBody() as Application
    newBody.id = createRes.body.id
    await supertest(app.getHttpServer())
      .put(`/applications/${createRes.body.id}`)
      .send(newBody)
      .set(...setAuthorization(user2AccessToken))
      .expect(403)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })
})

import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import fs from "fs"
import path from "path"
import { Listing } from "@bloom-housing/core"
import { ListingsModule } from "../../src/listings/listings.module"
import supertest from "supertest"
import { applicationSetup } from "../../src/app.module"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbOptions = require("../../ormconfig.test")

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect

// Get listings from the seed used by `yarn seed:test`
const allListings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../seeds.json")).toString()
) as Listing[]

describe("Listings", () => {
  let app
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(dbOptions), ListingsModule],
    }).compile()
    app = moduleRef.createNestApplication()
    app = applicationSetup(app)
    await app.init()
  })

  it("should return all listings", async () => {
    const res = await supertest(app.getHttpServer()).get("/listings").expect(200)
    expect(res.body.listings.length).toEqual(allListings.length)
  })

  it("should return only the specified listings", async () => {
    const query = "/?jsonpath=%24%5B%3F%28%40.applicationAddress.city%3D%3D%22San%20Jose%22%29%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    const sjListings = allListings.filter((item) => item.applicationAddress.city == "San Jose")
    expect(res.body.listings.length).toEqual(sjListings.length)
  })

  it("shouldn't return any listings for incorrect query", async () => {
    const query = "/?jsonpath=%24%5B%3F(%40.applicationNONSENSE.argh%3D%3D%22San+Jose%22)%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    expect(res.body.listings.length).toEqual(0)
  })

  it("should return only active listings", async () => {
    const query = "/?jsonpath=%24%5B%3F%28%40.status%3D%3D%22active%22%29%5D"
    const res = await supertest(app.getHttpServer()).get(`/listings${query}`).expect(200)
    // One listing has unapproved status.
    expect(res.body.listings.length).toEqual(allListings.length - 1)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })
})

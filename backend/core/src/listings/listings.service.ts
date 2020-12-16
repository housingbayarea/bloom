import { Injectable } from "@nestjs/common"
import jp from "jsonpath"

import { Listing } from "../entity/listing.entity"
import { ListingCreateDto, ListingUpdateDto } from "./listing.dto"

export enum ListingsResponseStatus {
  ok = "ok",
}

@Injectable()
export class ListingsService {
  public async list(jsonpath?: string): Promise<Listing[]> {
    let listings = await Listing.createQueryBuilder("listings")
      .leftJoinAndSelect("listings.preferences", "preferences")
      .leftJoinAndSelect("listings.applicationMethods", "applicationMethods")
      .leftJoinAndSelect("listings.assets", "assets")
      .leftJoinAndSelect("listings.events", "events")
      .leftJoinAndSelect("listings.property", "property")
      .leftJoinAndSelect("property.buildingAddress", "buildingAddress")
      .leftJoinAndSelect("property.units", "units")
      .leftJoinAndSelect("units.amiChart", "amiChart")
      .leftJoinAndSelect("amiChart.items", "amiChartItems")
      .orderBy({
        "listings.id": "DESC",
        "units.max_occupancy": "ASC",
        "preferences.ordinal": "ASC",
      })
      .getMany()

    if (jsonpath) {
      listings = jp.query(listings, jsonpath)
    }
    return listings
  }

  async create(listingDto: ListingCreateDto) {
    return Listing.save(listingDto)
  }

  async update(listingDto: ListingUpdateDto) {
    const listing = await Listing.findOneOrFail({
      where: { id: listingDto.id },
    })
    Object.assign(listing, listingDto)
    await listing.save()
    return listing
  }

  async delete(listingId: string) {
    const listing = await Listing.findOneOrFail({
      where: { id: listingId },
    })
    return await Listing.remove(listing)
  }

  async findOne(listingId: string) {
    return await Listing.createQueryBuilder("listings")
      .where("listings.id = :id", { id: listingId })
      .leftJoinAndSelect("listings.preferences", "preferences")
      .leftJoinAndSelect("listings.applicationMethods", "applicationMethods")
      .leftJoinAndSelect("listings.assets", "assets")
      .leftJoinAndSelect("listings.events", "events")
      .leftJoinAndSelect("listings.property", "property")
      .leftJoinAndSelect("property.buildingAddress", "buildingAddress")
      .leftJoinAndSelect("property.units", "units")
      .leftJoinAndSelect("units.amiChart", "amiChart")
      .leftJoinAndSelect("amiChart.items", "amiChartItems")
      .orderBy({
        "preferences.ordinal": "ASC",
      })
      .getOne()
  }
}

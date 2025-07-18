-- AlterTable
ALTER TABLE
    "jurisdictions"
ADD
    COLUMN IF NOT EXISTS "required_listing_fields" TEXT [] DEFAULT ARRAY [] :: TEXT [];

-- Set the HBA values for the required listing fields
UPDATE
    "jurisdictions"
SET
    "required_listing_fields" = '{"name",
    "listingsBuildingAddress",
    "name",
    "developer",
    "listingImages",
    "leasingAgentEmail",
    "leasingAgentName",
    "leasingAgentPhone",
    "jurisdictions",
    "units",
    "digitalApplication",
    "paperApplication",
    "referralOpportunity",
    "rentalAssistance",
    "applicationDueDate" }' :: TEXT [];
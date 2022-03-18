ALTER TABLE Category ALTER COLUMN Icon TYPE varchar;
ALTER TABLE Media ADD CONSTRAINT "unique_usr" UNIQUE (UserID);
ALTER TABLE Media ADD CONSTRAINT "unique_msg" UNIQUE (MessageID);
ALTER TABLE Media DROP CONSTRAINT "media_index_userid_listingid_messageid_key";
ALTER TABLE Media ADD CONSTRAINT "unique_lst" UNIQUE (Index, ListingID);

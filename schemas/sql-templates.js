const SQLTemplate = require('../classes/sqltemplate');

/**
 * Some things to bear in mind when creating these:
 *  1. Create queries should always return in their final row the IDs of the accounts who are affected by this change
 */

const ListCategoryTemplate = new SQLTemplate({
    get_categories: {
        text: 'SELECT * FROM Category',
    }
}, ['get_categories']);

const CloseAccountTemplate = new SQLTemplate({
    close_account: {
        text: 'UPDATE Account SET DeletionDate = CURRENT_TIMESTAMP WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        values: [{
            from_input: 'accountID',
        }],
    },
}, ['close_account'], {error_on_empty_response: true});

const LoginTemplate = new SQLTemplate({
    get_id: {
        text: 'SELECT UserID FROM Account WHERE Email = $1',
        condition: (inputObject) => ('device_token' in inputObject),
        values: [{
            from_input: 'email',
        }],
    },
    store_token: {
        text: 'INSERT INTO PushToken (DeviceToken, UserID) VALUES ($1, $2) ON CONFLICT (DeviceToken) DO UPDATE SET UserID = EXCLUDED.UserID, Time = CURRENT_TIMESTAMP',
        condition: (inputObject) => ('device_token' in inputObject),
        values: [{
            from_input: 'device_token',
        }, {
            from_query: ['get_id', 'userid'],
        }],
    },
}, ['get_id', 'store_token']);

const ViewAccountListingTemplate = new SQLTemplate({
    get_listing: {
        text: 'SELECT Title, Description, Condition, Country, PostCode, CategoryName, Icon, Colour FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID INNER JOIN Category ON Listing.CategoryID = Category.CategoryID WHERE ListingID = $1 AND (ClosedDate IS NULL OR ContributorID = $2 OR ReceiverID = $2)',
        values: [{
            from_input: 'listingID',
        }, {
            from_input: 'accountID',
        }]
    },
    get_media: {
        text: 'SELECT MimeType, URL FROM Media WHERE ListingID = $1 ORDER BY Index',
        values: [{
            from_input: 'listingID',
        }]
    }
}, ['get_listing', 'get_media'], {error_on_empty_response: true})

const AddressTemplate = new SQLTemplate({
    get_addresses: {
        text: 'SELECT * FROM Address WHERE UserID = $1',
        values: [{
            from_input: 'accountID',
        }],
    },
}, ['get_addresses']);

const ViewListingTemplate = new SQLTemplate({
    get_listing_auth: {
        text: 'SELECT Title, Description, Condition, Country, PostCode, CategoryName, Icon, Colour FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID INNER JOIN Category ON Listing.CategoryID = Category.CategoryID WHERE ListingID = $1 AND (ClosedDate IS NULL OR ContributorID = $2 OR ReceiverID = $2)',
        condition: (inputObject) => ('accountID' in inputObject),
        values: [{
            from_input: 'listingID',
        }, {
            from_input: 'accountID',
        }]
    },
    get_listing_noauth: {
        text: 'SELECT Title, Description, Condition, Country, PostCode, CategoryName, Icon, Colour FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID INNER JOIN Category ON Listing.CategoryID = Category.CategoryID WHERE ListingID = $1 AND ClosedDate IS NULL',
        condition: (inputObject) => (!('accountID' in inputObject)),
        values: [{
            from_input: 'listingID',
        }]
    },
    get_media: {
        text: 'SELECT MimeType, URL FROM Media WHERE ListingID = $1 ORDER BY Index',
        values: [{
            from_input: 'listingID',
        }]
    }
}, ['get_listing_auth', 'get_listing_noauth', 'get_media'], {error_on_empty_response: true});

const SearchListingTemplate = new SQLTemplate({
    get_listing_desc: {
        text: 'SELECT ListingID, ContributorID, Title, Description, Condition, Country, PostCode, MimeType, URL FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID JOIN Media ON Media.MediaID = (SELECT TOP 1 Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index) WHERE CategoryID = $1 AND ClosedDate IS NULL',
        condition: (inputObject) => (!('accountID' in inputObject)),
        values: [
            {from_input: 'categoryID'},
        ],
    },
    get_listing_desc_auth: {
        text: 'SELECT ListingID, ContributorID, Title, Description, Condition, Country, PostCode, MimeType, URL FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID JOIN Media ON Media.MediaID = (SELECT TOP 1 Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index) WHERE CategoryID = $1 AND ClosedDate IS NULL AND ContributorID != $2',
        condition: (inputObject) => ('accountID' in inputObject),
        values: [
            {from_input: 'categoryID'},
            {from_input: 'accountID'},
        ],
    },
}, ['get_listing_desc', 'get_listing_desc_auth']);

const CreateListingTemplate = new SQLTemplate({
    create_address: {
        text: 'INSERT INTO Address (Country, Postcode, UserID) VALUES ($1, $2, $3) RETURNING AddressID',
        condition: (inputObject) => (typeof inputObject['location'] === 'object'),
        values: [
            (inputObject) => inputObject['location']['country'],
            (inputObject) => inputObject['location']['postcode'],
            {from_input: 'accountID'},
        ],
    },
    create_listing: {
        text: 'INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ListingID',
        values: [
            {from_input: 'accountID'},
            {from_input: 'title'},
            {from_input: 'description'},
            {from_input: 'condition'},
            (inputObject, queryList) => {
                if (queryList.includes('create_address')) {
                    return res => res[0][0]['addressid'];
                } else {
                    return inputObject['location'];
                }
            },
            {from_input: 'category'},
        ],
    },
    // TODO add media support
}, ['create_address', 'create_listing'], {
    drop_from_results: ['create_address'],
    error_on_empty_response: true,
});

const sqlTemplatesDict = {
    'search-category': ListCategoryTemplate,
    'close-account': CloseAccountTemplate,
    'login': LoginTemplate,
    'view-accountListing': ViewAccountListingTemplate,
    'search-address': AddressTemplate,
    'view-listing': ViewListingTemplate,
    'search-listing': SearchListingTemplate,
    'create-listing': CreateListingTemplate,
};

module.exports = sqlTemplatesDict;

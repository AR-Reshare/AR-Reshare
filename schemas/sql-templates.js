const SQLTemplate = require('../classes/sqltemplate');

/**
 * Some things to bear in mind when creating these:
 *  1. Create queries should always return in their final row the IDs of the accounts who are affected by this change
 *  2. Postgres automatically converts to lower case, if you want to preserve case use AS "caseSensitiveVersion"
 */

const ListCategoryTemplate = new SQLTemplate({
    get_categories: {
        text: 'SELECT CategoryID AS "categoryID", CategoryName AS "categoryName", Icon, Colour, Prompt, ParentCategory AS "parentCategoryID" FROM Category',
    }
}, ['get_categories']);

const CreateAccountTemplate = new SQLTemplate({
    create_account: {
        text: 'INSERT INTO Account (FullName, Email, Passhash, DoB) VALUES ($1, $2, $3, $4) ON CONFLICT (Email) DO NOTHING RETURNING UserID ',
        values: [
            {from_input: 'name'},
            {from_input: 'email'},
            {from_input: 'passhash'},
            {from_input: 'dob'},
        ]
    },
    store_address: {
        text: 'INSERT INTO Address (Country, Region, Postcode, UserID) VALUES ($1, $2, $3, $4) RETURNING AddressID',
        condition: (inputObject) => ('address' in inputObject),
        values: [
            (inputObject) => inputObject['address']['country'],
            (inputObject) => inputObject['address']['region'],
            (inputObject) => inputObject['address']['postcode'],
            {from_query: ['create_account', 'userid']},
        ]
    }
}, ['create_account', 'store_address'], {
    drop_from_results: ['store_address'],
    error_on_empty_response: true,
});

const CloseAccountTemplate = new SQLTemplate({
    close_account: {
        text: 'UPDATE Account SET DeletionDate = CURRENT_TIMESTAMP WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        values: [{
            from_input: 'accountID',
        }],
    },
    close_listings: {
        text: 'UPDATE Listing SET ClosedDate = CURRENT_TIMESTAMP WHERE ContributorID = $1',
        values: [{
            from_input: 'accountID',
        }],
    },
    close_conversations: {
        text: 'UPDATE Conversation SET ClosedDate = CURRENT_TIMESTAMP WHERE ReceiverID = $1 OR EXISTS (SELECT 1 FROM Listing WHERE ListingID = Conversation.ListingID AND ContributorID = $1)',
        values: [{
            from_input: 'accountID',
        }],
    },
}, ['close_account', 'close_listings', 'close_conversations'], {drop_from_results: ['close_listings', 'close_conversations'], error_on_empty_response: true});

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
        text: 'SELECT ListingID, ContributorID, Title, Description, Condition, AddressID, CategoryID, CreationDate, ModificationDate, ClosedDate, ReceiverID FROM Listing WHERE ListingID = $1 AND (ContributorID = $2 OR ReceiverID = $2)',
        values: [{
            from_input: 'listingID',
        }, {
            from_input: 'accountID',
        }]
    },
    get_location: {
        text: 'SELECT Country, Region, Postcode FROM Address WHERE AddressID = $1',
        values: [{
            from_query: ['get_listing', 'addressid'],
        }]
    },
    get_media: {
        text: 'SELECT MimeType, URL FROM Media WHERE ListingID = $1 ORDER BY Index',
        values: [{
            from_input: 'listingID',
        }]
    }
}, ['get_listing', 'get_location', 'get_media'], {error_on_empty_response: true});

const SearchAccountListingTemplate = new SQLTemplate({
    get_listing: {
        text: 'SELECT Listing.ListingID AS "listingID", Title, Description, Condition, CategoryID AS "categoryID", Country, Region, PostCode, MimeType, URL FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID LEFT JOIN Media ON Media.MediaID = (SELECT Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index LIMIT 1) WHERE (CategoryID = $2 OR $2 IS NULL) AND ContributorID = $1 ORDER BY Listing.ListingID LIMIT $3 OFFSET $4',
        values: [
            {from_input: 'accountID'},
            {from_input: 'categoryID'},
            {from_input: 'maxResults'},
            {from_input: 'startResults'},
        ],
    }
}, ['get_listing']);

const AddressTemplate = new SQLTemplate({
    get_addresses: {
        text: 'SELECT AddressID AS "addressID", Country, Region, Postcode FROM Address WHERE UserID = $1',
        values: [{
            from_input: 'accountID',
        }],
    },
}, ['get_addresses']);

const ViewListingTemplate = new SQLTemplate({
    get_listing: {
        text: 'SELECT ListingID, ContributorID, Title, Description, Condition, AddressID, CategoryID, CreationDate, ModificationDate FROM Listing WHERE ListingID = $1 AND ClosedDate IS NULL',
        values: [{
            from_input: 'listingID',
        }]
    },
    get_location: {
        text: 'SELECT Country, Region, Postcode FROM Address WHERE AddressID = $1',
        values: [{
            from_query: ['get_listing', 'addressid'],
        }]
    },
    get_media: {
        text: 'SELECT MimeType, URL FROM Media WHERE ListingID = $1 ORDER BY Index',
        values: [{
            from_input: 'listingID',
        }]
    }
}, ['get_listing', 'get_location', 'get_media'], {error_on_empty_response: true});

const SearchListingTemplate = new SQLTemplate({
    get_listing: {
        text: 'SELECT Listing.ListingID AS "listingID", Title, Description, Condition, CategoryID AS "categoryID", Country, Region, PostCode, MimeType, URL FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID LEFT JOIN Media ON Media.MediaID = (SELECT Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index LIMIT 1) WHERE (CategoryID = $2 OR $2 IS NULL) AND (Region = $3 OR $3 IS NULL) AND ClosedDate IS NULL AND (ContributorID != $1 OR $1 IS NULL) ORDER BY Listing.ListingID LIMIT $4 OFFSET $5',
        values: [
            {from_input: 'accountID'},
            {from_input: 'categoryID'},
            {from_input: 'region'},
            {from_input: 'maxResults'},
            {from_input: 'startResults'},
        ],
    },
}, ['get_listing']);

const CreateListingTemplate = new SQLTemplate({
    create_address: {
        text: 'INSERT INTO Address (Country, Region, Postcode, UserID) VALUES ($1, $2, $3, $4) RETURNING AddressID',
        condition: (inputObject) => (typeof inputObject['location'] === 'object'),
        values: [
            (inputObject) => inputObject['location']['country'],
            (inputObject) => inputObject['location']['region'],
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
            {from_input: 'categoryID'},
        ],
    },
    // TODO add media support
}, ['create_address', 'create_listing'], {
    drop_from_results: ['create_address'],
    error_on_empty_response: true,
});

const CloseListingTemplate = new SQLTemplate({
    close_listing: {
        text: 'UPDATE Listing SET ClosedDate = CURRENT_TIMESTAMP, ReceiverID = $3 WHERE ContributorID = $1 AND ClosedDate IS NULL AND ListingID = $2 RETURNING ListingID',
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'receiverID'},
        ]
    },
    close_conversations: {
        text: 'UPDATE Conversation SET ClosedDate = CURRENT_TIMESTAMP WHERE ListingID = $1',
        values: [
            {from_query: ['close_listing', 'listingid']},
        ]
    },
}, ['close_listing', 'close_conversations'], {drop_from_results: ['close_conversations'], error_on_empty_response: true});

const CreateConversationTemplate = new SQLTemplate({
    create_conversation: {
        text: 'INSERT INTO Conversation (ReceiverID, ListingID) SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM Listing WHERE ListingID = $2 AND ClosedDate IS NULL AND ContributorID != $1) RETURNING ConversationID',
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
        ],
    }
}, ['create_conversation'], {error_on_empty_response: true});

const CloseConversationTemplate = new SQLTemplate({
    close_conversation: {
        text: 'UPDATE Conversation SET ClosedDate = CURRENT_TIMESTAMP WHERE ConversationID = $2 AND ClosedDate IS NULL AND (ReceiverID = $1 OR EXISTS (SELECT 1 FROM Listing WHERE ListingID = Conversation.ListingID AND ContributorID = $1)) RETURNING ConversationID',
        values: [
            {from_input: 'accountID'},
            {from_input: 'conversationID'},
        ]
    }
}, ['close_conversation'], {error_on_empty_response: true});

const CreateMessageTemplate = new SQLTemplate({
    create_message: {
        text: 'INSERT INTO Message (SenderID, ConversationID, ContentText) SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM Conversation JOIN Listing ON Listing.ListingID = Conversation.ListingID WHERE ConversationID = $2 AND Conversation.ClosedDate IS NULL AND (Conversation.ReceiverID = $1 OR Listing.ContributorID = $1)) RETURNING MessageID',
        values: [
            {from_input: 'accountID'},
            {from_input: 'conversationID'},
            {from_input: 'textContent'},
        ],
    },
}, ['create_message'], {error_on_empty_response: true});

const sqlTemplatesDict = {
    'search-category': ListCategoryTemplate,
    'create-account': CreateAccountTemplate,
    'close-account': CloseAccountTemplate,
    'login': LoginTemplate,
    'view-accountListing': ViewAccountListingTemplate,
    'search-accountListing': SearchAccountListingTemplate,
    'search-address': AddressTemplate,
    'view-listing': ViewListingTemplate,
    'search-listing': SearchListingTemplate,
    'create-listing': CreateListingTemplate,
    'close-listing': CloseListingTemplate,
    'create-conversation': CreateConversationTemplate,
    'close-conversation': CloseConversationTemplate,
    'create-message': CreateMessageTemplate,
};

module.exports = sqlTemplatesDict;

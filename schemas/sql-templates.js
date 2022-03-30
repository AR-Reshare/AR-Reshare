const SQLTemplate = require('../classes/sqltemplate');

/******************************************** START OF SCHEMAS ********************************************/

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
    },
    insert_pfp: {
        text: 'INSERT INTO Media (MimeType, URL, UserID) VALUES ($1, $2, $3) RETURNING MediaID',
        condition: (inputObject) => ('url' in inputObject),
        values: [
            {from_input: 'mimetype'},
            {from_input: 'url'},
            {from_query: ['create_account', 'userid']},
        ],
    }
}, ['create_account', 'store_address', 'insert_pfp'], {
    drop_from_results: ['store_address', 'insert_pfp'],
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

const ModifyAccountTemplate = new SQLTemplate({
    change_name: {
        text: 'UPDATE Account SET FullName = $2 WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        condition: (inputObject) => ('name' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'name'},
        ],
    },
    change_email: {
        text: 'UPDATE Account SET Email = $2 WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        condition: (inputObject) => ('email' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'email'},
        ]
    },
    change_password: {
        text: 'UPDATE Account SET PassHash = $2 WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        condition: (inputObject) => ('passhash' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'passhash'},
        ]
    },
    change_dob: {
        text: 'UPDATE Account SET DoB = $2 WHERE UserID = $1 AND DeletionDate IS NULL RETURNING UserID',
        condition: (inputObject) => ('dob' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'dob'},
        ]
    },
    change_pfp: {
        text: 'INSERT INTO Media (MimeType, URL, UserID) VALUES ($2, $3, $1) ON CONFLICT (UserID) DO UPDATE SET MimeType = EXCLUDED.MimeType, URL = EXCLUDED.URL RETURNING MediaID',
        condition: (inputObject) => ('mimetype' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'mimetype'},
            {from_input: 'url'},
        ]
    },
}, ['change_name', 'change_email', 'change_password', 'change_dob', 'change_pfp'], {
    error_on_empty_transaction: true,
    error_on_empty_response: true,
});

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

const ViewAccountTemplate = new SQLTemplate({
    get_account: {
        text: 'SELECT UserID, FullName AS "name" FROM Account WHERE UserID = $1 AND DeletionDate IS NULL',
        values: [{
            from_input: 'userID',
        }],
    },
    get_picture: {
        text: 'SELECT MimeType AS "pfpmimetype", URL AS "pfpurl" FROM Media WHERE UserID = $1',
        values: [{
            from_query: ['get_account', 'userid'],
        }],
    },
    get_listings: {
        text: 'SELECT Listing.ListingID AS "listingID", Title, Description, Condition, CategoryID AS "categoryID", Country, Region, PostCode, MimeType, URL FROM Listing INNER JOIN Address ON Listing.AddressID = Address.AddressID LEFT JOIN Media ON Media.MediaID = (SELECT Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index LIMIT 1) WHERE ClosedDate IS NULL AND ContributorID = $1 ORDER BY Listing.ListingID LIMIT $2 OFFSET $3',
        values: [
            {from_query: ['get_account', 'userid']},
            {from_input: 'maxResults'},
            {from_input: 'startResults'},
        ],
    }
}, ['get_account', 'get_picture', 'get_listings'], {error_on_empty_response: true});

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
    insert_media: {
        text: 'INSERT INTO Media (MimeType, URL, Index, ListingID) VALUES ($1, $2, $3, $4) RETURNING MediaID',
        condition: (inputObject) => ('url' in inputObject),
        times: (inputObject) => (inputObject['url'].length),
        values: [
            {from_input: 'mimetype'},
            {from_input: 'url'},
            {from_input: 'media_index'},
            {from_query: ['create_listing', 'listingid']},
        ],
    }
}, ['create_address', 'create_listing', 'insert_media'], {
    drop_from_results: ['create_address', 'insert_media'],
    error_on_empty_response: true,
});

const ModifyListingTemplate = new SQLTemplate({
    create_address: {
        text: 'INSERT INTO Address (Country, Region, Postcode, UserID) VALUES ($1, $2, $3, $4) RETURNING AddressID',
        condition: (inputObject) => ('location' in inputObject && typeof inputObject['location'] === 'object'),
        values: [
            (inputObject) => inputObject['location']['country'],
            (inputObject) => inputObject['location']['region'],
            (inputObject) => inputObject['location']['postcode'],
            {from_input: 'accountID'},
        ],
    },
    change_title: {
        text: 'UPDATE Listing SET Title = $3 WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL RETURNING ListingID',
        condition: (inputObject) => ('title' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'title'},
        ]
    },
    change_description: {
        text: 'UPDATE Listing SET Description = $3 WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL RETURNING ListingID',
        condition: (inputObject) => ('description' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'description'},
        ]
    },
    change_location: {
        text: 'UPDATE Listing SET AddressID = $3 WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL RETURNING ListingID',
        condition: (inputObject) => ('location' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            (inputObject, queryList) => {
                if (queryList.includes('create_address')) {
                    return res => res[0][0]['addressid'];
                } else {
                    return inputObject['location'];
                }
            },
        ]
    },
    change_category: {
        text: 'UPDATE Listing SET CategoryID = $3 WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL RETURNING ListingID',
        condition: (inputObject) => ('categoryID' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'categoryID'},
        ]
    },
    change_condition: {
        text: 'UPDATE Listing SET Condition = $3 WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL RETURNING ListingID',
        condition: (inputObject) => ('condition' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'condition'},
        ]
    },
    change_media: {
        text: 'INSERT INTO Media (MimeType, URL, Index, ListingID) SELECT $3, $4, $5, $2 FROM Listing WHERE ContributorID = $1 AND ListingID = $2 AND ClosedDate IS NULL ON CONFLICT (Index, ListingID) DO UPDATE SET MimeType = EXCLUDED.MimeType, URL = EXCLUDED.URL RETURNING MediaID',
        condition: (inputObject) => ('url' in inputObject),
        times: (inputObject) => (inputObject['url'].length),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            {from_input: 'mimetype'},
            {from_input: 'url'},
            {from_input: 'media_index'},
        ],
    },
    drop_extra_media: {
        text: 'DELETE FROM Media WHERE ListingID = $2 AND (SELECT EXISTS (SELECT 1 FROM Listing WHERE ListingID = $2 AND ContributorID = $1 AND ClosedDate IS NULL)) AND Index >= $3',
        condition: (inputObject) => ('url' in inputObject),
        values: [
            {from_input: 'accountID'},
            {from_input: 'listingID'},
            (inputObject) => (inputObject['url'].length),
        ]
    }
}, ['create_address', 'change_title', 'change_description', 'change_location', 'change_category', 'change_condition', 'change_media', 'drop_extra_media'], {
    error_on_empty_transaction: true,
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
    insert_media: {
        text: 'INSERT INTO Media (MimeType, URL, MessageID) VALUES ($1, $2, $3) RETURNING MediaID',
        condition: (inputObject) => ('url' in inputObject),
        values: [
            {from_input: 'mimetype'},
            {from_input: 'url'},
            {from_query: ['create_message', 'messageid']},
        ],
    }
}, ['create_message', 'insert_media'], {drop_from_results: ['insert_media'], error_on_empty_response: true});

const ListConversationTemplate = new SQLTemplate({
    get_conversations: {
        text: 'SELECT Conversation.ConversationID AS "conversationID", Listing.ListingID AS "listingID", Listing.Title AS "title", Receiver.UserID AS "receiverID", Receiver.FullName AS "receiverName", Media.MimeType AS "mimetype", Media.URL AS "url", Contributor.UserID AS "contributorID", Contributor.FullName AS "contributorName" FROM Conversation JOIN Listing ON Listing.ListingID = Conversation.ListingID JOIN Account AS Receiver ON Conversation.ReceiverID = Receiver.UserID JOIN Account AS Contributor ON Listing.ContributorID = Contributor.UserID LEFT JOIN Media ON Media.MediaID = (SELECT Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index LIMIT 1) WHERE (Contributor.UserID = $1 OR Receiver.UserID = $1) AND Conversation.ClosedDate IS NULL ORDER BY ConversationID OFFSET $2 LIMIT $3',
        values: [
            {from_input: 'accountID'},
            {from_input: 'startResults'},
            {from_input: 'maxResults'},
        ]
    }
}, ['get_conversations']);

const ViewConversationTemplate = new SQLTemplate({
    get_conversation: {
        text: 'SELECT Conversation.ConversationID AS "conversationID", Listing.ListingID AS "listingID", Listing.Title AS "title", Receiver.UserID AS "receiverID", Receiver.FullName AS "receiverName", Media.MimeType AS "mimetypeMain", Media.URL AS "urlMain", Contributor.UserID AS "contributorID", Contributor.FullName AS "contributorName", Conversation.ClosedDate AS "closedDate" FROM Conversation JOIN Listing ON Listing.ListingID = Conversation.ListingID JOIN Account AS Receiver ON Conversation.ReceiverID = Receiver.UserID JOIN Account AS Contributor ON Listing.ContributorID = Contributor.UserID LEFT JOIN Media ON Media.MediaID = (SELECT Media.MediaID FROM Media WHERE ListingID = Listing.ListingID ORDER BY Index LIMIT 1) WHERE ConversationID = $2 AND (Contributor.UserID = $1 OR Receiver.UserID = $1)',
        values: [
            {from_input: 'accountID'},
            {from_input: 'conversationID'},
        ],
    },
    get_messages: {
        text: 'SELECT SenderID AS "senderID", SentTime AS "sentTime", ContentText AS "textContent", Mimetype AS "mediaContentMimetype", URL AS "mediaContent" FROM Message LEFT JOIN Media ON Media.MessageID = Message.MessageID WHERE ConversationID = $1 ORDER BY SentTime DESC OFFSET $2 LIMIT $3',
        values: [
            {from_query: ['get_conversation', 'conversationID']},
            {from_input: 'startResults'},
            {from_input: 'maxResults'},
        ],
    },
}, ['get_conversation', 'get_messages'], {error_on_empty_response: true});

/********************************************* END OF SCHEMAS *********************************************/

/**
 * Schema dictionary
 */
const sqlTemplatesDict = {
    'search-category': ListCategoryTemplate,
    'create-account': CreateAccountTemplate,
    'close-account': CloseAccountTemplate,
    'login': LoginTemplate,
    'modify-account': ModifyAccountTemplate,
    'view-accountListing': ViewAccountListingTemplate,
    'search-accountListing': SearchAccountListingTemplate,
    'search-address': AddressTemplate,
    'view-account': ViewAccountTemplate,
    'view-listing': ViewListingTemplate,
    'search-listing': SearchListingTemplate,
    'create-listing': CreateListingTemplate,
    'modify-listing': ModifyListingTemplate,
    'close-listing': CloseListingTemplate,
    'create-conversation': CreateConversationTemplate,
    'close-conversation': CloseConversationTemplate,
    'create-message': CreateMessageTemplate,
    'search-conversation': ListConversationTemplate,
    'view-conversation': ViewConversationTemplate,
};

module.exports = sqlTemplatesDict;

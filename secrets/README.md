### Secrets Folder

This folder is a place to store the private-keys, api-keys and configs which contain those.

The sensitive information required by our application is listed below:

- JWT Encryption Key
  - Our current token-based auth uses symmetric key encryption--> Therefore there is only one key
- DB Connection Config (incl. password)
  - Our current implementation uses a randomly generated 32 byte string password
- Email Respond (Transactional Email)
  - Our current implementation sends SMTP email requests to SendGrid --> Configuration file that includes api-key
- Push Notifications (FCM-Messaging)
  - This requires us to have a Service Account SDK to authorize requests to the FCM backend service - Configuration file that includes api-key
  - NOTE: There exists a google-services.json that can be downloaded -- however this is for the Android client, not for our backend-service
- Media Handler (Cloudinary)
  - This requires an API Key in order to interact with the Cloudinary backend service

#### Generating Secrets

##### Secrets that are generated by setup

- JWT Encryption Key (Symmetric) 
  - Generated when running npm setup scripts
  - The key is stored in secrets/jwtsymmetric.key
- DB Connection Config
  - Generated when running npm setup scripts
  - The config is stored in secrets/dbconnection.json
- DB Hashing
  - Salt - TODO
  - Pepper - TODO

##### Secrets that the admin/user needs to setup

- Transaction Email (SendGrid)
  1. Create an account or login with https://sendgrid.com
  2. Follow the instructions at https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api in order to generate an API-Key
  3. Update secrets/emailConfig.conf boilerplate with the corresponding API-Key in the api-key attribute
- Push Notifications (FCM)
  1. Login to https://firebase.google.com/
  2. Go to the console https://console.firebase.google.com/
  3. Download the servicesAccount file for FCM Admin SDK https://console.firebase.google.com/project/${projectID}/settings/serviceaccounts/adminsdk
  4. Store the file as secrets/firebaseServiceAccount.json
- Media Handling (Cloudinary)
  1. TODO: ...

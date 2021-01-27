# CDP Web SDK

## Build and Dev
From the project's directory:

`npm install`

`npm run build`

## Test
To run all tests: 

`npm run test`

Get access to the details of the coverage report by opening `index.html` in the `Coverage` folder by a browser.

## Browser Support
ES5 compliant browsers are supported: https://kangax.github.io/compat-table/es5/

The default setting for browserslist is being used. This targets the last two versions of browsers with at least 0.5% of market share.

## Usage

### Configure the SDK

After building the SDK (it will generate `cdp-web-sdk.js` in the `bin` folder), add that to the head tag of your website.

```javascript
<script type="application/javascript" src="cdp-web-sdk.js"></script>
``` 

A sample code for adding event listener.

```javascript
window.addEventListener('load', (event) => {
    const CONFIG = {
        client: {
               "appSourceId": "app source id as guid",
               "beaconEndpoint": "http://server.internal:8080/web/events",
               "authEndpoint": "http://server.internal:8080/web/authentication"
            }
        };

    CDP.configure(CONFIG);
});
```

List of CDP Client Configuration parameters are described in the following table. The parameters that are not optional needs to be provided be the user. 

| Field Name                         | Type    | Default     | Required | Description                                                                                                                                                                |
|------------------------------------|---------|-------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| appSourceId                        | String  |             | yes      | Get this value from your CDP admin                                                                                                                                         |
| beaconEndpoint                     | String  |             | yes      | The `beaconEndpoint` structure is `http://<TSE>/web/events`. Get the Tenant Specific Endpoint (TSE) value from your CDP admin.                                             |
| authEndpoint                       | String  |             | yes      | The `authEndpoint` structure is `http://<TSE>/web/authentication` . Get the Tenant Specific Endpoint (TSE) value from your CDP admin.                                      |
| deviceId                           | String  |             | no       | `deviceId` can also be defined in the client configuration if needed, otherwise the identifier created and managed by the SDK will be used.                                |
| sessionId                          | String  |             | no       | `sessionId` will be automatically populated by Web SDK and no need to be defined by the user                                                                               |
| consentEventTypeName               | String  | consent-log | no       | This parameter set the name of the Consent Event Type.                                                                                                                     |
| consentEventCategoryName           | String  | Consent     | no       | This parameter set the category name of the Consent Event.                                                                                                                     |
| retryAttempts                      | Integer | 3           | no       | This parameter is the number of retry attempts in case of failing sending events to the Beacon service.                                                                    |
| retryDelayMS                       | Integer | 3000        | no       | This parameter is the delay duration between retry attempts (milliseconds) in case of failing sending events to the Beacon service.                                        |

### Get configuration object
```javascript
CDP.getConfiguration()
```

### Grab parameters from the url
```javascript
CDP.getUrlParam('trackingId')
```

### Send Events
```javascript
CDP.sendEvent("engagement", "ProductView", productData)
```
In this example a product view engagement event is being sent. 
The product data can come from the DOM, data objects, url parameters, or any combination of those sources. The required fields for all CDP events will be populated by the SDK and combined with the provided event data.

By default the SDK will send events with `GET`, but if the event payload exceeds 1024 characters a `POST` with the content type of `application/x-www-form-urlencoded` will be performed instead.

### Manage Consent
These functions should be used in callbacks from the client's consent management system. The cookie stored by the SDK cannot be used to manage consent for a client's website. The SDK only cares to know if consent has been granted so it can send events.

```javascript
CDP.consentOptIn();
```
Grant consent to the SDK to allow events to emit. It will send the CDP consent opt in event and also create a cookie signifying the user opted in. On subsequent page loads the presence of this cookie will allow events to begin transmitting immediately. 

```javascript
CDP.consentOptOut();
```
Removes consent, stops events from being sent. The cookie will be removed and events will stop emitting immediately.

*Note:* When testing out this functionality in a browser ensure that any option to "Continue where you left off" when the browser is closed is turned OFF. If that feature is enabled the CustomerConsentCookie session cookie will persist after closing and reopening the browser.

### Set Log Level
There are four different levels of log:

- **none**: no log
- **all**: all the logs (errors, warning, and info)
- **error**: only errors
- **debug**: errors and warnings

Log level by default is **none**. It can be changed by calling the following method:

```javascript
CDP.setLogLevel('all')
```
